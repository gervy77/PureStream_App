# PureStream Backend

## Installation et démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

### Installation des dépendances
```bash
cd backend
npm install
```

### Configuration
1. Copiez le fichier `config.env` et renommez-le en `.env`
2. Modifiez les variables d'environnement selon votre configuration :
   - `MONGODB_URI` : URL de votre base de données MongoDB
   - `JWT_SECRET` : Clé secrète pour les tokens JWT
   - `PORT` : Port du serveur (défaut: 3000)

### Démarrage du serveur
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

### Test de l'API
Le serveur sera accessible sur `http://localhost:3000`

#### Endpoints de test :
- `GET /api/health` - Vérifier que l'API fonctionne
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

## Structure de l'API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Profil utilisateur
- `PUT /api/auth/profile` - Mise à jour du profil

### Chansons
- `GET /api/songs` - Liste des chansons
- `GET /api/songs/search` - Recherche de chansons
- `GET /api/songs/:id` - Détails d'une chanson
- `POST /api/songs/upload` - Upload d'une chanson
- `POST /api/songs/:id/play` - Incrémenter le compteur de lecture
- `POST /api/songs/:id/like` - Like/Unlike une chanson
- `GET /api/songs/popular` - Chansons populaires
- `GET /api/songs/genres` - Genres disponibles

### Playlists
- `GET /api/playlists/my` - Mes playlists
- `GET /api/playlists/public` - Playlists publiques
- `GET /api/playlists/:id` - Détails d'une playlist
- `POST /api/playlists` - Créer une playlist
- `PUT /api/playlists/:id` - Modifier une playlist
- `POST /api/playlists/:id/songs` - Ajouter une chanson
- `DELETE /api/playlists/:id/songs/:songId` - Retirer une chanson
- `POST /api/playlists/:id/follow` - Suivre une playlist
- `DELETE /api/playlists/:id` - Supprimer une playlist

### Utilisateurs
- `GET /api/users/:id` - Profil d'un utilisateur
- `POST /api/users/:id/follow` - Suivre un utilisateur
- `GET /api/users/:id/following` - Utilisateurs suivis
- `GET /api/users/:id/followers` - Followers
- `GET /api/users/:id/playlists` - Playlists d'un utilisateur
- `GET /api/users/:id/songs` - Chansons d'un utilisateur
- `GET /api/users/recommendations` - Recommandations personnalisées
- `GET /api/users/search` - Recherche d'utilisateurs

### Favoris
- `GET /api/favorites/songs` - Chansons favorites
- `GET /api/favorites/playlists` - Playlists favorites
- `POST /api/favorites/songs/:id` - Ajouter/retirer une chanson des favoris
- `POST /api/favorites/playlists/:id` - Ajouter/retirer une playlist des favoris 