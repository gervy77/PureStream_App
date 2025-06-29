# PureStream Frontend

Application frontend Angular 19 pour PureStream, une plateforme de streaming musical locale avec Howler.js.

## 🚀 Fonctionnalités

- **Interface moderne** avec thème clair et design responsive
- **Lecteur audio intégré** avec Howler.js
- **Authentification** avec JWT
- **Navigation intuitive** entre les différentes sections
- **Recherche de musique** avancée
- **Gestion des playlists** personnalisées
- **Bibliothèque personnelle** de chansons
- **Recommandations** basées sur les préférences

## 🛠️ Technologies

- **Angular 19** - Framework frontend
- **Howler.js** - Bibliothèque audio pour la lecture de musique
- **Angular Material** - Composants UI
- **SCSS** - Préprocesseur CSS
- **TypeScript** - Langage de programmation
- **RxJS** - Programmation réactive

## 📁 Structure du Projet

```
src/
├── app/
│   ├── components/
│   │   └── home/
│   │       ├── home.component.ts
│   │       └── home.component.scss
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── song.model.ts
│   │   └── playlist.model.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── music.service.ts
│   ├── app.component.html
│   ├── app.component.scss
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── assets/
├── environments/
│   └── environment.ts
└── styles.scss
```

## 🎨 Design System

### Couleurs
- **Primaire**: `#6366f1` (Indigo)
- **Secondaire**: `#f59e0b` (Ambre)
- **Accent**: `#10b981` (Émeraude)
- **Arrière-plans**: Blanc, gris clair
- **Texte**: Gris foncé, gris moyen

### Typographie
- **Police principale**: Inter
- **Tailles**: xs, sm, base, lg, xl, 2xl, 3xl
- **Poids**: 400, 500, 600, 700

### Espacement
- **Système cohérent**: xs, sm, md, lg, xl, 2xl
- **Responsive**: Adaptation mobile-first

## 🎵 Lecteur Audio

### Fonctionnalités
- **Lecture/Pause** avec contrôles visuels
- **Navigation** (précédent/suivant)
- **Barre de progression** interactive
- **Contrôle du volume** avec slider
- **Queue de lecture** automatique
- **Formatage du temps** (mm:ss)

### Intégration Howler.js
- Gestion des événements audio
- Support HTML5 Audio
- Contrôles de volume globaux
- Gestion des erreurs de chargement

## 🔐 Authentification

### Fonctionnalités
- **Inscription** avec validation
- **Connexion** sécurisée
- **Gestion des tokens** JWT
- **Persistance** des sessions
- **Déconnexion** automatique

### Sécurité
- Stockage sécurisé des tokens
- Validation côté client
- Gestion des erreurs d'authentification

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: > 768px

### Adaptations
- Navigation adaptative
- Grilles flexibles
- Contrôles tactiles optimisés
- Lecteur audio mobile-friendly

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Backend PureStream en cours d'exécution

### Installation
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start

# Build de production
npm run build
```

### Configuration
1. Vérifier que le backend est en cours d'exécution sur `http://localhost:3000`
2. Modifier `src/environments/environment.ts` si nécessaire
3. Ajouter des images par défaut dans `src/assets/`

## 🔧 Configuration

### Variables d'environnement
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

### Services configurés
- **AuthService**: Gestion de l'authentification
- **MusicService**: Contrôle du lecteur audio et API

## 📊 Composants

### HomeComponent
- **Section Hero** avec statistiques
- **Chansons populaires** en grille
- **Ajouts récents** avec dates
- **Exploration par genres**

### AppComponent
- **Header** avec navigation
- **Lecteur audio** fixe en bas
- **Modales** d'authentification
- **Gestion globale** de l'état

## 🎯 Fonctionnalités à venir

- [ ] Page de recherche avancée
- [ ] Gestion des playlists
- [ ] Bibliothèque personnelle
- [ ] Profil utilisateur
- [ ] Upload de chansons
- [ ] Mode hors ligne
- [ ] Notifications en temps réel

## 🐛 Débogage

### Console Browser
- Logs détaillés des événements audio
- Erreurs d'authentification
- État du lecteur en temps réel

### Outils de développement
- Angular DevTools
- Network tab pour les requêtes API
- Application tab pour le stockage local

## 📝 Notes de développement

### Bonnes pratiques
- Utilisation des observables RxJS
- Gestion d'état réactive
- Composants standalone
- Styles modulaires avec SCSS

### Performance
- Lazy loading des composants
- Optimisation des images
- Compression des assets
- Cache des requêtes API

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet fait partie de PureStream, une application de streaming musical locale.
