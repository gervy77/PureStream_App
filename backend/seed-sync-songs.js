const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Song = require('./models/Song');
const User = require('./models/User');
require('dotenv').config();

const SONGS_DIR = path.join(__dirname, 'uploads', 'songs');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purestream', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const syncSongs = async () => {
  try {
    console.log('🔄 Synchronisation des fichiers mp3 avec la base de données...');

    // Utilisateur de test (ou premier utilisateur trouvé)
    let user = await User.findOne();
    if (!user) {
      user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      await user.save();
    }

    // Supprimer toutes les chansons existantes
    await Song.deleteMany({});
    console.log('Toutes les anciennes chansons supprimées.');

    // Parcourir tous les fichiers mp3
    const files = fs.readdirSync(SONGS_DIR).filter(f => f.endsWith('.mp3'));
    let count = 0;
    for (const file of files) {
      const title = path.basename(file, '.mp3');
      const song = new Song({
        title: title,
        artist: 'Demo Artist',
        album: 'Demo Album',
        genre: 'Demo',
        duration: 180,
        filePath: `uploads/songs/${file}`,
        lyrics: '',
        releaseYear: 2024,
        tags: ['demo'],
        isPublic: true,
        uploadedBy: user._id,
        playCount: Math.floor(Math.random() * 1000)
      });
      await song.save();
      count++;
      console.log(`Ajouté : ${file}`);
    }
    console.log(`✅ Synchronisation terminée : ${count} chansons.`);
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la synchronisation :', err);
    process.exit(1);
  }
};

syncSongs(); 