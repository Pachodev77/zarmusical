// Next.js API route compatible con Vercel para servir playlists desde Google Drive

export default function handler(req, res) {
  const playlists = {
    urbano: [
      { title: "Dark Boy - Gangsta Track feat. Tupac & 50 Cent", artist: "Desconocido", src: "/api/stream?id=1HRVBZTA9UgdISnIAYT4XcQSt11hjlI8n", cover: "https://via.placeholder.com/150" },
      { title: "Notorious BIG, Frank Sinatra Everyday Struggle A Day in the Life of a Fool REMIX", artist: "Desconocido", src: "/api/stream?id=1upv4UbcSlqAdX6QMEj1K8WbXmwhVz-Fg", cover: "https://via.placeholder.com/150" },
      { title: "2Pac - Pistol To My Head Remix", artist: "Desconocido", src: "/api/stream?id=1kth7rad3KgjKiHEKVk7-BkU3uJ_8ay_v", cover: "https://via.placeholder.com/150" },
      { title: "The Notorious B.I.G. ft. 2Pac - Runnin' (Izzamuzzic Remix)24 hours in criminal LA", artist: "Desconocido", src: "/api/stream?id=1bO2WE4xVKeHvfMdjM2humN37htCMHmnh", cover: "https://via.placeholder.com/150" },
      { title: "Notorious B.I.G. - Suicidal Thoughts [L'indécis Remix]", artist: "Desconocido", src: "/api/stream?id=1Js-NQr6bFGvJwGFA-CQz7Li8sHKtSa6-", cover: "https://via.placeholder.com/150" },
      { title: "Before The Great Collapse", artist: "Desconocido", src: "/api/stream?id=1Tjx1BP975CDfJX57QFussCA_GdWDXPqQ", cover: "https://via.placeholder.com/150" },
      { title: "ap.9-questions", artist: "Desconocido", src: "/api/stream?id=1rZnAcjJdveoWQ8oRcQYj9n3XzThhwZOz", cover: "https://via.placeholder.com/150" },
      { title: "animal_rap_(ft._kool_g._rap)", artist: "Desconocido", src: "/api/stream?id=1oRgJksftUTB4WJ7apuy2UJDTQ0iB10iZ", cover: "https://via.placeholder.com/150" },
      { title: "2Pac - Hit 'Em Up (Dirty) (Official Video) HD", artist: "Desconocido", src: "/api/stream?id=1txJTc3a5DsCPxUmUzn5Z1sqT6LfkDxLB", cover: "https://via.placeholder.com/150" },
      { title: "2pac - Gangsta Party", artist: "Desconocido", src: "/api/stream?id=1TDXu23sFedmf83p2k4Vmn5LIveMSXbAI", cover: "https://via.placeholder.com/150" },
      { title: "Three 6 Mafia - Stay Fly", artist: "Desconocido", src: "/api/stream?id=15munU-ckScgo243JwpJjZ9QcAl-4elt7", cover: "https://via.placeholder.com/150" },
      { title: "M.O.P - Cold as Ice", artist: "Desconocido", src: "/api/stream?id=1Qt1SRM8PtMSFVi787ZrX1OZpCDYsXQtK", cover: "https://via.placeholder.com/150" },
      { title: "DMX - X Gon' Give It To Ya", artist: "Desconocido", src: "/api/stream?id=19Pkh0oYMZcQ8tzpwW2cevv2v3REMAh9w", cover: "https://via.placeholder.com/150" },
      { title: "50 Cent - In Da Club", artist: "Desconocido", src: "/api/stream?id=1YiwMryo3PxEGjeyxZttnv3x2TiYFxiLx", cover: "https://via.placeholder.com/150" },
      { title: "Snoop Dogg Feat. Nate Dogg & Xzibit - Bitch Please", artist: "Desconocido", src: "/api/stream?id=1buyYA6cfnOkAbgpnAdDansDikKU3X-vU", cover: "https://via.placeholder.com/150" },
      { title: "The Game Run Up. feat.  Ice Cube & YG.", artist: "Desconocido", src: "/api/stream?id=1c7HiwpAPA23n_aHKWUGllfMryhlSvO7E", cover: "https://via.placeholder.com/150" },
      { title: "Dope Boys", artist: "Desconocido", src: "/api/stream?id=1jE-8Dz0iywUBtilGGSDFi9sr4WelhjCn", cover: "https://via.placeholder.com/150" },
      { title: "The Game - Block Wars", artist: "Desconocido", src: "/api/stream?id=12uEnaCeb8n_6O-1bhHOYumn3yyfrCm3E", cover: "https://via.placeholder.com/150" },
      { title: "Bow Wow feat. Snoop Dogg - That's My Name", artist: "Desconocido", src: "/api/stream?id=174dGpkfSdrKKuRongWrFosXMrsEXYV2X", cover: "https://via.placeholder.com/150" },
      { title: "The Game - Put You On The Game", artist: "Desconocido", src: "/api/stream?id=1o-kV5HjzdZneh7hCT1EniJibPpqK97xo", cover: "https://via.placeholder.com/150" },
      { title: "The Game - How We Do", artist: "Desconocido", src: "/api/stream?id=15386E2Fy6qdnx5Z4FCxl61VbSeLtjFhe", cover: "https://via.placeholder.com/150" },
      { title: "Snoop Dogg - Drop It Like It's Hot ft. Pharrell Williams", artist: "Desconocido", src: "/api/stream?id=1jbJS9fspPpht5qvq4CjsmXrBZ5v5ZY8S", cover: "https://via.placeholder.com/150" },
      { title: "Trick Trick - Welcome 2 Detroit ft. Eminem", artist: "Desconocido", src: "/api/stream?id=1mD-VS_Qw5DE_Ob7Je9QVRbkHgjWVQKvD", cover: "https://via.placeholder.com/150" },
      { title: "The Game - My Life ft. Lil Wayne", artist: "Desconocido", src: "/api/stream?id=1wdBz6Xx5NnIlvU39F0fQQ67p0fpBoNPL", cover: "https://via.placeholder.com/150" },
      { title: "Tapout (Explicit)", artist: "Desconocido", src: "/api/stream?id=1j9HcJQN5NytweLy1icyp_Vei-nQhDjrq", cover: "https://via.placeholder.com/150" },
      { title: "Rocko - You Don't Even Know It (Feat. Future & Rick Ross)", artist: "Desconocido", src: "/api/stream?id=1-0G71FECP0cuNJAscWxV2Tqg7mGhswaP", cover: "https://via.placeholder.com/150" },
      { title: "Sean Paul ft Blu Cantrel-Breath", artist: "Desconocido", src: "/api/stream?id=1hPtzJ9yrkhcwGD1hy8ngkbnCClb7bDVD", cover: "https://via.placeholder.com/150" },
      { title: "Petey Pablo - Raise Up (Lyrics)", artist: "Desconocido", src: "/api/stream?id=1tMABisxXAnhK_k3pW8YpNMrNj29XkAs2", cover: "https://via.placeholder.com/150" },
      { title: "Mobb Deep feat. LIL JON - REAL GANGSTAZ UNCENSORED High Quality", artist: "Desconocido", src: "/api/stream?id=1I9jy1s5sS0ymMyh3b7c0tjergAyt97Qz", cover: "https://via.placeholder.com/150" },
      { title: "Mobb Deep - Shook Ones Part II (HD)", artist: "Desconocido", src: "/api/stream?id=1uaZIsNkAIBVaCD5unSK9P5XJK_BN952h", cover: "https://via.placeholder.com/150" },
      { title: "Lil Wayne - Love Me (Explicit) ft. Drake, Future", artist: "Desconocido", src: "/api/stream?id=1R39Yidh17RbHIFWQ8kfeldkZcWS0Qlsk", cover: "https://via.placeholder.com/150" },
      { title: "Lil Wayne ft.The game ''my life''", artist: "Desconocido", src: "/api/stream?id=1Wr6DbI7duL7jmH0TlAfOMTR13b-0Pffh", cover: "https://via.placeholder.com/150" },
      { title: "Gang Starr- Battle with Lyrics", artist: "Desconocido", src: "/api/stream?id=1D7mSonCU_oLU35s-L6N23uVmNTouqno0", cover: "https://via.placeholder.com/150" },
      { title: "Eminem  -  Superman", artist: "Desconocido", src: "/api/stream?id=1GKKR1i4AXA2pd12U_cFUBaT15pW4sb9l", cover: "https://via.placeholder.com/150" },
      { title: "Eminem - Go To Sleep (UNCENSORED)", artist: "Desconocido", src: "/api/stream?id=1Wd8qutJXJ-pU97NAm1vpkWbS_RoLo7Bm", cover: "https://via.placeholder.com/150" },
      { title: "David Banner - Like A Pimp ft. Lil' Flip", artist: "Desconocido", src: "/api/stream?id=1fpEkY8QJ37ElCTp5knCZAUjGoYkjBo9s", cover: "https://via.placeholder.com/150" },
      { title: "Busta Rhymes - Break Your Neck (Dirty)", artist: "Desconocido", src: "/api/stream?id=1DC7b5q83UuHD9-XYRzFJSh_pa9RLLsA_", cover: "https://via.placeholder.com/150" },
      { title: "B.o.B - Still In This Bitch ft. T.I.   Juicy J", artist: "Desconocido", src: "/api/stream?id=1a9BE6e3V_V57_nj8JSYIRZIZd7p0we_d", cover: "https://via.placeholder.com/150" },
      { title: "Afu-Ra - Defeat (192  kbps)", artist: "Desconocido", src: "/api/stream?id=1eWx_J-YU54vXNRG9ijXoGl7DXZZI_rWu", cover: "https://via.placeholder.com/150" }
    ],
    latino: [
      { title: "Jamby El Favo - 7_Y Pico 🕖 (Video Oficial)", artist: "Desconocido", src: "/api/stream?id=1jeZLrQ5Q83bKCEZUM-oUsc3eaql2lUoy", cover: "https://via.placeholder.com/150" },
      { title: "003 Recuerda ZAYAN MAXIMA", artist: "Desconocido", src: "/api/stream?id=1uPcf0jIXNeZyUBnn91l168EJf53qY19-", cover: "https://via.placeholder.com/150" },
      { title: "015 No se -ZAYAN MAXIMA", artist: "Desconocido", src: "/api/stream?id=1HhQEsDV7J6okrp3Yh4nOcaMeSaH_nzXt", cover: "https://via.placeholder.com/150" },
      { title: "050 La Romana FT El Alfa   Bad bunny   X 100PRE", artist: "Desconocido", src: "/api/stream?id=1byI9IiVkVfbtTMNWoxMtKEcBtQIRdOMP", cover: "https://via.placeholder.com/150" },
      { title: "017. Reggaeton--J Balvin", artist: "Desconocido", src: "/api/stream?id=1iWcQZ_eOsRXg98BugSsCetnHh9QyLtyx", cover: "https://via.placeholder.com/150" }
    ],
    electro: [
      { title: "Mandragora - Sem Você Sou Ninguém (Full Version)", artist: "Desconocido", src: "/api/stream?id=1s5tgp_CxrphcGMBMagNplGX13RO6GGYH", cover: "https://via.placeholder.com/150" },
      { title: "Candy Kungs - Maurik Ft. Jasmine Thompson (Remix) ZAPATEO TRAVEL", artist: "Desconocido", src: "/api/stream?id=1OkiUD33RgidX4SrzPC7kEiWEGoN_XXrm", cover: "https://via.placeholder.com/150" },
      { title: "Moska - House Religion (Official Lyric Video)", artist: "Desconocido", src: "/api/stream?id=1F5bZA84dChFESPtsVHONvd6qOp2worXr", cover: "https://via.placeholder.com/150" },
      { title: "BORGORE & SIKDOPE - Unicorn Zombie Apocalypse (Original Mix)", artist: "Desconocido", src: "/api/stream?id=1Ydng0BSsKDbn3LGeL6UihIT5flaSBUxe", cover: "https://via.placeholder.com/150" },
      { title: "Dimitri Vegas, MOGUAI & Like Mike - Mammoth (Original Mix)", artist: "Desconocido", src: "/api/stream?id=1ppcT4hXCCY9iTPf1ItV-Fkr-A9WucS_e", cover: "https://via.placeholder.com/150" }
    ]
  };

  res.status(200).json(playlists);
}
