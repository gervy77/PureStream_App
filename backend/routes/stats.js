const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const [users, songs, playlists] = await Promise.all([
      User.countDocuments(),
      Song.countDocuments(),
      Playlist.countDocuments()
    ]);
    res.json({
      users,
      songs,
      playlists
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
  }
});

module.exports = router; 