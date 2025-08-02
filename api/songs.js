const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    const musicDir = path.join(process.cwd(), 'music');
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
                    src: `/music/${category}/${file}`,
                    cover: 'https://via.placeholder.com/150'
                }));
        } catch (error) {
            playlists[category] = [];
        }
    });

    res.status(200).json(playlists);
}
