const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true,
    default: 'Unknown Album'
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    default: null
  },
  lyrics: {
    type: String,
    default: ''
  },
  releaseYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  playCount: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  audioFeatures: {
    tempo: Number,
    key: String,
    mode: String,
    energy: Number,
    danceability: Number,
    valence: Number
  }
}, {
  timestamps: true
});

// Index pour la recherche
songSchema.index({ title: 'text', artist: 'text', album: 'text', genre: 'text' });

// Méthode pour incrémenter le compteur de lecture
songSchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  return this.save();
};

// Méthode pour ajouter/retirer un like
songSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(likeIndex, 1);
  }
  return this.save();
};

// Méthode pour obtenir les informations publiques de la chanson
songSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    title: this.title,
    artist: this.artist,
    album: this.album,
    genre: this.genre,
    duration: this.duration,
    filePath: this.filePath,
    coverImage: this.coverImage,
    releaseYear: this.releaseYear,
    playCount: this.playCount,
    likes: this.likes.length,
    tags: this.tags,
    audioFeatures: this.audioFeatures,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Song', songSchema); 