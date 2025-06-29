const mongoose = require('mongoose');
const User = require('./models/User');
const Song = require('./models/Song');
const Playlist = require('./models/Playlist');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purestream', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleSongs = [
  {
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    genre: "Rock",
    duration: 354,
    filePath: "uploads/songs/sample-1.mp3",
    lyrics: "Is this the real life? Is this just fantasy?",
    releaseYear: 1975,
    tags: ["classic", "rock", "opera"],
    isPublic: true
  },
  {
    title: "Hotel California",
    artist: "Eagles",
    album: "Hotel California",
    genre: "Rock",
    duration: 391,
    filePath: "uploads/songs/sample-2.mp3",
    lyrics: "Welcome to the Hotel California",
    releaseYear: 1976,
    tags: ["classic", "rock", "guitar"],
    isPublic: true
  },
  {
    title: "Imagine",
    artist: "John Lennon",
    album: "Imagine",
    genre: "Pop",
    duration: 183,
    filePath: "uploads/songs/sample-3.mp3",
    lyrics: "Imagine all the people living life in peace",
    releaseYear: 1971,
    tags: ["peace", "pop", "classic"],
    isPublic: true
  },
  {
    title: "What a Wonderful World",
    artist: "Louis Armstrong",
    album: "What a Wonderful World",
    genre: "Jazz",
    duration: 139,
    filePath: "uploads/songs/sample-4.mp3",
    lyrics: "I see trees of green, red roses too",
    releaseYear: 1967,
    tags: ["jazz", "classic", "peaceful"],
    isPublic: true
  },
  {
    title: "Stairway to Heaven",
    artist: "Led Zeppelin",
    album: "Led Zeppelin IV",
    genre: "Rock",
    duration: 482,
    filePath: "uploads/songs/sample-5.mp3",
    lyrics: "There's a lady who's sure all that glitters is gold",
    releaseYear: 1971,
    tags: ["rock", "classic", "guitar"],
    isPublic: true
  },
  {
    title: "Billie Jean",
    artist: "Michael Jackson",
    album: "Thriller",
    genre: "Pop",
    duration: 294,
    filePath: "uploads/songs/sample-6.mp3",
    lyrics: "Billie Jean is not my lover",
    releaseYear: 1982,
    tags: ["pop", "dance", "classic"],
    isPublic: true
  },
  {
    title: "Take Five",
    artist: "Dave Brubeck",
    album: "Time Out",
    genre: "Jazz",
    duration: 324,
    filePath: "uploads/songs/sample-7.mp3",
    lyrics: "Instrumental",
    releaseYear: 1959,
    tags: ["jazz", "instrumental", "classic"],
    isPublic: true
  },
  {
    title: "Smells Like Teen Spirit",
    artist: "Nirvana",
    album: "Nevermind",
    genre: "Rock",
    duration: 301,
    filePath: "uploads/songs/sample-8.mp3",
    lyrics: "Load up on guns, bring your friends",
    releaseYear: 1991,
    tags: ["grunge", "rock", "90s"],
    isPublic: true
  }
];

// Ajout de 20 chansons de test pour les fichiers téléchargés
for (let i = 1; i <= 20; i++) {
  sampleSongs.push({
    title: `Test Song ${i}`,
    artist: `Test Artist ${i}`,
    album: `Test Album`,
    genre: 'Test',
    duration: 180,
    filePath: `uploads/songs/song${i}.mp3`,
    lyrics: '',
    releaseYear: 2024,
    tags: ['test', 'demo'],
    isPublic: true
  });
}

const seedData = async () => {
  try {
    console.log('🌱 Démarrage du seeding des données...');

    // Trouver un utilisateur existant ou en créer un
    let user = await User.findOne({ email: 'test@example.com' });
    
    if (!user) {
      console.log('Création d\'un utilisateur de test...');
      user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        favoriteGenres: ['Rock', 'Pop', 'Jazz'],
        bio: 'Utilisateur de test pour les données de démonstration'
      });
      await user.save();
    }

    console.log('Utilisateur:', user.username);

    // Supprimer les anciennes chansons de test
    await Song.deleteMany({ uploadedBy: user._id });
    console.log('Anciennes chansons supprimées');

    // Ajouter les nouvelles chansons
    const songs = [];
    for (const songData of sampleSongs) {
      const song = new Song({
        ...songData,
        uploadedBy: user._id,
        playCount: Math.floor(Math.random() * 1000) // Nombre de lectures aléatoire
      });
      songs.push(await song.save());
    }

    console.log(`${songs.length} chansons ajoutées`);

    // Créer quelques playlists de test
    const playlists = [
      {
        name: "Classics Rock",
        description: "Les meilleurs classiques du rock",
        isPublic: true,
        tags: ["rock", "classic", "playlist"],
        songs: songs.filter(s => s.genre === 'Rock').slice(0, 3)
      },
      {
        name: "Jazz Vibes",
        description: "Ambiance jazz relaxante",
        isPublic: true,
        tags: ["jazz", "relax", "playlist"],
        songs: songs.filter(s => s.genre === 'Jazz').slice(0, 2)
      },
      {
        name: "Pop Hits",
        description: "Les tubes pop intemporels",
        isPublic: true,
        tags: ["pop", "hits", "playlist"],
        songs: songs.filter(s => s.genre === 'Pop').slice(0, 2)
      }
    ];

    // Supprimer les anciennes playlists de test
    await Playlist.deleteMany({ owner: user._id });
    console.log('Anciennes playlists supprimées');

    // Créer les nouvelles playlists
    for (const playlistData of playlists) {
      const playlist = new Playlist({
        ...playlistData,
        owner: user._id
      });

      // Ajouter les chansons à la playlist
      for (const song of playlistData.songs) {
        await playlist.addSong(song._id, user._id);
      }

      await playlist.calculateTotalDuration();
      await playlist.save();
    }

    console.log(`${playlists.length} playlists créées`);

    // Afficher les statistiques
    const totalSongs = await Song.countDocuments();
    const totalPlaylists = await Playlist.countDocuments();
    const genres = await Song.distinct('genre');

    console.log('\n📊 Statistiques des données de test:');
    console.log(`- Chansons totales: ${totalSongs}`);
    console.log(`- Playlists totales: ${totalPlaylists}`);
    console.log(`- Genres disponibles: ${genres.join(', ')}`);

    console.log('\n✅ Seeding terminé avec succès!');
    console.log('Tu peux maintenant tester:');
    console.log('- GET /api/songs/genres');
    console.log('- GET /api/users/recommendations');
    console.log('- GET /api/songs/popular');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Exécuter le seeding si le script est appelé directement
if (require.main === module) {
  seedData();
}

module.exports = { seedData }; 