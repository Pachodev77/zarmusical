// Dibuja un rectángulo redondeado en el canvas (para barras del visualizador)
function roundRect(ctx, x, y, width, height, radius) {
    if (radius > 0) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
    } else {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.closePath();
    }
}

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
    // === VARIABLES Y ELEMENTOS DOM ===
    let playlists = {};
    const categories = ['urbano', 'latino', 'electro'];
    let currentCategoryIndex = 0;
    // Disable controls initially
    setPlayerControlsEnabled(false);

    async function fetchPlaylists() {
        try {
            // Disable controls until playlists are loaded
            setPlayerControlsEnabled(false);
            const response = await fetch('/api/songs');
            playlists = await response.json();
            // Validate playlists structure
            if (!playlists || !playlists.urbano || !playlists.latino || !playlists.electro) {
                console.error('API playlists structure invalid:', playlists);
                return;
            }
            setPlayerControlsEnabled(true);
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
    // bufferLength y dataArray se declaran localmente en drawVisualizer, no aquí.

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
    
    const sonidoCallejeroTitle = document.getElementById('sonido-callejero-title');
    const titleSpans = sonidoCallejeroTitle ? sonidoCallejeroTitle.querySelectorAll('span') : [];

    // Selecciona los botones de género y asigna listeners
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            changeCategory(btn.dataset.category);
        });
    });

    function changeCategory(category, keepShuffle = false) {
        // Defensive: Ensure playlists and indices are valid
        if (!playlists || !playlists[category]) {
            console.error('Playlist not loaded or invalid:', category, playlists);
            return;
        }
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
        // Defensive: Ensure playlists and indices are valid
        if (!playlists || !playlists[currentPlaylist]) {
            console.error('Playlist not loaded or invalid:', currentPlaylist, playlists);
            return;
        }
        if (!playlists[currentPlaylist][songIndex]) {
            console.error('Song index out of range:', songIndex, playlists[currentPlaylist]);
            return;
        }
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

    let prevHeights = [];
    let visualizerHue = 0;
    function drawVisualizer() {
    // --- Visualizer principal único: cálculo correcto de sum y avg por barra ---
    requestAnimationFrame(drawVisualizer);
    visualizer.width = visualizer.offsetWidth;
    visualizer.height = visualizer.offsetHeight;
    const ctx = visualizer.getContext('2d');
    ctx.clearRect(0, 0, visualizer.width, visualizer.height);
    analyser.fftSize = 128;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    const barCount = bufferLength;
    const barWidth = visualizer.width / barCount;
    let x = 0;

    // Inicializar suavizado
    if (prevHeights.length !== barCount) prevHeights = Array(barCount).fill(0);

    // Ganancia para barras más altas
    const GAIN = 1.6;
    const EASING = 0.30; // Suavizado

    // --- Distribución logarítmica para frecuencias parejas ---
    // --- Visualizador con bandas y compensación de sensibilidad ---
    const minBand = 2; // bandas mínimas para evitar saturación en graves
    const maxBand = 12; // bandas máximas para evitar saturación en agudos

    for (let i = 0; i < barCount; i++) {
        // Rango de frecuencias para cada barra (bandas más anchas en graves, más finas en agudos)
        let startIdx = Math.floor((i / barCount) ** 1.7 * (barCount - minBand));
        let endIdx = Math.floor(((i + 1) / barCount) ** 1.7 * (barCount - minBand)) + minBand;
        if (endIdx <= startIdx) endIdx = startIdx + 1;
        let sum = 0;
        for (let j = startIdx; j < endIdx; j++) {
            sum += dataArray[j];
        }
        let avg = sum / (endIdx - startIdx);

        // Compresión y límite fuerte en graves para que nunca se saturen visualmente
        let compensation = 0.7 + 1.3 * (i / (barCount - 1)); // 0.7x en graves, hasta 2x en agudos
        let target = avg * GAIN * compensation;
        // Aplica compresión exponencial y límite duro a las primeras barras (primer 25%)
        if (i < barCount * 0.25) {
            target = Math.pow(target, 0.4) * 13; // compresión fuerte
        }
        let eased = prevHeights[i] + (target - prevHeights[i]) * EASING;
        prevHeights[i] = eased;
        let barHeight = eased;
        // Límite máximo visual para las primeras barras
        if (i < barCount * 0.25) {
            barHeight = Math.min(barHeight, visualizer.height * 0.35);
        }

        // Rebote dinámico (más movimiento en graves)
        if (i < barCount * 0.15) {
            barHeight += Math.abs(Math.sin(Date.now()/140 + i)) * 18;
        }

        // Gradiente dinámico
        let grad = ctx.createLinearGradient(x, visualizer.height, x, visualizer.height - barHeight);
        let hue = (i*360/barCount+Date.now()/25)%360;
        grad.addColorStop(0, `hsl(${hue},100%,60%)`);
        grad.addColorStop(1, `hsl(${(hue+60)%360},100%,40%)`);
        ctx.fillStyle = grad;

        // Sombra para profundidad
        ctx.shadowColor = `hsl(${(hue+30)%360},100%,40%)`;
        ctx.shadowBlur = 12;

        // Dibuja barra
        ctx.fillRect(x, visualizer.height - barHeight, barWidth - 1, barHeight);
        ctx.shadowBlur = 0;
        x += barWidth;
    }

    // Update CSS variables for dynamic coloring
    let hue = (Date.now() / 25) % 360;
    const primaryColor = `hsl(${hue}, 100%, 50%)`;
    const shadowColor = `hsla(${hue}, 100%, 50%, 0.5)`;
    const darkBackgroundColor = `hsl(${hue}, 30%, 10%)`;
    const lightBackgroundColor = `hsl(${hue}, 20%, 15%)`;
    const textColor = `hsl(${hue}, 10%, 90%)`;

    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--shadow-color', shadowColor);
    document.documentElement.style.setProperty('--background-dark', darkBackgroundColor);
    document.documentElement.style.setProperty('--background-light', lightBackgroundColor);
    document.documentElement.style.setProperty('--text-color', textColor);

    // --- Animación de colores del título principal ---
    animateTitleColors(hue);
}

// --- Animación de colores del título principal ---
function animateTitleColors(hue) {
    const title = document.getElementById('sonido-callejero-title');
    if (!title) return;
    const spans = title.querySelectorAll('span');
    const total = spans.length;
    for (let i = 0; i < total; i++) {
        const letterHue = (hue + i * (360 / total)) % 360;
        spans[i].style.color = `hsl(${letterHue}, 100%, 60%)`;
        spans[i].style.textShadow = `0 0 12px #fff, 0 0 18px hsl(${letterHue},100%,65%), 0 0 6px #fff`;
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        const barCount = bufferLength;
        const barWidth = visualizer.width / barCount;
        let x = 0;

        // Inicializar suavizado
        if (prevHeights.length !== barCount) prevHeights = Array(barCount).fill(0);

        // Ganancia para barras más altas
        const GAIN = 1.6;
        const EASING = 0.30; // Suavizado

        // --- Distribución logarítmica para frecuencias parejas ---
        // --- Visualizador con bandas y compensación de sensibilidad ---
        const minBand = 2; // bandas mínimas para evitar saturación en graves
        const maxBand = 12; // bandas máximas para evitar saturación en agudos

        // --- Animación de colores del título principal ---
        function animateTitleColors(hue) {
            const title = document.getElementById('sonido-callejero-title');
            if (!title) return;
            const spans = title.querySelectorAll('span');
            const total = spans.length;
            for (let i = 0; i < total; i++) {
                const letterHue = (hue + i * (360 / total)) % 360;
                spans[i].style.color = `hsl(${letterHue}, 100%, 60%)`;
                spans[i].style.textShadow = `0 0 12px #fff, 0 0 18px hsl(${letterHue},100%,65%), 0 0 6px #fff`;
            }
        }

        for (let i = 0; i < barCount; i++) {
            // Rango de frecuencias para cada barra (bandas más anchas en graves, más finas en agudos)
            let startIdx = Math.floor((i / barCount) ** 1.7 * (barCount - minBand));
            let endIdx = Math.floor(((i + 1) / barCount) ** 1.7 * (barCount - minBand)) + minBand;
            if (endIdx <= startIdx) endIdx = startIdx + 1;
            let sum = 0;
            for (let j = startIdx; j < endIdx; j++) {
                sum += dataArray[j];
            }
            let avg = sum / (endIdx - startIdx);

            // Compresión y límite fuerte en graves para que nunca se saturen visualmente
            let compensation = 0.7 + 1.3 * (i / (barCount - 1)); // 0.7x en graves, hasta 2x en agudos
            let target = avg * GAIN * compensation;
            // Aplica compresión exponencial y límite duro a las primeras barras (primer 25%)
            if (i < barCount * 0.25) {
                target = Math.pow(target, 0.4) * 13; // compresión fuerte
            }
            let eased = prevHeights[i] + (target - prevHeights[i]) * EASING;
            prevHeights[i] = eased;
            let barHeight = eased;
            // Límite máximo visual para las primeras barras
            if (i < barCount * 0.25) {
                barHeight = Math.min(barHeight, visualizer.height * 0.35);
            }

            // Rebote dinámico (más movimiento en graves)
            if (i < barCount * 0.15) {
                barHeight += Math.abs(Math.sin(Date.now()/140 + i)) * 18;
            }

            // Gradiente dinámico
            let grad = ctx.createLinearGradient(x, visualizer.height, x, visualizer.height - barHeight);
            let hue = (i*360/barCount+Date.now()/25)%360;
            grad.addColorStop(0, `hsl(${hue},100%,60%)`);
            grad.addColorStop(1, `hsl(${(hue+60)%360},100%,40%)`);
            ctx.fillStyle = grad;

            // Sombra para profundidad
            ctx.shadowColor = `hsl(${(hue+30)%360},100%,40%)`;
            ctx.shadowBlur = 12;

            // Dibuja barra
            ctx.fillRect(x, visualizer.height - barHeight, barWidth - 1, barHeight);
            ctx.shadowBlur = 0;
            x += barWidth;
        }

        // Update CSS variables for dynamic coloring
        let hue = (Date.now() / 25) % 360;
        const primaryColor = `hsl(${hue}, 100%, 50%)`;
        const shadowColor = `hsla(${hue}, 100%, 50%, 0.5)`;
        const darkBackgroundColor = `hsl(${hue}, 30%, 10%)`;
        const lightBackgroundColor = `hsl(${hue}, 20%, 15%)`;
        const textColor = `hsl(${hue}, 10%, 90%)`;

        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--shadow-color', shadowColor);
        document.documentElement.style.setProperty('--background-dark', darkBackgroundColor);
        document.documentElement.style.setProperty('--background-light', lightBackgroundColor);
        document.documentElement.style.setProperty('--text-color', textColor);

        // Animate title colors
        animateTitleColors(hue);
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

    // Helper to enable/disable player controls and category buttons
    function setPlayerControlsEnabled(enabled) {
        const controls = document.querySelectorAll('.player-control, .category-btn');
        controls.forEach(ctrl => ctrl.disabled = !enabled);
    }
    drawVisualizer();
}

