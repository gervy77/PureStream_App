const express = require('express');
const User = require('../models/User');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');

const router = express.Router();

// Obtenir les recommandations personnalisées
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const limit = parseInt(req.query.limit) || 20;

    // Obtenir les genres favoris de l'utilisateur
    const favoriteGenres = user.favoriteGenres;

    // Obtenir les chansons populaires dans les genres favoris
    let recommendedSongs = [];
    if (favoriteGenres.length > 0) {
      recommendedSongs = await Song.find({
        genre: { $in: favoriteGenres },
        isPublic: true
      })
      .populate('uploadedBy', 'username')
      .sort({ playCount: -1 })
      .limit(limit);
    }

    // Si pas assez de chansons, ajouter des chansons populaires générales
    if (recommendedSongs.length < limit) {
      const popularSongs = await Song.find({
        isPublic: true,
        _id: { $nin: recommendedSongs.map(s => s._id) }
      })
      .populate('uploadedBy', 'username')
      .sort({ playCount: -1 })
      .limit(limit - recommendedSongs.length);

      recommendedSongs = [...recommendedSongs, ...popularSongs];
    }

    // Obtenir les playlists populaires
    const recommendedPlaylists = await Playlist.find({
      isPublic: true
    })
    .populate('owner', 'username')
    .sort({ playCount: -1 })
    .limit(10);

    // Obtenir les utilisateurs à suivre (basé sur les genres favoris)
    const usersToFollow = await User.find({
      _id: { $ne: req.user.userId },
      favoriteGenres: { $in: favoriteGenres }
    })
    .limit(5);

    res.json({
      songs: recommendedSongs.map(song => song.toPublicJSON()),
      playlists: recommendedPlaylists.map(playlist => playlist.toPublicJSON()),
      usersToFollow: usersToFollow.map(user => user.toPublicJSON())
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des recommandations' });
  }
});

// Rechercher des utilisateurs
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let filter = {};
    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .sort({ followers: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users: users.map(user => user.toPublicJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche d\'utilisateurs' });
  }
});

// Obtenir le profil d'un utilisateur
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user: user.toPublicJSON() });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Suivre/Ne plus suivre un utilisateur
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous suivre vous-même' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Ne plus suivre
      currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== req.user.userId);
    } else {
      // Suivre
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.userId);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: isFollowing ? 'Utilisateur non suivi' : 'Utilisateur suivi',
      isFollowing: !isFollowing
    });
  } catch (error) {
    console.error('Erreur lors du suivi:', error);
    res.status(500).json({ error: 'Erreur lors du suivi' });
  }
});

// Obtenir les utilisateurs suivis
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username profilePicture bio');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      following: user.following.map(u => u.toPublicJSON())
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs suivis:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs suivis' });
  }
});

// Obtenir les followers
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username profilePicture bio');
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      followers: user.followers.map(u => u.toPublicJSON())
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des followers:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des followers' });
  }
});

// Obtenir les playlists d'un utilisateur
router.get('/:id/playlists', async (req, res) => {
  try {
    const playlists = await Playlist.find({
      owner: req.params.id,
      isPublic: true
    }).populate('owner', 'username');

    res.json({
      playlists: playlists.map(playlist => playlist.toPublicJSON())
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des playlists:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des playlists' });
  }
});

// Obtenir les chansons uploadées par un utilisateur
router.get('/:id/songs', async (req, res) => {
  try {
    const songs = await Song.find({
      uploadedBy: req.params.id,
      isPublic: true
    }).populate('uploadedBy', 'username');

    res.json({
      songs: songs.map(song => song.toPublicJSON())
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des chansons:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des chansons' });
  }
});

module.exports = router; 