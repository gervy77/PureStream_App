const axios = require('axios');
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000/api';

// Configuration axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Variables globales pour les tests
let authToken = '';
let userId = '';
let songId = '';
let playlistId = '';

// Fonction pour afficher les résultats
const log = (message, data = null) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(message);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
  console.log(`${'='.repeat(50)}`);
};

// Test 1: Vérifier que l'API fonctionne
const testHealth = async () => {
  try {
    log('Test 1: Vérification de l\'API');
    const response = await api.get('/health');
    log('✅ API fonctionne', response.data);
    return true;
  } catch (error) {
    log('❌ Erreur API', error.response?.data || error.message);
    return false;
  }
};

// Test 2: Inscription d'un utilisateur
const testRegister = async () => {
  try {
    log('Test 2: Inscription d\'un utilisateur');
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await api.post('/auth/register', userData);
    authToken = response.data.token;
    userId = response.data.user._id;
    
    // Configurer le token pour les requêtes suivantes
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    log('✅ Utilisateur inscrit avec succès', response.data);
    return true;
  } catch (error) {
    log('❌ Erreur inscription', error.response?.data || error.message);
    return false;
  }
};

// Test 3: Connexion
const testLogin = async () => {
  try {
    log('Test 3: Connexion');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await api.post('/auth/login', loginData);
    authToken = response.data.token;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    
    log('✅ Connexion réussie', response.data);
    return true;
  } catch (error) {
    log('❌ Erreur connexion', error.response?.data || error.message);
    return false;
  }
};

// Test 4: Vérifier le profil
const testProfile = async () => {
  try {
    log('Test 4: Vérification du profil');
    const response = await api.get('/auth/me');
    log('✅ Profil récupéré', response.data);
    return true;
  } catch (error) {
    log('❌ Erreur profil', error.response?.data || error.message);
    return false;
  }
};

// Test 5: Créer une playlist
const testCreatePlaylist = async () => {
  try {
    log('Test 5: Création d\'une playlist');
    const playlistData = {
      name: 'Ma première playlist',
      description: 'Une playlist de test',
      isPublic: true,
      tags: 'test,musique,playlist'
    };
    
    const response = await api.post('/playlists', playlistData);
    playlistId = response.data.playlist._id;
    
    log('✅ Playlist créée', response.data);
    return true;
  } catch (error) {
    log('❌ Erreur création playlist', error.response?.data || error.message);
    return false;
  }
};

// Test 6: Obtenir les playlists
const testGetPlaylists = async () => {
  try {
    log('Test 6: Récupération des playlists');
    const response = await api.get('/playlists/my');
    log('✅ Playlists récupérées', response.data);
    return true;
  } catch (error) {
    log('❌ Erreur récupération playlists', error.response?.data || error.message);
    return false;
  }
};

// Test 7: Obtenir les genres
const testGetGenres = async () => {
  try {
    log('Test 7: Récupération des genres');
    const response = await api.get('/songs/genres');
    log('✅ Genres récupérés', response.data);
    return true;
  } catch (error) {
    log('❌ Erreur récupération genres', error.response?.data || error.message);
    return false;
  }
};

// Test 8: Obtenir les recommandations
const testGetRecommendations = async () => {
  try {
    log('Test 8: Récupération des recommandations');
    const response = await api.get('/users/recommendations');
    log('✅ Recommandations récupérées', response.data);
    return true;
  } catch (error) {
    log('❌ Erreur récupération recommandations', error.response?.data || error.message);
    return false;
  }
};

// Test 9: Mise à jour du profil
const testUpdateProfile = async () => {
  try {
    log('Test 9: Mise à jour du profil');
    const profileData = {
      bio: 'Bio mise à jour pour les tests',
      favoriteGenres: ['Rock', 'Pop', 'Jazz']
    };
    
    const response = await api.put('/auth/profile', profileData);
    log('✅ Profil mis à jour', response.data);
    return true;
  } catch (error) {
    log('❌ Erreur mise à jour profil', error.response?.data || error.message);
    return false;
  }
};

// Test 10: Déconnexion
const testLogout = async () => {
  try {
    log('Test 10: Déconnexion');
    const response = await api.post('/auth/logout');
    log('✅ Déconnexion réussie', response.data);
    return true;
  } catch (error) {
    log('❌ Erreur déconnexion', error.response?.data || error.message);
    return false;
  }
};

// Fonction principale pour exécuter tous les tests
const runTests = async () => {
  console.log('🚀 Démarrage des tests de l\'API PureStream\n');
  
  const tests = [
    { name: 'Health Check', fn: testHealth },
    { name: 'Inscription', fn: testRegister },
    { name: 'Connexion', fn: testLogin },
    { name: 'Profil', fn: testProfile },
    { name: 'Création Playlist', fn: testCreatePlaylist },
    { name: 'Récupération Playlists', fn: testGetPlaylists },
    { name: 'Genres', fn: testGetGenres },
    { name: 'Recommandations', fn: testGetRecommendations },
    { name: 'Mise à jour Profil', fn: testUpdateProfile },
    { name: 'Déconnexion', fn: testLogout }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log(`❌ Erreur dans le test ${test.name}`, error.message);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSULTATS DES TESTS');
  console.log('='.repeat(60));
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  if (failed === 0) {
    console.log('🎉 Tous les tests sont passés avec succès !');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.');
  }
};

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };

const testApi = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/songs',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('\n📊 Données de l\'API :');
        jsonData.songs.forEach((song, index) => {
          console.log(`\n🎵 Chanson ${index + 1}:`);
          console.log(`   ID: ${song._id}`);
          console.log(`   Titre: ${song.title}`);
          console.log(`   filePath: ${song.filePath || '❌ MANQUANT'}`);
          console.log(`   audioUrl: ${song.audioUrl || '❌ MANQUANT'}`);
          console.log(`   url: ${song.url || '❌ MANQUANT'}`);
        });
      } catch (error) {
        console.error('Erreur parsing JSON:', error);
        console.log('Données brutes:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Erreur requête:', error);
  });

  req.end();
};

testApi(); 