const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  coverImage: {
    type: String,
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [{
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isCollaborative: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  totalDuration: {
    type: Number,
    default: 0
  },
  playCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index pour la recherche
playlistSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Méthode pour ajouter une chanson à la playlist
playlistSchema.methods.addSong = function(songId, userId) {
  if (!songId) {
    return Promise.resolve(this);
  }
  
  const existingSong = this.songs.find(s => s.song && s.song.toString() === songId.toString());
  if (!existingSong) {
    this.songs.push({
      song: songId,
      addedBy: userId
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Méthode pour retirer une chanson de la playlist
playlistSchema.methods.removeSong = function(songId) {
  this.songs = this.songs.filter(s => s.song.toString() !== songId.toString());
  return this.save();
};

// Méthode pour réorganiser les chansons
playlistSchema.methods.reorderSongs = function(songIds) {
  const newSongs = [];
  songIds.forEach(songId => {
    const existingSong = this.songs.find(s => s.song.toString() === songId.toString());
    if (existingSong) {
      newSongs.push(existingSong);
    }
  });
  this.songs = newSongs;
  return this.save();
};

// Méthode pour calculer la durée totale
playlistSchema.methods.calculateTotalDuration = async function() {
  const Song = mongoose.model('Song');
  let totalDuration = 0;
  
  for (const songItem of this.songs) {
    const song = await Song.findById(songItem.song);
    if (song) {
      totalDuration += song.duration;
    }
  }
  
  this.totalDuration = totalDuration;
  return this.save();
};

// Méthode pour incrémenter le compteur de lecture
playlistSchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  return this.save();
};

// Méthode pour obtenir les informations publiques de la playlist
playlistSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    coverImage: this.coverImage,
    owner: this.owner,
    isPublic: this.isPublic,
    isCollaborative: this.isCollaborative,
    followers: this.followers.length,
    tags: this.tags,
    totalDuration: this.totalDuration,
    playCount: this.playCount,
    songCount: this.songs.length,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Playlist', playlistSchema); 