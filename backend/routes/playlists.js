const express = require('express');
const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

const router = express.Router();

// Créer une nouvelle playlist
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPublic, isCollaborative, tags } = req.body;

    const playlist = new Playlist({
      name,
      description,
      isPublic: isPublic !== undefined ? isPublic : true,
      isCollaborative: isCollaborative !== undefined ? isCollaborative : false,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      owner: req.user.userId
    });

    await playlist.save();

    res.status(201).json({
      message: 'Playlist créée avec succès',
      playlist: playlist.toPublicJSON()
    });
  } catch (error) {
    console.error('Erreur lors de la création de la playlist:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la playlist' });
  }
});

// Obtenir toutes les playlists de l'utilisateur
router.get('/my', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({
      $or: [
        { owner: req.user.userId },
        { collaborators: req.user.userId }
      ]
    }).populate('owner', 'username');

    res.json({
      playlists: playlists.map(playlist => playlist.toPublicJSON())
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des playlists:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des playlists' });
  }
});

// Obtenir les playlists publiques
router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const playlists = await Playlist.find({ isPublic: true })
      .populate('owner', 'username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Playlist.countDocuments({ isPublic: true });

    res.json({
      playlists: playlists.map(playlist => playlist.toPublicJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des playlists publiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des playlists publiques' });
  }
});

// Obtenir une playlist par ID
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('owner', 'username')
      .populate('songs.song')
      .populate('songs.addedBy', 'username');

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    // Vérifier si l'utilisateur peut voir la playlist
    if (!playlist.isPublic && 
        playlist.owner.toString() !== req.user?.userId && 
        !playlist.collaborators.includes(req.user?.userId)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json({ playlist: playlist.toPublicJSON() });
  } catch (error) {
    console.error('Erreur lors de la récupération de la playlist:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la playlist' });
  }
});

// Mettre à jour une playlist
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, isPublic, isCollaborative, tags } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    // Vérifier les permissions
    if (playlist.owner.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette playlist' });
    }

    // Mettre à jour les champs
    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (isCollaborative !== undefined) playlist.isCollaborative = isCollaborative;
    if (tags) playlist.tags = tags.split(',').map(tag => tag.trim());

    await playlist.save();

    res.json({
      message: 'Playlist mise à jour avec succès',
      playlist: playlist.toPublicJSON()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la playlist:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la playlist' });
  }
});

// Ajouter une chanson à une playlist
router.post('/:id/songs', auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    // Vérifier les permissions
    if (playlist.owner.toString() !== req.user.userId && 
        !playlist.collaborators.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette playlist' });
    }

    // Vérifier si la chanson existe
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ error: 'Chanson non trouvée' });
    }

    await playlist.addSong(songId, req.user.userId);
    await playlist.calculateTotalDuration();

    res.json({
      message: 'Chanson ajoutée à la playlist',
      playlist: playlist.toPublicJSON()
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la chanson:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la chanson' });
  }
});

// Retirer une chanson d'une playlist
router.delete('/:id/songs/:songId', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    // Vérifier les permissions
    if (playlist.owner.toString() !== req.user.userId && 
        !playlist.collaborators.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette playlist' });
    }

    await playlist.removeSong(req.params.songId);
    await playlist.calculateTotalDuration();

    res.json({
      message: 'Chanson retirée de la playlist',
      playlist: playlist.toPublicJSON()
    });
  } catch (error) {
    console.error('Erreur lors du retrait de la chanson:', error);
    res.status(500).json({ error: 'Erreur lors du retrait de la chanson' });
  }
});

// Réorganiser les chansons dans une playlist
router.put('/:id/reorder', auth, async (req, res) => {
  try {
    const { songIds } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    // Vérifier les permissions
    if (playlist.owner.toString() !== req.user.userId && 
        !playlist.collaborators.includes(req.user.userId)) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à modifier cette playlist' });
    }

    await playlist.reorderSongs(songIds);

    res.json({
      message: 'Playlist réorganisée avec succès',
      playlist: playlist.toPublicJSON()
    });
  } catch (error) {
    console.error('Erreur lors de la réorganisation:', error);
    res.status(500).json({ error: 'Erreur lors de la réorganisation' });
  }
});

// Suivre/Ne plus suivre une playlist
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    if (!playlist.isPublic) {
      return res.status(403).json({ error: 'Cette playlist est privée' });
    }

    const followerIndex = playlist.followers.indexOf(req.user.userId);
    if (followerIndex === -1) {
      playlist.followers.push(req.user.userId);
    } else {
      playlist.followers.splice(followerIndex, 1);
    }

    await playlist.save();

    res.json({
      message: followerIndex === -1 ? 'Playlist suivie' : 'Playlist non suivie',
      playlist: playlist.toPublicJSON()
    });
  } catch (error) {
    console.error('Erreur lors du suivi de la playlist:', error);
    res.status(500).json({ error: 'Erreur lors du suivi de la playlist' });
  }
});

// Supprimer une playlist
router.delete('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist non trouvée' });
    }

    // Vérifier les permissions
    if (
      playlist.owner.toString() !== req.user.userId &&
      !playlist.collaborators.includes(req.user.userId)
    ) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à supprimer cette playlist' });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    res.json({ message: 'Playlist supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la playlist:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la playlist' });
  }
});

module.exports = router; 