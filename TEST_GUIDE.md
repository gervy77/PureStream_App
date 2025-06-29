# Guide de Test du Backend PureStream

## 🚀 Démarrage Rapide

### 1. Prérequis
- Node.js (version 16 ou supérieure)
- MongoDB installé et en cours d'exécution
- Terminal/Command Prompt

### 2. Installation des dépendances
```bash
# Dans le dossier racine du projet
npm install

# Ou dans le dossier backend
cd backend
npm install
```

### 3. Configuration de l'environnement
```bash
# Copier le fichier de configuration
cp backend/config.env backend/.env

# Modifier les variables si nécessaire
# MONGODB_URI=mongodb://localhost:27017/purestream
# JWT_SECRET=votre-secret-jwt-super-securise-pour-purestream
```

### 4. Démarrage du serveur
```bash
cd backend
npm run dev
```

Le serveur devrait démarrer sur `http://localhost:3000`

## 🧪 Tests Automatisés

### Test complet de l'API
```bash
cd backend
npm run test-api
```

Ce script va tester :
- ✅ Vérification de l'API (health check)
- ✅ Inscription d'un utilisateur
- ✅ Connexion
- ✅ Récupération du profil
- ✅ Création de playlist
- ✅ Récupération des playlists
- ✅ Récupération des genres
- ✅ Recommandations personnalisées
- ✅ Mise à jour du profil
- ✅ Déconnexion

## 🔧 Tests Manuels avec Postman/Insomnia

### 1. Test de base
```http
GET http://localhost:3000/api/health
```

### 2. Inscription
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### 3. Connexion
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 4. Récupération du profil (avec token)
```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

### 5. Création d'une playlist
```http
POST http://localhost:3000/api/playlists
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Ma Playlist",
  "description": "Une playlist de test",
  "isPublic": true,
  "tags": "test,musique"
}
```

### 6. Récupération des playlists
```http
GET http://localhost:3000/api/playlists/my
Authorization: Bearer YOUR_TOKEN_HERE
```

### 7. Récupération des genres
```http
GET http://localhost:3000/api/songs/genres
```

### 8. Recommandations personnalisées
```http
GET http://localhost:3000/api/users/recommendations
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🎵 Tests d'Upload de Chansons

### Upload d'une chanson (avec fichier audio)
```http
POST http://localhost:3000/api/songs/upload
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

Form Data:
- audio: [fichier audio .mp3]
- title: "Ma Chanson"
- artist: "Mon Artiste"
- album: "Mon Album"
- genre: "Rock"
- releaseYear: 2024
- lyrics: "Paroles de la chanson..."
- tags: "rock,pop,test"
```

## 🔍 Tests de Recherche

### Recherche de chansons
```http
GET http://localhost:3000/api/songs/search?q=rock&genre=Rock&page=1&limit=10
```

### Recherche d'utilisateurs
```http
GET http://localhost:3000/api/users/search?q=test&page=1&limit=10
```

## ❤️ Tests de Favoris

### Ajouter une chanson aux favoris
```http
POST http://localhost:3000/api/favorites/songs/SONG_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

### Vérifier si une chanson est dans les favoris
```http
GET http://localhost:3000/api/favorites/songs/SONG_ID/check
Authorization: Bearer YOUR_TOKEN_HERE
```

## 👥 Tests de Suivi

### Suivre un utilisateur
```http
POST http://localhost:3000/api/users/USER_ID/follow
Authorization: Bearer YOUR_TOKEN_HERE
```

### Suivre une playlist
```http
POST http://localhost:3000/api/playlists/PLAYLIST_ID/follow
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🐛 Dépannage

### Erreurs courantes

1. **Erreur de connexion MongoDB**
   ```
   MongoDB connection error: connect ECONNREFUSED 127.0.0.1:27017
   ```
   **Solution** : Démarrer MongoDB ou vérifier l'URL de connexion

2. **Erreur de port déjà utilisé**
   ```
   Error: listen EADDRINUSE: address already in use :::3000
   ```
   **Solution** : Changer le port dans le fichier .env ou arrêter le processus qui utilise le port 3000

3. **Erreur de token invalide**
   ```
   Token invalide
   ```
   **Solution** : Se reconnecter pour obtenir un nouveau token

4. **Erreur de fichier non trouvé**
   ```
   Route not found
   ```
   **Solution** : Vérifier l'URL de l'endpoint

### Vérification des logs
```bash
# Voir les logs du serveur
cd backend
npm run dev

# Les logs apparaîtront dans le terminal
```

## 📊 Validation des Tests

### Critères de réussite
- ✅ Tous les endpoints répondent correctement
- ✅ Les tokens JWT fonctionnent
- ✅ Les données sont sauvegardées en base
- ✅ Les erreurs sont gérées proprement
- ✅ Les permissions sont respectées

### Tests de performance
- Temps de réponse < 500ms pour les requêtes simples
- Temps de réponse < 2s pour les requêtes complexes
- Pas d'erreurs de mémoire

## 🎯 Prochaines étapes

Une fois les tests validés :
1. ✅ Backend fonctionnel
2. 🔄 Créer le frontend Angular 19
3. 🔄 Intégrer Howler.js pour la lecture audio
4. 🔄 Ajouter des fonctionnalités avancées
5. 🔄 Déployer l'application

---

**Note** : Ce guide couvre les tests de base. Pour des tests plus avancés, considérez l'utilisation de Jest ou d'autres frameworks de test. 