const express = require('express');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');

const router = express.Router();

// Obtenir les chansons favorites de l'utilisateur
router.get('/songs', auth, async (req, res) => {
  try {
    const songs = await Song.find({
      likes: req.user.userId,
      isPublic: true
    }).populate('uploadedBy', 'username');

    res.json({
      songs: songs.map(song => song.toPublicJSON())
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des chansons favorites:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des chansons favorites' });
  }
});

// Obtenir les playlists favorites de l'utilisateur
router.get('/playlists', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({
      followers: req.user.userId,
      isPublic: true
    }).populate('owner', 'username');

    res.json({
      playlists: playlists.map(playlist => playlist.toPublicJSON())
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des playlists favorites:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des playlists favorites' });
  }
});

// Ajouter/Retirer une chanson des favoris
router.post('/songs/:id', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Chanson non trouvée' });
    }

    await song.toggleLike(req.user.userId);

    res.json({
      message: 'Favoris mis à jour',
      isLiked: song.likes.includes(req.user.userId)
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des favoris:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des favoris' });
  }
});

// Ajouter/Retirer une playlist des favoris
router.post('/playlists/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    const followerIndex = playlist.followers.indexOf(req.user.userId);
    if (followerIndex === -1) {
      playlist.followers.push(req.user.userId);
    } else {
      playlist.followers.splice(followerIndex, 1);
    }

    await playlist.save();

    res.json({
      message: 'Favoris mis à jour',
      isFollowed: playlist.followers.includes(req.user.userId)
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des favoris:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des favoris' });
  }
});

// Vérifier si une chanson est dans les favoris
router.get('/songs/:id/check', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Chanson non trouvée' });
    }

    const isLiked = song.likes.includes(req.user.userId);

    res.json({ isLiked });
  } catch (error) {
    console.error('Erreur lors de la vérification des favoris:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification des favoris' });
  }
});

// Vérifier si une playlist est dans les favoris
router.get('/playlists/:id/check', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    const isFollowed = playlist.followers.includes(req.user.userId);

    res.json({ isFollowed });
  } catch (error) {
    console.error('Erreur lors de la vérification des favoris:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification des favoris' });
  }
});

module.exports = router; 