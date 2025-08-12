/**
 * Disco lights background animation
 * This runs independently from the music player
 */
(function() {
    // Configuration
    const COLORS = [
        '#ff0040', // rojo
        '#00eaff', // azul celeste
        '#39ff14', // verde
        '#ffe600', // amarillo
        '#a200ff', // violeta
        '#ffffff'  // blanco
    ];
    
    const NUM_LIGHTS = 18;
    const LIGHT_OPACITY = 0.3;
    const LIGHT_GROWTH_FACTOR = 0.3;
    
    // Get canvas and context
    const canvas = document.getElementById('disco-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    
    // Light objects array
    const lights = [];
    
    // Initialize canvas size
    function initCanvas() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }
    
    // Create lights in a jittered grid pattern
    function createLights() {
        const gridCols = Math.ceil(Math.sqrt(NUM_LIGHTS * W / H));
        const gridRows = Math.ceil(NUM_LIGHTS / gridCols);
        let lightIndex = 0;
        
        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                if (lightIndex >= NUM_LIGHTS) break;
                
                const cellW = W / gridCols;
                const cellH = H / gridRows;
                const jitterX = (Math.random() - 0.5) * cellW * 0.7;
                const jitterY = (Math.random() - 0.5) * cellH * 0.7;
                const x = (col + 0.5) * cellW + jitterX;
                const y = (row + 0.5) * cellH + jitterY;
                
                lights.push({
                    x,
                    y,
                    r: 80 + Math.random() * 120,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    alpha: LIGHT_OPACITY + Math.random() * 0.2,
                    dx: (Math.random() - 0.5) * 2,
                    dy: (Math.random() - 0.5) * 2,
                    targetR: 0,
                    currentR: 0,
                    growth: 0
                });
                lightIndex++;
            }
        }
    }
    
    // Update light positions and properties
    function updateLights() {
        const centerX = W / 2;
        const centerY = H / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        const time = Date.now() * 0.001;

        lights.forEach(light => {
            // Update position with boundary check
            light.x = Math.max(0, Math.min(W, light.x + light.dx));
            light.y = Math.max(0, Math.min(H, light.y + light.dy));
            
            // Bounce off edges
            if (light.x <= 0 || light.x >= W) light.dx *= -1;
            if (light.y <= 0 || light.y >= H) light.dy *= -1;

            // Calculate distance from center for pulsing effect
            const dx = light.x - centerX;
            const dy = light.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const normalizedDistance = distance / maxDistance;

            // Smooth pulsing animation
            light.targetR = 150 + Math.sin(time + light.x * 0.01) * 50;
            light.currentR += (light.targetR - light.currentR) * 0.1;
            light.alpha = LIGHT_OPACITY + (0.3 * (1 - normalizedDistance));

            // Random color change with lower probability
            if (Math.random() < 0.001) {
                light.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            }
        });
    }

    // Draw all lights on canvas
    function drawLights() {
        // Clear with subtle fade effect
        ctx.fillStyle = 'rgba(10, 5, 20, 0.1)';
        ctx.fillRect(0, 0, W, H);

        // Draw each light with radial gradient
        lights.forEach(light => {
            const gradient = ctx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, light.currentR
            );
            gradient.addColorStop(0, light.color);
            gradient.addColorStop(1, 'transparent');

            ctx.globalAlpha = light.alpha;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(light.x, light.y, light.currentR, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Reset global alpha
        ctx.globalAlpha = 1;
    }

    // Main animation loop
    function animate() {
        updateLights();
        drawLights();
        requestAnimationFrame(animate);
    }

    // Initialize and start animation
    function init() {
        initCanvas();
        createLights();
        
        // Handle window resize with debounce
        const resizeHandler = debounce(() => {
            initCanvas();
            lights.length = 0;
            createLights();
        }, 250);
        
        window.addEventListener('resize', resizeHandler);
        
        // Start animation
        animate();
        
        // Cleanup function
        return () => {
            window.removeEventListener('resize', resizeHandler);
            // Cancel animation frame if needed
            cancelAnimationFrame(animate);
        };
    }
    
    // Utility function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Start the animation
    init();
})();

// Main application module
const MusicPlayer = (() => {
    // Constants
    const CATEGORIES = ['urbano', 'latino', 'electro'];
    const AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
    const VISUALIZER_FFT_SIZE = 2048;
    
    // State
    const state = {
        // Playback state
        isPlaying: false,
        isShuffle: false,
        isRepeat: false,
        isMuted: false,
        volume: 0.8,
        
        // Playlist state
        playlists: {},
        currentCategoryIndex: 0,
        currentPlaylist: 'urbano',
        currentSongIndex: 0,
        shuffleOrder: [],
        shufflePointer: 0,
        
        // Audio context state
        audioContext: null,
        analyzer: null,
        dataArray: null,
        audioContextInitialized: false,
        visualizerRunning: false,
        animationId: null
    };
    
    // DOM Elements
    const elements = {
        // Player controls
        playPauseBtn: null,
        playIcon: null,
        pauseIcon: null,
        prevBtn: null,
        nextBtn: null,
        repeatBtn: null,
        shuffleBtn: null,
        
        // Progress and volume
        progressBar: null,
        currentTimeEl: null,
        totalTimeEl: null,
        volumeSlider: null,
        
        // Song info
        songTitle: null,
        songArtist: null,
        albumCover: null,
        
        // Visualizer
        visualizerCanvas: null,
        visualizerCtx: null,
        
        // Playlist
        playlistElement: null,
        
        // Audio element
        audio: null
    };
    
    // Initialize the application
    const init = () => {
        initializeElements();
        setupEventListeners();
        fetchPlaylists().then(() => {
            changeCategory('urbano');
        }).catch(console.error);
    };
    
    // Initialize DOM elements
    const initializeElements = () => {
        try {
            // Initialize all elements
            elements.visualizerCanvas = document.getElementById('visualizer');
            elements.playPauseBtn = document.getElementById('play-pause-btn');
            elements.prevBtn = document.getElementById('prev-btn');
            elements.nextBtn = document.getElementById('next-btn');
            elements.shuffleBtn = document.getElementById('shuffle-btn');
            elements.repeatBtn = document.getElementById('repeat-btn');
            elements.volumeSlider = document.getElementById('volume-slider');
            elements.progressBar = document.getElementById('progress-bar');
            elements.currentTimeEl = document.getElementById('current-time');
            elements.totalTimeEl = document.getElementById('total-time');
            elements.songTitle = document.getElementById('song-title');
            elements.songArtist = document.getElementById('song-artist');
            elements.playlistElement = document.getElementById('playlist');
            elements.audio = document.getElementById('audio-fallback');
            
            // Initialize visualizer if canvas exists
            if (elements.visualizerCanvas) {
                elements.visualizerCtx = elements.visualizerCanvas.getContext('2d');
                resizeVisualizer();
            }
            
            // Set initial UI states
            updatePlayPauseButton();
            updateRepeatButton();
            updateShuffleButton();
            
            console.log('UI elements initialized');
        } catch (error) {
            console.error('Error initializing elements:', error);
            throw error;
        }
    };
    // State is managed in the centralized state object
    
    // fetchPlaylists is defined later in the file

    // --- SHUFFLE STATE ---
    function generateShuffleOrder(length) {
        const arr = Array.from({length}, (_, i) => i);
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    // resetShuffleForCurrentPlaylist is defined later in the file

    // Setup event listeners
    const setupEventListeners = () => {
        try {
            // Setup player control events
            setupPlayerControls();
            
            // Setup audio element events
            setupAudioEvents();
            
            // Setup UI interaction events
            setupUIEvents();
            
            // Setup keyboard shortcuts
            document.addEventListener('keydown', handleKeyDown);
            
            console.log('Event listeners initialized');
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    };

    // Setup player control event listeners
    const setupPlayerControls = () => {
        if (!elements.audio) return;
        
        // Play/Pause button
        if (elements.playPauseBtn) {
            elements.playPauseBtn.addEventListener('click', togglePlayPause);
        }
        
        // Previous button
        if (elements.prevBtn) {
            elements.prevBtn.addEventListener('click', playPreviousSong);
        }
        
        // Next button
        if (elements.nextBtn) {
            elements.nextBtn.addEventListener('click', playNextSong);
        }
        
        // Repeat button
        if (elements.repeatBtn) {
            elements.repeatBtn.addEventListener('click', toggleRepeatMode);
        }
        
        // Shuffle button
        if (elements.shuffleBtn) {
            elements.shuffleBtn.addEventListener('click', toggleShuffleMode);
        }
    };

    // Setup audio element event listeners
    const setupAudioEvents = () => {
        if (!elements.audio) return;
        
        const { audio } = elements;
        
        // Playback events
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleSongEnd);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('volumechange', updateVolume);
        audio.addEventListener('error', handleAudioError);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('canplay', handleCanPlay);
    };

    // Core player logic functions
    const togglePlayPause = async () => {
        if (!elements.audio) return;
        
        try {
            if (state.isPlaying) {
                await elements.audio.pause();
            } else {
                await elements.audio.play();
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
            showError('Failed to play/pause');
        }
    };

const playNextSong = () => {
    if (!state.playlists[state.currentPlaylist]?.length) return;
    
    if (state.isShuffle) {
        state.shufflePointer = (state.shufflePointer + 1) % state.shuffleOrder.length;
        state.currentSongIndex = state.shuffleOrder[state.shufflePointer];
    } else {
        state.currentSongIndex = (state.currentSongIndex + 1) % state.playlists[state.currentPlaylist].length;
    }
    
    loadAndPlayCurrentSong();
};

const playPreviousSong = () => {
    if (!state.playlists[state.currentPlaylist]?.length) return;
    
    if (state.isShuffle) {
        state.shufflePointer = (state.shufflePointer - 1 + state.shuffleOrder.length) % state.shuffleOrder.length;
        state.currentSongIndex = state.shuffleOrder[state.shufflePointer];
    } else {
        state.currentSongIndex = (state.currentSongIndex - 1 + state.playlists[state.currentPlaylist].length) % 
            state.playlists[state.currentPlaylist].length;
    }
    
    loadAndPlayCurrentSong();
};

const toggleRepeatMode = () => {
    state.isRepeat = !state.isRepeat;
    updateRepeatButton();
};

const toggleShuffleMode = () => {
    state.isShuffle = !state.isShuffle;
    updateShuffleButton();
    
    if (state.isShuffle) {
        resetShuffleForCurrentPlaylist();
    }
};

// Audio event handlers
const handlePlay = () => {
    state.isPlaying = true;
    updatePlayPauseButton();
    
    if (!state.visualizerRunning) {
        startVisualizer();
    }
};

const handlePause = () => {
    state.isPlaying = false;
    updatePlayPauseButton();
};

const handleSongEnd = () => {
    if (state.isRepeat) {
        if (elements.audio) {
            elements.audio.currentTime = 0;
            elements.audio.play().catch(console.error);
        }
    } else {
        playNextSong();
    }
};

const handleAudioError = (event) => {
    console.error('Audio error:', elements.audio?.error);
    state.isPlaying = false;
    updatePlayPauseButton();    
    showError('Error playing audio');
};

const handleLoadedMetadata = () => {
    updateProgress();
    updateTotalTime();
};

const handleCanPlay = () => {
    // Additional handling when audio is ready to play
};

// UI update functions
const updatePlayPauseButton = () => {
    if (!elements.playPauseBtn || !elements.playIcon || !elements.pauseIcon) return;
    
    if (state.isPlaying) {
        elements.playIcon.classList.add('hidden');
        elements.pauseIcon.classList.remove('hidden');
    } else {
        elements.playIcon.classList.remove('hidden');
        elements.pauseIcon.classList.add('hidden');
    }
};

const updateRepeatButton = () => {
    if (elements.repeatBtn) {
        elements.repeatBtn.classList.toggle('active', state.isRepeat);
    }
};

const updateShuffleButton = () => {
    if (elements.shuffleBtn) {
        elements.shuffleBtn.classList.toggle('active', state.isShuffle);
    }
};

const updateProgress = () => {
    if (!elements.audio || !elements.progressBar || !elements.currentTimeEl) return;
    
    const { currentTime, duration } = elements.audio;
    const progressPercent = (currentTime / duration) * 100 || 0;
    
    elements.progressBar.value = progressPercent;
    elements.currentTimeEl.textContent = formatTime(currentTime);
};

const updateTotalTime = () => {
    if (!elements.audio || !elements.totalTimeEl) return;
    elements.totalTimeEl.textContent = formatTime(elements.audio.duration || 0);
};

const updateVolume = () => {
    if (!elements.audio || !elements.volumeSlider) return;
    elements.audio.volume = elements.volumeSlider.value;
};

// Helper functions
const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const loadAndPlayCurrentSong = () => {
    console.log('loadAndPlayCurrentSong called');
    const songs = state.playlists[state.currentPlaylist];
    console.log('Current playlist:', state.currentPlaylist);
    console.log('Available playlists:', Object.keys(state.playlists));
    
    if (!songs || !songs.length) {
        console.error('No songs in current playlist');
        console.error('Current playlist:', state.currentPlaylist);
        console.error('Available playlists:', state.playlists);
        return;
    }
    
    console.log(`Loading song at index ${state.currentSongIndex} from ${songs.length} songs`);
    const song = songs[state.currentSongIndex];
    if (!song) {
        console.error('Invalid song index:', state.currentSongIndex);
        console.error('Available songs:', songs);
        return;
    }
    
    console.log('Loading song:', song.title);
    console.log('Song URL:', song.audioUrl);
    loadSong(song);
    playSong();
};

const loadSong = async (song) => {
    console.log('loadSong called with:', song);
    if (!song) {
        console.error('No song provided to loadSong');
        return;
    }
    
    // Update UI
    console.log('Updating now playing UI');
    updateNowPlayingUI(song);
    
    // Load audio
    if (elements.audio) {
        console.log('Audio element found, loading new audio source');
        elements.audio.pause();
        console.log('Previous audio source paused');
        
        elements.audio.src = song.audioUrl;
        console.log('New audio source set:', song.audioUrl);
        
        // Set crossOrigin to anonymous to handle CORS for audio analysis
        elements.audio.crossOrigin = 'anonymous';
        
        // Add error handler for audio loading
        elements.audio.onerror = (e) => {
            console.error('Error loading audio:', e);
            console.error('Audio element error:', elements.audio.error);
        };
        
        // Add canplay event to know when audio is ready
        elements.audio.oncanplay = () => {
            console.log('Audio can play, duration:', elements.audio.duration);
            updateTotalTime();
        };
        
        console.log('Loading audio source');
        elements.audio.load();
        
        // Play the audio
        console.log('Attempting to play audio');
        const playPromise = elements.audio.play();
        
        // Handle autoplay restrictions
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Audio playback started successfully');
                updatePlayPauseButton();
            }).catch(error => {
                console.error('Autoplay prevented:', error);
                // Show play button to let user start playback
                updatePlayPauseButton();
            });
        }
    } else {
        console.error('Audio element not found');
    }
};

const playSong = async () => {
    if (!elements.audio) return;
    
    try {
        await elements.audio.play();
        updatePlayPauseButton();
        updateNowPlayingUI();
    } catch (error) {
        console.error('Error playing song:', error);
        showError('Error playing song');
    }
};

const initializeAudioContext = async () => {
    try {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        state.audioContext = new AudioContext();
        
        // Create analyzer node for visualizer
        state.analyzer = state.audioContext.createAnalyser();
        state.analyzer.fftSize = 256;
        
        // Connect audio element to analyzer
        const source = state.audioContext.createMediaElementSource(elements.audio);
        source.connect(state.analyzer);
        state.analyzer.connect(state.audioContext.destination);
        
        // Create data array for visualization
        const bufferLength = state.analyzer.frequencyBinCount;
        state.dataArray = new Uint8Array(bufferLength);
        
        state.audioContextInitialized = true;
        console.log('Audio context initialized');
    } catch (error) {
        console.error('Error initializing audio context:', error);
        showError('Audio features not available');
    }
};

const startVisualizer = () => {
    if (!state.audioContextInitialized || !state.analyzer || !elements.visualizerCanvas) {
        return;
    }
    
    state.visualizerRunning = true;
    const canvas = elements.visualizerCanvas;
    const ctx = elements.visualizerCtx;
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    
    const draw = () => {
        if (!state.visualizerRunning) return;
        
        state.animationId = requestAnimationFrame(draw);
        
        const bufferLength = state.analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        state.analyzer.getByteFrequencyData(dataArray);
        
        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        
        // Draw bars
        const barWidth = (WIDTH / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * HEIGHT;
            
            const hue = i * 360 / bufferLength;
            ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            
            ctx.fillRect(
                x,
                HEIGHT - barHeight,
                barWidth - 1,
                barHeight
            );
            
            x += barWidth + 1;
        }
    };
    
    draw();
};

const stopVisualizer = () => {
    state.visualizerRunning = false;
    if (state.animationId) {
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
    }
    
    // Clear visualizer canvas
    if (elements.visualizerCanvas && elements.visualizerCtx) {
        const { width, height } = elements.visualizerCanvas;
        elements.visualizerCtx.clearRect(0, 0, width, height);
    }
};

const resetShuffleForCurrentPlaylist = () => {
    if (!state.playlists[state.currentPlaylist]?.length) return;
    
    // Create array of indices
    const playlistLength = state.playlists[state.currentPlaylist].length;
    state.shuffleOrder = Array.from({ length: playlistLength }, (_, i) => i);
    
    // Shuffle the array (Fisher-Yates algorithm)
    for (let i = playlistLength - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.shuffleOrder[i], state.shuffleOrder[j]] = [state.shuffleOrder[j], state.shuffleOrder[i]];
    }
    
    // Update shuffle pointer
    state.shufflePointer = state.shuffleOrder.indexOf(state.currentSongIndex);
    if (state.shufflePointer === -1) state.shufflePointer = 0;
};

const updateNowPlayingUI = () => {
    if (!state.playlists[state.currentPlaylist]?.length) return;
    
    const song = state.playlists[state.currentPlaylist][state.currentSongIndex];
    if (!song) return;
    
    // Update song info
    if (elements.songTitle) elements.songTitle.textContent = song.title || 'Unknown Title';
    if (elements.songArtist) elements.songArtist.textContent = song.artist || 'Unknown Artist';
    
    // Update album art
    if (elements.albumCover && song.coverUrl) {
        elements.albumCover.style.backgroundImage = `url('${song.coverUrl}')`;
    }
    
    // Update active state in playlist
    updateActivePlaylistItem();
};

const updateActivePlaylistItem = () => {
    if (!elements.playlistElement) return;
    
    // Remove active class from all items
    const items = elements.playlistElement.querySelectorAll('li');
    items.forEach(item => item.classList.remove('active'));
    
    // Add active class to current song
    const activeItem = items[state.currentSongIndex];
    if (activeItem) {
        activeItem.classList.add('active');
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

// UI Event Handlers
const handleProgressChange = (e) => {
    if (!elements.audio) return;
    const seekTime = (e.target.value / 100) * elements.audio.duration;
    elements.audio.currentTime = seekTime;
};

const handleVolumeChange = (e) => {
    if (!elements.audio) return;
    const volume = parseFloat(e.target.value);
    state.volume = volume;
    elements.audio.volume = volume;
    
    // Update mute state based on volume
    state.isMuted = volume === 0;
};

const handleKeyDown = (e) => {
    if (!elements.audio) return;
    
    switch (e.code) {
        case 'Space':
            e.preventDefault();
            togglePlayPause();
            break;
            
        case 'ArrowRight':
            if (e.ctrlKey || e.metaKey) {
                elements.audio.currentTime = Math.min(
                    elements.audio.currentTime + 10, 
                    elements.audio.duration
                );
            } else {
                playNextSong();
            }
            break;
            
        case 'ArrowLeft':
            if (e.ctrlKey || e.metaKey) {
                elements.audio.currentTime = Math.max(
                    elements.audio.currentTime - 10, 
                    0
                );
            } else {
                playPreviousSong();
            }
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            if (elements.volumeSlider) {
                const newVolume = Math.min(state.volume + 0.1, 1);
                elements.volumeSlider.value = newVolume;
                handleVolumeChange({ target: { value: newVolume } });
            }
            break;
            
        case 'ArrowDown':
            e.preventDefault();
            if (elements.volumeSlider) {
                const newVolume = Math.max(state.volume - 0.1, 0);
                elements.volumeSlider.value = newVolume;
                handleVolumeChange({ target: { value: newVolume } });
            }
            break;
            
        case 'KeyM':
            toggleMute();
            break;
            
        case 'KeyR':
            toggleRepeatMode();
            break;
            
        case 'KeyS':
            toggleShuffleMode();
            break;
    }
};

const toggleMute = () => {
    if (!elements.audio) return;
    
    state.isMuted = !state.isMuted;
    elements.audio.muted = state.isMuted;
    
    // Update volume slider to reflect mute state
    if (elements.volumeSlider) {
        if (state.isMuted) {
            elements.volumeSlider.dataset.preMuteVolume = elements.volumeSlider.value;
            elements.volumeSlider.value = 0;
        } else {
            const preMuteVolume = parseFloat(elements.volumeSlider.dataset.preMuteVolume || '0.8');
            elements.volumeSlider.value = preMuteVolume;
            handleVolumeChange({ target: { value: preMuteVolume } });
        }
    }
};

// Setup UI interaction events
const setupUIEvents = () => {
    // Progress bar
    if (elements.progressBar) {
        elements.progressBar.addEventListener('input', handleProgressChange);
    }
    
    // Volume control
    if (elements.volumeSlider) {
        elements.volumeSlider.addEventListener('input', handleVolumeChange);
    }
    
    // Category buttons
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            changeCategory(btn.dataset.category);
        });
    });
    
    // Window resize handler for visualizer
    const handleResize = debounce(() => {
        if (elements.visualizerCanvas) {
            resizeVisualizer();
        }
    }, 200);
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function for event listeners
    return () => {
        window.removeEventListener('resize', handleResize);
    };
};

// Playlist and Category Management
const fetchPlaylists = async () => {
    try {
        console.log('Fetching playlists from /api/songs...');
        const response = await fetch('/api/songs');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid API response format');
        }
        
        // Initialize playlists with empty arrays for each category
        state.playlists = {
            urbano: [],
            latino: [],
            electro: []
        };
        
        // Process each category from the API response
        Object.entries(data).forEach(([category, songs]) => {
            if (!Array.isArray(songs)) {
                console.warn(`Skipping invalid songs data for category ${category}`);
                return;
            }
            
            // Extract the base category name (remove 'music/' prefix if present)
            const baseCategory = category.replace('music/', '');
            
            console.log(`Processing ${songs.length} songs for category: ${baseCategory}`);
            
            // Map songs to the expected format
            state.playlists[baseCategory] = songs.map((song, index) => {
                const songData = {
                    id: song.id || `song-${baseCategory}-${index}`,
                    title: song.title || `Track ${index + 1}`,
                    artist: song.artist || 'Unknown Artist',
                    audioUrl: song.src || song.audioUrl,
                    coverUrl: song.cover || song.coverUrl || 'default-cover.jpg',
                    duration: song.duration || 0,
                    category: baseCategory
                };
                console.log(`Song ${index + 1}:`, songData);
                return songData;
            });
        });
        
        console.log('All playlists processed:', state.playlists);
        
        // Verify we have songs in at least one category
        const hasSongs = Object.values(state.playlists).some(songs => songs.length > 0);
        if (!hasSongs) {
            throw new Error('No songs found in any category');
        }
        
        // Change to the default category
        console.log('Loading default category: urbano');
        changeCategory('urbano');
        return state.playlists;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        showError('Failed to load playlists');
        throw error;
    }
};

const changeCategory = (category) => {
    console.log(`Changing to category: ${category}`);
    console.log('Available categories:', Object.keys(state.playlists));
    
    if (!state.playlists[category] || state.playlists[category].length === 0) {
        console.warn(`No songs found in category: ${category}`);
        console.warn('Available playlists:', state.playlists);
        return;
    }
    
    state.currentPlaylist = category;
    state.currentSongIndex = 0;
    
    // Update active category UI
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    console.log(`Rendering playlist for category: ${category}`);
    // Render playlist for the selected category
    renderPlaylist();
    
    // If shuffle is on, reset the shuffle order
    if (state.isShuffle) {
        console.log('Resetting shuffle order');
        resetShuffleForCurrentPlaylist();
    }
    
    console.log(`Loading first song from ${category}`);
    // Load the first song in the category
    loadAndPlayCurrentSong();
};

const renderPlaylist = () => {
    if (!elements.playlistElement) return;
    
    const songs = state.playlists[state.currentPlaylist] || [];
    
    // Clear existing playlist
    elements.playlistElement.innerHTML = '';
    
    if (songs.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-playlist';
        emptyMessage.textContent = 'No songs available in this category';
        elements.playlistElement.appendChild(emptyMessage);
        return;
    }
    
    // Create playlist items
    songs.forEach((song, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'playlist-item';
        listItem.dataset.index = index;
        
        if (index === state.currentSongIndex) {
            listItem.classList.add('active');
        }
        
        // Create song info container
        const songInfo = document.createElement('div');
        songInfo.className = 'song-info';
        
        // Add song title
        const title = document.createElement('span');
        title.className = 'song-title';
        title.textContent = song.title || `Track ${index + 1}`;
        
        // Add artist name
        const artist = document.createElement('span');
        artist.className = 'song-artist';
        artist.textContent = song.artist || 'Unknown Artist';
        
        // Add duration
        const duration = document.createElement('span');
        duration.className = 'song-duration';
        duration.textContent = formatTime(song.duration || 0);
        
        // Assemble the list item
        songInfo.appendChild(title);
        songInfo.appendChild(artist);
        
        listItem.appendChild(songInfo);
        listItem.appendChild(duration);
        
        // Add click handler to play the song
        listItem.addEventListener('click', () => {
            state.currentSongIndex = index;
            loadAndPlayCurrentSong();
        });
        
        elements.playlistElement.appendChild(listItem);
    });
};

const showError = (message) => {
    console.error(message);
    // You can implement a more user-friendly error display here
    // For example, show a toast notification or update a status element
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        
        // Hide the error after 5 seconds
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }
};

// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const pauseSong = () => {
    if (elements.audio) {
        elements.audio.pause();
    }
};

const resizeVisualizer = () => {
    if (!elements.visualizerCanvas) return;
    const size = Math.min(300, window.innerWidth * 0.8);
    elements.visualizerCanvas.width = size;
    elements.visualizerCanvas.height = size;
};

// Initialize the player when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    // DOM already loaded, initialize immediately
    init();
}

// Public API
return {
    init,
    playSong,
    pauseSong,
    nextSong: playNextSong,
    prevSong: playPreviousSong,
    changeCategory,
    toggleShuffle: toggleShuffleMode,
    toggleRepeat: toggleRepeatMode
};
})();
