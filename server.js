const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const musicDir = path.join(__dirname, 'music');

app.use(express.static(__dirname)); // Serve static files from the root
app.use('/music', express.static(musicDir)); // Serve music files

app.get('/api/songs', (req, res) => {
    const categories = ['urbano', 'latino', 'electro'];
    const playlists = {};

    categories.forEach(category => {
        const categoryDir = path.join(musicDir, category);
        try {
            const files = fs.readdirSync(categoryDir);
            playlists[category] = files
                .filter(file => file.endsWith('.mp3'))
                .map(file => ({
                    title: path.basename(file, '.mp3'),
                    artist: 'Desconocido',
                    src: `music/${category}/${file}`,
                    cover: 'https://via.placeholder.com/150' // Placeholder cover
                }));
        } catch (error) {
            console.error(`Error reading directory ${categoryDir}:`, error);
            playlists[category] = [];
        }
    });

    res.json(playlists);
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
