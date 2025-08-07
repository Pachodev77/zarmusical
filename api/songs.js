const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
  const playlists = {
    urbano: [
      {
        title: "Calle 13 - Atrévete",
        artist: "Calle 13",
        src: "https://drive.google.com/uc?export=download&id=1A2B3C4D5E6F7G8H9I0J",
        cover: "https://drive.google.com/uc?export=view&id=1A2B3C4D5E6F7G8H9I0J"
      },
      {
        title: "Residente - Bellacoso",
        artist: "Residente ft. Bad Bunny",
        src: "https://drive.google.com/uc?export=download&id=2B3C4D5E6F7G8H9I0J1A",
        cover: "https://drive.google.com/uc?export=view&id=2B3C4D5E6F7G8H9I0J1A"
      }
    ],
    latino: [
      {
        title: "Shakira - Hips Don't Lie",
        artist: "Shakira ft. Wyclef Jean",
        src: "https://drive.google.com/uc?export=download&id=3C4D5E6F7G8H9I0J1A2B",
        cover: "https://drive.google.com/uc?export=view&id=3C4D5E6F7G8H9I0J1A2B"
      },
      {
        title: "Luis Fonsi - Despacito",
        artist: "Luis Fonsi ft. Daddy Yankee",
        src: "https://drive.google.com/uc?export=download&id=4D5E6F7G8H9I0J1A2B3C",
        cover: "https://drive.google.com/uc?export=view&id=4D5E6F7G8H9I0J1A2B3C"
      }
    ],
    electro: [
      {
        title: "Daft Punk - One More Time",
        artist: "Daft Punk",
        src: "https://drive.google.com/uc?export=download&id=5E6F7G8H9I0J1A2B3C4D",
        cover: "https://drive.google.com/uc?export=view&id=5E6F7G8H9I0J1A2B3C4D"
      },
      {
        title: "Martin Garrix - Animals",
        artist: "Martin Garrix",
        src: "https://drive.google.com/uc?export=download&id=6F7G8H9I0J1A2B3C4D5E",
        cover: "https://drive.google.com/uc?export=view&id=6F7G8H9I0J1A2B3C4D5E"
      }
    ]
  };
  res.status(200).json(playlists);
}

