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

    async function fetchPlaylists() {
        try {
            const response = await fetch('/api/songs');
            playlists = await response.json();
            changeCategory('electro'); // Load default category
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    }

    const categories = ['urbano', 'latino', 'electro']; // Define categories array
    let currentCategoryIndex = 0; // Track current category index
    let currentPlaylist = categories[currentCategoryIndex];
    let currentSongIndex = 0;
    let isPlaying = false;
    let isShuffle = false;
    let isRepeat = false;

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

    const audio = new Audio();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audio);

    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

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
    const soundsphereTitle = document.getElementById('soundsphere-title');
    const titleSpans = soundsphereTitle ? soundsphereTitle.querySelectorAll('span') : [];

    function changeCategory(category, keepShuffle = false) {
        currentPlaylist = category;
        currentCategoryIndex = categories.indexOf(category); // Update category index
        categoryBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        if (isShuffle && keepShuffle) {
            resetShuffleForCurrentPlaylist();
            currentSongIndex = shuffleOrder[0] || 0;
            shufflePointer = 0;
        } else {
            currentSongIndex = 0;
        }
        loadSong(currentSongIndex);
        playSong(); // Autoplay when category changes
    }

    function loadSong(songIndex) {
        currentSongIndex = songIndex;
        const song = playlists[currentPlaylist][currentSongIndex];
        // Efecto marquee para títulos largos
        document.getElementById('song-title').innerHTML = `<span class="song-title-marquee">${song.title}</span>`;
        songArtist.textContent = song.artist;
        audio.src = song.src; // Set audio source here
        updatePlaylistUI();
    }

    function updatePlaylistUI() {
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

    function playSong() {
        isPlaying = true;
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log("AudioContext resumed.");
                audio.play().then(() => {
                    console.log("Audio playback started successfully.");
                }).catch(error => {
                    console.error("Audio playback failed after resume:", error);
                    console.log("Autoplay might be blocked. Please ensure user interaction.");
                });
            }).catch(error => {
                console.error("Failed to resume AudioContext:", error);
            });
        } else {
            audio.play().then(() => {
                console.log("Audio playback started successfully (AudioContext already running).");
            }).catch(error => {
                console.error("Audio playback failed:", error);
                console.log("Autoplay might be blocked. Please ensure user interaction.");
            });
        }
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    }

    function pauseSong() {
        isPlaying = false;
        audio.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }

    function playPauseToggle() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    function nextSong() {
        if (isShuffle) {
            if (shufflePointer < shuffleOrder.length - 1) {
                shufflePointer++;
                currentSongIndex = shuffleOrder[shufflePointer];
            } else {
                // All songs played in this genre, move to next genre
                currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
                changeCategory(categories[currentCategoryIndex], true); // true = keep shuffle
                return;
            }
        } else {
            currentSongIndex++;
            if (currentSongIndex >= playlists[currentPlaylist].length) {
                // Move to next category
                currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
                changeCategory(categories[currentCategoryIndex]);
                return; // Exit to prevent loading song from old category
            }
        }
        loadSong(currentSongIndex);
        playSong();
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

    // --- VISUALIZADOR DE BARRAS DE FRECUENCIA REFINADO ---
    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);

        visualizer.width = visualizer.offsetWidth;
        visualizer.height = visualizer.offsetHeight;
        
        hue = (hue + 0.5) % 360;
        const primaryColor = `hsl(${hue}, 100%, 50%)`;
        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--shadow-color', `hsla(${hue}, 100%, 50%, 0.5)`);
        animateTitleColors();

        analyser.getByteFrequencyData(dataArray);

        visualizerCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        visualizerCtx.fillRect(0, 0, visualizer.width, visualizer.height);

        const barWidth = (visualizer.width / bufferLength);
        let x = 0;

        // Calcular la energía promedio para un piso dinámico
        const totalEnergy = dataArray.reduce((sum, value) => sum + value, 0);
        const averageEnergy = totalEnergy / bufferLength;
        
        // El piso mínimo reacciona a la energía promedio, con un tope
        const dynamicFloor = Math.min(averageEnergy / 255 * visualizer.height * 0.4, visualizer.height * 0.15);

        for (let i = 0; i < bufferLength; i++) {
            // Reducir la potencia de amplificación para evitar saturación
            const amplifiedValue = Math.pow(dataArray[i] / 255, 0.8) * 255;

            // Reducir la ganancia lineal
            const gain = 1 + (i / bufferLength) * 0.8;
            
            let barHeight = (amplifiedValue / 255) * visualizer.height * gain;

            // Aplicar el piso dinámico, pero permitir que el silencio sea silencio
            if (averageEnergy > 2) { // Umbral pequeño para el piso
                 barHeight = Math.max(barHeight, dynamicFloor);
            } else {
                 barHeight = 0;
            }

            const barHue = (hue + i * 2.0) % 360;
            visualizerCtx.fillStyle = `hsl(${barHue}, 90%, 55%)`;
            visualizerCtx.shadowColor = `hsl(${barHue}, 90%, 50%)`;
            visualizerCtx.shadowBlur = 5;

            // Dibuja las barras desde abajo
            visualizerCtx.fillRect(x, visualizer.height - barHeight, barWidth, Math.min(barHeight, visualizer.height));

            x += barWidth + 1;
        }
        visualizerCtx.shadowBlur = 0;
    }

    playPauseBtn.addEventListener('click', playPauseToggle);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
        if (isRepeat) {
            playSong();
        } else {
            nextSong();
        }
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
    fetchPlaylists();
    drawVisualizer();
});
