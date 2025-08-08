// Next.js API route compatible con Vercel para servir playlists desde Google Drive

export default function handler(req, res) {
  const playlists = {
    urbano: [
      { title: "Dark Boy - Gangsta Track feat. Tupac & 50 Cent", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617428/Dark_Boy_-_Gangsta_Track_feat._Tupac_50_Cent_xtjv3s.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Notorious BIG, Frank Sinatra Everyday Struggle A Day in the Life of a Fool REMIX", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617423/Notorious_BIG_Frank_Sinatra_Everyday_Struggle_A_Day_in_the_Life_of_a_Fool_REMIX_pp3h1j.mp3", cover: "https://via.placeholder.com/150" },
      { title: "2Pac - Pistol To My Head Remix", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617418/2Pac_-_Pistol_To_My_Head_Remix_xw38bt.mp3", cover: "https://via.placeholder.com/150" },
      { title: "The Notorious B.I.G. ft. 2Pac - Runnin' (Izzamuzzic Remix)24 hours in criminal LA", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617416/The_Notorious_B.I.G._ft._2Pac_-_Runnin_Izzamuzzic_Remix_24_hours_in_criminal_LA_tt6s2h.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Notorious B.I.G. - Suicidal Thoughts [L'indécis Remix]", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617319/Notorious_B.I.G._-_Suicidal_Thoughts_L_ind%C3%A9cis_Remix_ceh08l.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Before The Great Collapse", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617203/Before_The_Great_Collapse_dye8il.mp3", cover: "https://via.placeholder.com/150" },
      { title: "ap.9-questions", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617192/ap.9-questions_ci5i8g.mp3", cover: "https://via.placeholder.com/150" },
      { title: "animal_rap_(ft._kool_g._rap)", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617188/animal_rap__ft._kool_g._rap_nmj2ui.mp3", cover: "https://via.placeholder.com/150" },
      { title: "2Pac - Hit 'Em Up (Dirty) (Official Video) HD", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617130/2Pac_-_Hit_Em_Up_Dirty_Official_Video_HD_rxwkvh.mp3", cover: "https://via.placeholder.com/150" },
      { title: "2pac - Gangsta Party", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617112/2pac_-_Gangsta_Party_dhzdvx.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Three 6 Mafia - Stay Fly", artist: "Desconocido", src: "/api/stream?id=15munU-ckScgo243JwpJjZ9QcAl-4elt7", cover: "https://via.placeholder.com/150" },
      { title: "M.O.P - Cold as Ice", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617306/M.O.P_-_Cold_as_Ice_qkss6l.mp3", cover: "https://via.placeholder.com/150" },
      { title: "DMX - X Gon' Give It To Ya", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617235/DMX_-_X_Gon_Give_It_To_Ya_b5xwyc.mp3", cover: "https://via.placeholder.com/150" },
      { title: "50 Cent - In Da Club", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617128/50_Cent_-_In_Da_Club_vsqwao.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Snoop Dogg Feat. Nate Dogg & Xzibit - Bitch Please", artist: "Desconocido", src: "/api/stream?id=1buyYA6cfnOkAbgpnAdDansDikKU3X-vU", cover: "https://via.placeholder.com/150" },
      { title: "The Game Run Up. feat.  Ice Cube & YG.", artist: "Desconocido", src: "/api/stream?id=1c7HiwpAPA23n_aHKWUGllfMryhlSvO7E", cover: "https://via.placeholder.com/150" },
      { title: "Dope Boys", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617248/Dope_Boys_wyw3yj.mp3", cover: "https://via.placeholder.com/150" },
      { title: "The Game - Block Wars", artist: "Desconocido", src: "/api/stream?id=12uEnaCeb8n_6O-1bhHOYumn3yyfrCm3E", cover: "https://via.placeholder.com/150" },
      { title: "Bow Wow feat. Snoop Dogg - That's My Name", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617205/Bow_Wow_feat._Snoop_Dogg_-_That_s_My_Name_ol9hmq.mp3", cover: "https://via.placeholder.com/150" },
      { title: "The Game - Put You On The Game", artist: "Desconocido", src: "/api/stream?id=1o-kV5HjzdZneh7hCT1EniJibPpqK97xo", cover: "https://via.placeholder.com/150" },
      { title: "The Game - How We Do", artist: "Desconocido", src: "/api/stream?id=15386E2Fy6qdnx5Z4FCxl61VbSeLtjFhe", cover: "https://via.placeholder.com/150" },
      { title: "Snoop Dogg - Drop It Like It's Hot ft. Pharrell Williams", artist: "Desconocido", src: "/api/stream?id=1jbJS9fspPpht5qvq4CjsmXrBZ5v5ZY8S", cover: "https://via.placeholder.com/150" },
      { title: "Trick Trick - Welcome 2 Detroit ft. Eminem", artist: "Desconocido", src: "/api/stream?id=1mD-VS_Qw5DE_Ob7Je9QVRbkHgjWVQKvD", cover: "https://via.placeholder.com/150" },
      { title: "The Game - My Life ft. Lil Wayne", artist: "Desconocido", src: "/api/stream?id=1wdBz6Xx5NnIlvU39F0fQQ67p0fpBoNPL", cover: "https://via.placeholder.com/150" },
      { title: "Tapout (Explicit)", artist: "Desconocido", src: "/api/stream?id=1j9HcJQN5NytweLy1icyp_Vei-nQhDjrq", cover: "https://via.placeholder.com/150" },
      { title: "Rocko - You Don't Even Know It (Feat. Future & Rick Ross)", artist: "Desconocido", src: "/api/stream?id=1-0G71FECP0cuNJAscWxV2Tqg7mGhswaP", cover: "https://via.placeholder.com/150" },
      { title: "Sean Paul ft Blu Cantrel-Breath", artist: "Desconocido", src: "/api/stream?id=1hPtzJ9yrkhcwGD1hy8ngkbnCClb7bDVD", cover: "https://via.placeholder.com/150" },
      { title: "Petey Pablo - Raise Up (Lyrics)", artist: "Desconocido", src: "/api/stream?id=1tMABisxXAnhK_k3pW8YpNMrNj29XkAs2", cover: "https://via.placeholder.com/150" },
      { title: "Mobb Deep feat. LIL JON - REAL GANGSTAZ UNCENSORED High Quality", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617300/Mobb_Deep_feat._LIL_JON_-_REAL_GANGSTAZ_UNCENSORED_High_Quality_mtl3zu.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Mobb Deep - Shook Ones Part II (HD)", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617302/Mobb_Deep_-_Shook_Ones_Part_II_HD_wffq92.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Lil Wayne - Love Me (Explicit) ft. Drake, Future", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617279/Lil_Wayne_-_Love_Me_Explicit_ft._Drake_Future_ekpgza.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Lil Wayne ft.The game ''my life''", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617285/Lil_Wayne_ft.The_game_my_life_xibdeu.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Gang Starr- Battle with Lyrics", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617269/Gang_Starr-_Battle_with_Lyrics_ukxcjo.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Eminem  -  Superman", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617268/Eminem_-_Superman_hv2vfd.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Eminem - Go To Sleep (UNCENSORED)", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617257/Eminem_-_Go_To_Sleep_UNCENSORED_t0vext.mp3", cover: "https://via.placeholder.com/150" },
      { title: "David Banner - Like A Pimp ft. Lil' Flip", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617237/David_Banner_-_Like_A_Pimp_ft._Lil_Flip_kf1yac.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Busta Rhymes - Break Your Neck (Dirty)", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617216/Busta_Rhymes_-_Break_Your_Neck_Dirty_kxhivm.mp3", cover: "https://via.placeholder.com/150" },
      { title: "B.o.B - Still In This Bitch ft. T.I.   Juicy J", artist: "Desconocido", src: "/api/stream?id=1a9BE6e3V_V57_nj8JSYIRZIZd7p0we_d", cover: "https://via.placeholder.com/150" },
      { title: "Afu-Ra - Defeat (192  kbps)", artist: "Desconocido", src: "/api/stream?id=1eWx_J-YU54vXNRG9ijXoGl7DXZZI_rWu", cover: "https://via.placeholder.com/150" }
    ],
    latino: [
      { title: "Jamby El Favo - 7_Y Pico 🕖 (Video Oficial)", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617098/Jamby_El_Favo_-_7_Y_Pico_Video_Oficial_ihkz9q.mp3", cover: "https://via.placeholder.com/150" },
      { title: "003 Recuerda ZAYAN MAXIMA", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617052/003_Recuerda_ZAYAN_MAXIMA_v8wrrr.mp3", cover: "https://via.placeholder.com/150" },
      { title: "015 No se -ZAYAN MAXIMA", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617066/015_No_se_-ZAYAN_MAXIMA_l6xm0f.mp3", cover: "https://via.placeholder.com/150" },
      { title: "050 La Romana FT El Alfa   Bad bunny   X 100PRE", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617141/050_La_Romana_FT_El_Alfa_Bad_bunny_X_100PRE_yq6khl.mp3", cover: "https://via.placeholder.com/150" },
      { title: "017. Reggaeton--J Balvin", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617057/017._Reggaeton--J_Balvin_fgoecj.mp3", cover: "https://via.placeholder.com/150" }
    ],
    electro: [
      { title: "Mandragora - Sem Você Sou Ninguém (Full Version)", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754617014/Mandragora_-_Sem_Voc%C3%AA_Sou_Ningu%C3%A9m_Full_Version_lyvx6z.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Candy Kungs - Maurik Ft. Jasmine Thompson (Remix) ZAPATEO TRAVEL", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754616296/Candy_Kungs_-_Maurik_Ft._Jasmine_Thompson_Remix_ZAPATEO_TRAVEL_ty98u2.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Moska - House Religion (Official Lyric Video)", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754616594/Moska_-_House_Religion_Official_Lyric_Video_bmw5sk.mp3", cover: "https://via.placeholder.com/150" },
      { title: "BORGORE & SIKDOPE - Unicorn Zombie Apocalypse (Original Mix)", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754616238/BORGORE_SIKDOPE_-_Unicorn_Zombie_Apocalypse_Original_Mix_x2czws.mp3", cover: "https://via.placeholder.com/150" },
      { title: "Dimitri Vegas, MOGUAI & Like Mike - Mammoth (Original Mix)", artist: "Desconocido", src: "https://res.cloudinary.com/dxrbvgr1o/video/upload/v1754616379/Dimitri_Vegas_MOGUAI_Like_Mike_-_Mammoth_Original_Mix_ziitob.mp3", cover: "https://via.placeholder.com/150" }
    ]
  };

  res.status(200).json(playlists);
}
