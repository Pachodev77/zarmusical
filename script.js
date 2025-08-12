// Disco lights background animation
(function() {
    const colors = [
        '#ff0040', // rojo
        '#00eaff', // azul celeste
        '#39ff14', // verde
        '#ffe600', // amarillo
        '#a200ff', // violeta
        '#ffffff'  // blanco
    ];
    const canvas = document.getElementById('disco-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;

    function resizeCanvas() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Configuración de luces
    const NUM_LIGHTS = 18;
    const lights = [];
    // Distribución en cuadrícula aleatorizada (jittered grid)
    const gridCols = Math.ceil(Math.sqrt(NUM_LIGHTS * W / H));
    const gridRows = Math.ceil(NUM_LIGHTS / gridCols);
    let lightIndex = 0;
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            if (lightIndex >= NUM_LIGHTS) break;
            // Espacio de celda
            const cellW = W / gridCols;
            const cellH = H / gridRows;
            // Posición centrada en la celda pero con jitter
            const jitterX = (Math.random() - 0.5) * cellW * 0.7;
            const jitterY = (Math.random() - 0.5) * cellH * 0.7;
            const x = (col + 0.5) * cellW + jitterX;
            const y = (row + 0.5) * cellH + jitterY;
            lights.push({
                x,
                y,
                r: 80 + Math.random() * 120,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 0.4 + Math.random() * 0.4,
                dx: (Math.random() - 0.5) * 3,
                dy: (Math.random() - 0.5) * 3,
                flashTimer: Math.random() * 100
            });
            lightIndex++;
        }
    }

    function updateLights() {
        for (let l of lights) {
            // Movimiento
            l.x += l.dx;
            l.y += l.dy;
            if (l.x < 0 || l.x > W) l.dx *= -1;
            if (l.y < 0 || l.y > H) l.dy *= -1;
            // Cambios bruscos de color y tamaño
            if (Math.random() < 0.03) {
                l.color = colors[Math.floor(Math.random() * colors.length)];
                l.r = 80 + Math.random() * 120;
                l.dx = (Math.random() - 0.5) * 3;
                l.dy = (Math.random() - 0.5) * 3;
            }
            // Flashes aleatorios
            l.flashTimer -= 1;
            if (l.flashTimer < 0) {
                l.alpha = 0.8 + Math.random() * 0.7;
                l.flashTimer = 30 + Math.random() * 80;
            } else if (l.alpha > 0.5) {
                l.alpha -= 0.05;
            } else {
                l.alpha = 0.4 + Math.random() * 0.4;
            }
        }
    }

    function drawLights() {
        ctx.clearRect(0, 0, W, H);
        for (let l of lights) {
            ctx.save();
            ctx.globalAlpha = l.alpha;
            let grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
            grad.addColorStop(0, l.color);
            grad.addColorStop(0.3, l.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath();
            ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        }
    }

    function animate() {
        updateLights();
        drawLights();
        requestAnimationFrame(animate);
    }
    animate();
})();

document.addEventListener('DOMContentLoaded', () => {
    let playlists = {};

    // Definir categorías al inicio
    const categories = ['urbano', 'latino', 'electro'];

    // Inicializar playlists con valores por defecto
    playlists = categories.reduce((acc, cat) => ({
        ...acc,
        [cat]: []
    }), {});

    async function fetchPlaylists() {
        try {
            console.log('Fetching songs from /api/songs...');
            const response = await fetch('/api/songs');
            const data = await response.json();
            console.log('API Response:', JSON.stringify(data, null, 2));
            
            // Verificar si recibimos datos válidos
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid response format');
            }
            // Reescribir URLs de Cloudinary para pasar por el proxy
            // y manejar el prefijo 'music/' en los nombres de categoría
            const processedPlaylists = {};
            Object.keys(data).forEach(cat => {
                // Eliminar el prefijo 'music/' si existe
                const cleanCat = cat.replace(/^music\//, '');
                if (Array.isArray(data[cat]) && data[cat].length > 0) {
                    processedPlaylists[cleanCat] = data[cat].map(song => {
                        if (song.src && song.src.includes('res.cloudinary.com')) {
                            song.src = `/api/proxy_audio?url=${encodeURIComponent(song.src)}`;
                        }
                        return song;
                    });
                    console.log(`Loaded ${processedPlaylists[cleanCat].length} songs for category: ${cleanCat}`);
                } else {
                    processedPlaylists[cleanCat] = [];
                    console.warn(`No songs found for category: ${cat}`);
                }
            });
            playlists = processedPlaylists;
            return processedPlaylists; // Devolver playlists procesadas
        } catch (error) {
            console.error('Error fetching playlists:', error);
            throw error; // Propagar el error para que el llamante lo maneje
        }
    }
    let currentCategoryIndex = 0; // Track current category index
    let currentCategory = null;
    let currentSongIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let isRepeat = false;

    // Variables globales
    let audio = null;
    let audioContext = null;
    let analyzer = null;
    let dataArray = null;
    let animationId = null;
    let visualizerRunning = false;
    let audioContextInitialized = false;

    // --- SHUFFLE STATE ---
    let shuffleOrder = [];
    let shufflePointer = 0;
    function generateShuffleOrder(length) {
        const arr = Array.from({length}, (_, i) => i);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    function resetShuffleForCurrentPlaylist() {
        shuffleOrder = generateShuffleOrder(playlists[currentPlaylist]?.length || 0);
        shufflePointer = 0;
    }

    // Initialize audio element if not already done
    if (!audio) {
        audio = document.getElementById('audio-fallback');
        if (!audio) {
            audio = new Audio();
            audio.id = 'audio-fallback';
            document.body.appendChild(audio);
        }
        // Set CORS attribute to allow audio analysis
        audio.crossOrigin = 'anonymous';
        
        // Set up audio event listeners
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', nextSong);
        audio.addEventListener('error', (e) => {
            console.error('Audio element error:', e);
        });
        
        // Log audio element properties for debugging
        console.log('Audio element initialized with:', {
            crossOrigin: audio.crossOrigin,
            canPlayType: {
                'audio/mp3': audio.canPlayType('audio/mp3'),
                'audio/mpeg': audio.canPlayType('audio/mpeg'),
                'audio/ogg': audio.canPlayType('audio/ogg'),
                'audio/wav': audio.canPlayType('audio/wav')
            }
        });
    }
    
    // Audio context variables - will be initialized on first use
    let source, bufferLength;
    
    // Function to initialize audio context on first user interaction
    async function initializeAudioContext() {
        try {
            if (!audioContext) {
                // Create audio context
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContext = new AudioContext();
                
                // Create analyzer node
                analyzer = audioContext.createAnalyser();
                analyzer.fftSize = 2048;
                
                // Create source from audio element
                source = audioContext.createMediaElementSource(audio);
                source.connect(analyzer);
                analyzer.connect(audioContext.destination);
                
                // Set up data array for visualization
                bufferLength = analyzer.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);
                
                console.log('AudioContext initialized successfully');
            }
            
            // Resume audio context if it was suspended
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
                console.log('AudioContext resumed');
            }
            
            audioContextInitialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing AudioContext:', error);
            audioContextInitialized = false;
            return false;
        }
    }

    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const progressBar = document.getElementById('progress-bar');
    const volumeSlider = document.getElementById('volume-slider');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const albumCover = document.getElementById('album-cover');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const playlistElement = document.getElementById('playlist');
    const visualizer = document.getElementById('visualizer');
    const visualizerCtx = visualizer.getContext('2d');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const zarMusicalTitle = document.getElementById('zar-musical-title');
    const titleSpans = zarMusicalTitle ? zarMusicalTitle.querySelectorAll('span') : [];

    function changeCategory(category, keepShuffle = false) {
        currentPlaylist = category;
        if (!playlists[currentPlaylist] || playlists[currentPlaylist].length === 0) {
            console.warn(`No songs found in category: ${category}`);
            return;
        }
        if (isShuffle && !keepShuffle) {
            resetShuffleForCurrentPlaylist();
            currentSongIndex = shuffleOrder[0] || 0;
            shufflePointer = 0;
        } else {
            currentSongIndex = 0;
        }
        // Render the playlist for the new category
        renderPlaylist();
        // Load and play the first song in the category
        loadSong(currentSongIndex);
        playSong(); // Autoplay when category changes
    }

    async function loadSong(songIndex) {
        // Verificar que exista la playlist y tenga canciones
        if (!playlists[currentPlaylist] || !playlists[currentPlaylist].length) {
            console.warn(`No songs available in playlist: ${currentPlaylist}`);
            return;
        }
        // Asegurarse de que el índice esté dentro de los límites
        const safeIndex = Math.max(0, Math.min(songIndex, playlists[currentPlaylist].length - 1));
        const song = playlists[currentPlaylist][safeIndex];
        
        if (!song) {
            console.warn(`Song not found at index ${songIndex} in playlist ${currentPlaylist}`);
            return;
        }
        
        try {
            // Actualizar la interfaz
            if (audio) {
                // Pausar el audio actual antes de cambiar la fuente
                await audio.pause();
                
                // Verificar la URL de origen
                if (!song.src) {
                    throw new Error('No source URL provided for the song');
                }
                
                console.log('Loading audio source:', song.src);
                
                // Verificar el tipo de archivo
                const audioExtension = song.src.split('.').pop().toLowerCase();
                const supportedFormats = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
                if (!supportedFormats.includes(audioExtension)) {
                    console.warn(`Unsupported audio format: ${audioExtension}`);
                }
                
                // Configurar la fuente de audio
                console.log('Setting audio source to:', song.src);
                
                // Helper function to get media error description
                function getMediaErrorDescription(errorCode) {
                    const errorTypes = {
                        1: 'MEDIA_ERR_ABORTED - The user canceled the fetching process.',
                        2: 'MEDIA_ERR_NETWORK - A network error occurred while fetching the media.',
                        3: 'MEDIA_ERR_DECODE - An error occurred while decoding the media.',
                        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - The media is not supported.'
                    };
                    return errorTypes[errorCode] || 'Unknown media error';
                }

                // Create a promise to handle the audio loading
                return new Promise((resolve, reject) => {
                    let resolved = false;
                    let rejected = false;
                    let timeoutId = null;
                    
                    const cleanup = () => {
                        if (timeoutId) clearTimeout(timeoutId);
                        audio.removeEventListener('error', errorHandler);
                        audio.removeEventListener('canplaythrough', canPlayThroughHandler);
                        audio.removeEventListener('loadeddata', loadedDataHandler);
                    };
                    
                    const safeResolve = () => {
                        if (!resolved && !rejected) {
                            resolved = true;
                            cleanup();
                            resolve();
                        }
                    };
                    
                    const safeReject = (error) => {
                        if (!resolved && !rejected) {
                            rejected = true;
                            cleanup();
                            reject(error);
                        }
                    };
                    
                    // Set up event handlers
                    const errorHandler = (e) => {
                        console.error('Audio element error:', {
                            error: audio.error,
                            networkState: audio.networkState,
                            readyState: audio.readyState,
                            src: audio.src,
                            event: e
                        });
                        
                        // Try to get more detailed error information
                        let errorDetails = 'Unknown error';
                        if (audio.error) {
                            errorDetails = `Code ${audio.error.code}: ${getMediaErrorDescription(audio.error.code)}`;
                        }
                        
                        safeReject(new Error(`Audio error: ${errorDetails}`));
                    };
                    
                    const canPlayThroughHandler = () => {
                        console.log('Can play through audio');
                        safeResolve();
                    };
                    
                    const loadedDataHandler = () => {
                        console.log('Audio loaded data event fired, readyState:', audio.readyState);
                        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or greater
                            safeResolve();
                        }
                    };
                    
                    // Set up event listeners
                    audio.addEventListener('error', errorHandler);
                    audio.addEventListener('canplaythrough', canPlayThroughHandler);
                    audio.addEventListener('loadeddata', loadedDataHandler);
                    
                    // For testing: Use direct Cloudinary URL instead of proxy
                    // Extract the actual Cloudinary URL from the proxy URL
                    let audioUrl = song.src;
                    if (audioUrl.includes('/api/proxy_audio?url=')) {
                        // Extract the encoded URL from the proxy URL
                        const urlMatch = audioUrl.match(/url=([^&]+)/);
                        if (urlMatch && urlMatch[1]) {
                            audioUrl = decodeURIComponent(urlMatch[1]);
                            console.log('Using direct Cloudinary URL:', audioUrl);
                        }
                    }
                    
                    // Add cache buster to prevent caching issues
                    const cacheBuster = `t=${Date.now()}`;
                    const separator = audioUrl.includes('?') ? '&' : '?';
                    audio.src = `${audioUrl}${separator}${cacheBuster}`;
                    
                    // Log the final URL for debugging
                    console.log('Final audio source URL:', audio.src);
                    
                    // Set appropriate MIME type based on file extension
                    const extension = audioUrl.split('.').pop().toLowerCase();
                    if (extension === 'mp3') {
                        audio.type = 'audio/mpeg';
                    } else if (extension === 'wav') {
                        audio.type = 'audio/wav';
                    } else if (extension === 'ogg') {
                        audio.type = 'audio/ogg';
                    } else if (extension === 'm4a') {
                        audio.type = 'audio/mp4';
                    } else {
                        console.warn('Unknown audio format, using default MIME type');
                        audio.type = 'audio/mpeg';
                    }
                    
                    audio.preload = 'auto';
                    
                    // Fallback in case events don't fire as expected
                    timeoutId = setTimeout(() => {
                        console.log('Audio loading timeout check, readyState:', audio.readyState);
                        if (audio.readyState >= 2) {
                            console.log('Fallback: Audio readyState is', audio.readyState);
                            safeResolve();
                        } else if (audio.readyState > 0) {
                            console.warn('Audio loading taking too long, but has some data. ReadyState:', audio.readyState);
                            safeResolve();
                        } else {
                            console.warn('Audio loading timeout with no data');
                            safeReject(new Error('Audio loading timeout - no data received'));
                        }
                    }, 10000); // 10 second timeout
                    
                    // Start loading the audio
                    audio.load();
                });
                
                try {
                    console.log('Starting audio load...');
                    await loadAudio();
                    
                    console.log('Audio source loaded successfully', {
                        readyState: audio.readyState,
                        networkState: audio.networkState,
                        error: audio.error,
                        src: audio.src
                    });
                    
                    // Resume audio context if needed
                    if (audioContext && audioContext.state === 'suspended') {
                        console.log('Resuming audio context after load...');
                        await audioContext.resume();
                        console.log('AudioContext resumed after source load');
                    }
                } catch (error) {
                    console.error('Error loading audio source:', {
                        error,
                        audioElement: {
                            readyState: audio.readyState,
                            networkState: audio.networkState,
                            error: audio.error,
                            src: audio.src
                        }
                    });
                    throw new Error(`Failed to load audio: ${error.message}`);
                }
            }
            
            // Actualizar la interfaz de usuario
            if (songTitle) songTitle.textContent = song.title || 'Título desconocido';
            if (songArtist) songArtist.textContent = song.artist || 'Artista desconocido';
            if (albumCover) albumCover.src = song.cover || 'https://via.placeholder.com/150';
            currentSongIndex = safeIndex;
            
            // Actualizar feedback visual en la playlist
            if (playlistElement) {
                Array.from(playlistElement.children).forEach((li, idx) => {
                    if (li) li.classList.toggle('active', idx === safeIndex);
                });
            }
        } catch (error) {
            console.error('Error loading song:', error);
            if (songTitle) songTitle.textContent = 'Error al cargar la canción';
            if (songArtist) songArtist.textContent = 'Intenta nuevamente';
        }
    }

    // Render the playlist visually
    function renderPlaylist() {
        if (!playlistElement) return;
        
        playlistElement.innerHTML = '';
        playlists[currentPlaylist].forEach((song, index) => {
            const li = document.createElement('li');
            li.textContent = song.title;
            if (index === currentSongIndex) {
                li.classList.add('active');
            }
            li.addEventListener('click', () => {
                loadSong(index);
                playSong();
            });
            playlistElement.appendChild(li);
        });
    }
    
    // Update play/pause button state
    function updatePlayPauseButton() {
        if (!playPauseBtn || !playIcon || !pauseIcon) return;
        
        if (isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    }

    // Play song function
    async function playSong() {
        if (!playlists[currentPlaylist] || !playlists[currentPlaylist].length) return;

        const song = playlists[currentPlaylist][currentSongIndex];
        if (!song) return;

        try {
            console.log('Audio element state before play:', {
                readyState: audio.readyState,
                networkState: audio.networkState,
                error: audio.error,
                paused: audio.paused,
                currentSrc: audio.currentSrc
            });

            // Initialize audio context on first play if not already done
            if (!audioContext) {
                console.log('Initializing audio context for first play...');
                await initializeAudioContext();
            }
            
            // Resume audio context if suspended
            if (audioContext.state === 'suspended') {
                console.log('AudioContext is suspended, resuming...');
                await audioContext.resume();
                console.log('AudioContext resumed successfully');
            }

            // Update UI
            const pauseIcon = document.getElementById('pause-icon');
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
            
            // Start visualizer if not already running
            if (!visualizerRunning) {
                console.log('Starting visualizer...');
                drawVisualizer();
            }

            // Attempt to play
            console.log('Calling audio.play()...');
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                await playPromise;
                console.log('Audio playback started successfully');
                isPlaying = true;
                updatePlayPauseButton();
            }
        } catch (error) {
            console.error('Error playing audio:', error);
            
            // Update UI on error
            if (songTitle) songTitle.textContent = 'Error al reproducir';
            if (songArtist) songArtist.textContent = 'Haz clic para intentar de nuevo';
            
            // Reset playback state
            isPlaying = false;
            playPauseBtn.classList.remove('playing');
            const playIcon = document.getElementById('play-icon');
            const pauseIcon = document.getElementById('pause-icon');
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            
            // Try to resume audio context if suspended
            if (audioContext && audioContext.state === 'suspended') {
                try {
                    await audioContext.resume();
                    console.log('AudioContext resumed after error');
                } catch (e) {
                    console.error('Error resuming audio context:', e);
                }
            }
        }
    }

    function pauseSong() {
        isPlaying = false;
        audio.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }

    function playPauseToggle() {
        if (!playlists[currentPlaylist]?.length) return;
        
        if (audio.paused) {
            playSong().catch(console.error);
        } else {
            pauseSong();
        }
    }

    function nextSong() {
        if (!playlists[currentPlaylist]?.length) return;
        
        if (isShuffle) {
            if (shufflePointer < shuffleOrder.length - 1) {
                shufflePointer++;
                currentSongIndex = shuffleOrder[shufflePointer];
            } else {
                currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
                changeCategory(categories[currentCategoryIndex], true);
                return;
            }
        } else {
            if (currentSongIndex >= playlists[currentPlaylist].length - 1) {
                if (!isRepeat) {
                    currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
                    changeCategory(categories[currentCategoryIndex]);
                    return;
                }
                currentSongIndex = 0;
            } else {
                currentSongIndex++;
            }
        }
        
        loadSong(currentSongIndex);
        if (isPlaying) playSong().catch(console.error);
    }

    function prevSong() {
        if (isShuffle) {
            if (shufflePointer > 0) {
                shufflePointer--;
                currentSongIndex = shuffleOrder[shufflePointer];
            } else {
                // Primer canción en el shuffle, no retrocede de género
                currentSongIndex = shuffleOrder[0];
            }
        } else {
            currentSongIndex = (currentSongIndex - 1 + playlists[currentPlaylist].length) % playlists[currentPlaylist].length;
        }
        loadSong(currentSongIndex);
        playSong();
    }

    function updateProgress() {
        const { duration, currentTime } = audio;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.value = progressPercent;

        currentTimeEl.textContent = formatTime(currentTime);
        totalTimeEl.textContent = formatTime(duration || 0);
    }

    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    let hue = 0;
    let titleHueOffset = 0;

    function animateTitleColors() {
        if (titleSpans.length === 0) return;

        titleHueOffset = (titleHueOffset + 5) % 360; // Faster color change for title

        titleSpans.forEach((span, index) => {
            const letterHue = (titleHueOffset + index * 30) % 360; // Different color for each letter
            span.style.color = `hsl(${letterHue}, 100%, 50%)`;
            span.style.textShadow = `0 0 10px hsl(${letterHue}, 100%, 50%)`;
        });
    }

    function drawVisualizer() {
        // Get visualizer canvas and context if not already set
        const visualizer = document.getElementById('visualizer');
        if (!visualizer) {
            console.warn('Visualizer canvas not found');
            return;
        }
        
        const visualizerCtx = visualizer.getContext('2d');
        if (!visualizerCtx) {
            console.warn('Could not get 2D context for visualizer');
            return;
        }
        
        // Check if analyzer and dataArray are ready
        if (!analyzer || !dataArray) {
            console.log('Visualizer: analyzer or dataArray not ready');
            animationId = requestAnimationFrame(drawVisualizer);
            return;
        }
        
        // Schedule next frame
        animationId = requestAnimationFrame(drawVisualizer);

        // Set canvas dimensions to match its displayed size
        visualizer.width = visualizer.offsetWidth;
        visualizer.height = visualizer.offsetHeight;

        // Update color cycle
        hue = (hue + 0.5) % 360;

        // Update CSS variables for dynamic coloring
        const primaryColor = `hsl(${hue}, 100%, 50%)`;
        const shadowColor = `hsla(${hue}, 100%, 50%, 0.5)`;
        const darkBackgroundColor = `hsl(${hue}, 30%, 10%)`;
        const lightBackgroundColor = `hsl(${hue}, 20%, 15%)`; // Slightly lighter for container
        const textColor = `hsl(${hue}, 10%, 90%)`; // Adjust text color for contrast

        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--shadow-color', shadowColor);
        document.documentElement.style.setProperty('--background-dark', darkBackgroundColor);
        document.documentElement.style.setProperty('--background-light', lightBackgroundColor);
        document.documentElement.style.setProperty('--text-color', textColor);

        // Animate title colors
        animateTitleColors();

        // Get frequency data
        analyzer.getByteFrequencyData(dataArray);
        
        // Añade un sutil efecto de desvanecimiento para dejar estelas
        visualizerCtx.fillStyle = 'rgba(30, 30, 30, 0.1)';
        visualizerCtx.fillRect(0, 0, visualizer.width, visualizer.height);

        const barCount = bufferLength; // Use bufferLength for the number of bars
        const barWidth = visualizer.width / barCount; // Calculate bar width to fill the container
        let x = 0;

        for (let i = 0; i < barCount; i++) {
            barHeight = dataArray[i] * 0.9; // Escala las barras para un look más limpio
            
            if (barHeight > 0) {
                // Calcula el color de cada barra para crear un efecto arcoíris
                const barHue = (hue + i * 2) % 360;
                visualizerCtx.fillStyle = `hsl(${barHue}, 100%, 50%)`;
                visualizerCtx.fillRect(x, visualizer.height - barHeight, barWidth - 1, barHeight); // Subtract 1 for a small gap
            }
            
            x += barWidth;
        }
    }

    playPauseBtn.addEventListener('click', playPauseToggle);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
        if (isRepeat) {
            audio.currentTime = 0;
            playSong().catch(console.error);
        } else {
            nextSong();
        }
    });
    
    audio.addEventListener('error', () => {
        console.error('Audio error:', audio.error);
        isPlaying = false;
        updatePlayPauseButton();
    });
    progressBar.addEventListener('input', (e) => audio.currentTime = (e.target.value / 100) * audio.duration);
    volumeSlider.addEventListener('input', (e) => audio.volume = e.target.value);

    shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
    if (isShuffle) {
        resetShuffleForCurrentPlaylist();
        currentSongIndex = shuffleOrder[0] || 0;
        shufflePointer = 0;
        loadSong(currentSongIndex);
        playSong();
    }
});

    repeatBtn.addEventListener('click', () => {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle('active', isRepeat);
    });

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            changeCategory(btn.dataset.category);
        });
    });

    // Add spacebar functionality
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault(); // Prevent default spacebar behavior (e.g., scrolling)
            playPauseToggle();
        }
    });

    // Init
    fetchPlaylists()
        .then(playlists => {
            // Solo cambiamos la categoría si hubo playlists válidas
            if (Object.values(playlists).some(arr => arr.length > 0)) {
                changeCategory('urbano');
                // Render the playlist after changing category
                renderPlaylist();
            } else {
                console.error('No se encontraron canciones en ninguna categoría');
            }
            drawVisualizer();
        })
        .catch(error => {
            console.error('Error inicializando app:', error);
            // Mostrar mensaje de error en la UI
            songTitle.textContent = 'Error al cargar las canciones';
            songArtist.textContent = 'Verifica la conexión a internet';
        });
});
