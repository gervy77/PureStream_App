const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

const router = express.Router();

// Configuration de Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/songs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: (req, file, cb) => {
    // Temporairement accepter tous les fichiers pour le test
    console.log('File being uploaded:', file.originalname, file.mimetype);
    cb(null, true);
    
    // Code original (à remettre après le test) :
    // const allowedTypes = /mp3|wav|flac|m4a/;
    // const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // const mimetype = allowedTypes.test(file.mimetype);
    // if (mimetype && extname) {
    //   return cb(null, true);
    // } else {
    //   cb(new Error('Seuls les fichiers audio sont autorisés'));
    // }
  }
});

// Upload d'une nouvelle chanson
router.post('/upload', auth, upload.single('audio'), async (req, res) => {
  try {
    const { title, artist, album, genre, releaseYear, lyrics, tags } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Fichier audio requis' });
    }

    // Ici vous pourriez ajouter une logique pour extraire la durée du fichier audio
    // Pour l'instant, on utilise une valeur par défaut
    const duration = 180; // 3 minutes par défaut

    const song = new Song({
      title,
      artist,
      album,
      genre,
      duration,
      filePath: req.file.path,
      lyrics,
      releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploadedBy: req.user.userId
    });

    await song.save();

    res.status(201).json({
      message: 'Chanson uploadée avec succès',
      song: song.toPublicJSON()
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de la chanson' });
  }
});

// Obtenir toutes les chansons (avec pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const genre = req.query.genre;
    const artist = req.query.artist;

    const filter = { isPublic: true };
    if (genre) filter.genre = genre;
    if (artist) filter.artist = { $regex: artist, $options: 'i' };

    const songs = await Song.find(filter)
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Song.countDocuments(filter);

    res.json({
      songs: songs.map(song => song.toPublicJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des chansons:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des chansons' });
  }
});

// Recherche de chansons
router.get('/search', async (req, res) => {
  try {
    const { q, genre, artist, album } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    let filter = { isPublic: true };

    if (q) {
      filter.$text = { $search: q };
    }
    if (genre) filter.genre = genre;
    if (artist) filter.artist = { $regex: artist, $options: 'i' };
    if (album) filter.album = { $regex: album, $options: 'i' };

    const songs = await Song.find(filter)
      .populate('uploadedBy', 'username')
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Song.countDocuments(filter);

    res.json({
      songs: songs.map(song => song.toPublicJSON()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// Obtenir les chansons populaires
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const songs = await Song.find({ isPublic: true })
      .populate('uploadedBy', 'username')
      .sort({ playCount: -1 })
      .limit(limit);

    res.json({
      songs: songs.map(song => song.toPublicJSON())
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des chansons populaires:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des chansons populaires' });
  }
});

// Obtenir les genres disponibles
router.get('/genres', async (req, res) => {
  try {
    const genres = await Song.distinct('genre', { isPublic: true });
    res.json({ genres });
  } catch (error) {
    console.error('Erreur lors de la récupération des genres:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des genres' });
  }
});

// Obtenir une chanson par ID
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'username');

    if (!song) {
      return res.status(404).json({ error: 'Chanson non trouvée' });
    }

    res.json({ song: song.toPublicJSON() });
  } catch (error) {
    console.error('Erreur lors de la récupération de la chanson:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la chanson' });
  }
});

// Incrémenter le compteur de lecture
router.post('/:id/play', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Chanson non trouvée' });
    }

    await song.incrementPlayCount();
    res.json({ message: 'Compteur de lecture mis à jour' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du compteur' });
  }
});

// Like/Unlike une chanson
router.post('/:id/like', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ error: 'Chanson non trouvée' });
    }

    await song.toggleLike(req.user.userId);
    res.json({ message: 'Like mis à jour' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du like:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du like' });
  }
});

module.exports = router; 