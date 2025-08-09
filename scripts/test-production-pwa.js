#!/usr/bin/env node

/**
 * Test de validation PWA en production sur Netlify
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const PRODUCTION_URL = 'https://impots-access.netlify.app';

async function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function testProductionPWA() {
  log('🌐 TEST PWA EN PRODUCTION', 'bold');
  log('=========================\n', 'blue');
  
  let score = 0;
  let total = 0;
  
  // Test 1: Accessibilité du site principal
  log('1️⃣ Test d\'accessibilité...', 'yellow');
  total++;
  try {
    const response = await httpRequest(PRODUCTION_URL);
    if (response.statusCode === 200) {
      log('✅ Site accessible en HTTPS', 'green');
      score++;
    } else {
      log(`❌ Site non accessible (${response.statusCode})`, 'red');
    }
  } catch (error) {
    log(`❌ Erreur de connexion: ${error.message}`, 'red');
  }
  
  // Test 2: Manifest PWA
  log('\n2️⃣ Test du Manifest PWA...', 'yellow');
  total++;
  try {
    const response = await httpRequest(`${PRODUCTION_URL}/manifest.json`);
    if (response.statusCode === 200) {
      const manifest = JSON.parse(response.data);
      if (manifest.name && manifest.start_url && manifest.display && manifest.icons) {
        log('✅ Manifest PWA valide', 'green');
        score++;
      } else {
        log('❌ Manifest PWA incomplet', 'red');
      }
    } else {
      log('❌ Manifest PWA non trouvé', 'red');
    }
  } catch (error) {
    log(`❌ Erreur manifest: ${error.message}`, 'red');
  }
  
  // Test 3: Service Worker
  log('\n3️⃣ Test du Service Worker...', 'yellow');
  total++;
  try {
    const response = await httpRequest(`${PRODUCTION_URL}/sw.js`);
    if (response.statusCode === 200) {
      log('✅ Service Worker disponible', 'green');
      score++;
    } else {
      log('❌ Service Worker non trouvé', 'red');
    }
  } catch (error) {
    log(`❌ Erreur Service Worker: ${error.message}`, 'red');
  }
  
  // Test 4: En-têtes de sécurité
  log('\n4️⃣ Test des en-têtes de sécurité...', 'yellow');
  total++;
  try {
    const response = await httpRequest(PRODUCTION_URL, { method: 'HEAD' });
    const hasHTTPS = response.headers['strict-transport-security'];
    const hasXFrame = response.headers['x-frame-options'];
    
    if (hasHTTPS) {
      log('✅ HSTS activé (Sécurité HTTPS)', 'green');
      score++;
    } else {
      log('⚠️ HSTS manquant', 'yellow');
    }
  } catch (error) {
    log(`❌ Erreur en-têtes: ${error.message}`, 'red');
  }
  
  // Test 5: Icônes PWA
  log('\n5️⃣ Test des icônes PWA...', 'yellow');
  const iconSizes = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'];
  let iconScore = 0;
  total++;
  
  for (const size of iconSizes) {
    try {
      const response = await httpRequest(`${PRODUCTION_URL}/icons/icon-${size}.png`, { method: 'HEAD' });
      if (response.statusCode === 200) {
        iconScore++;
      }
    } catch (error) {
      // Ignore silently for icon test
    }
  }
  
  if (iconScore >= 6) {
    log(`✅ ${iconScore}/${iconSizes.length} icônes PWA disponibles`, 'green');
    score++;
  } else {
    log(`⚠️ ${iconScore}/${iconSizes.length} icônes PWA disponibles`, 'yellow');
  }
  
  // Test 6: Splash screens iOS
  log('\n6️⃣ Test des splash screens...', 'yellow');
  total++;
  try {
    const response = await httpRequest(`${PRODUCTION_URL}/splash/iphone12-splash.png`, { method: 'HEAD' });
    if (response.statusCode === 200) {
      log('✅ Splash screens iOS disponibles', 'green');
      score++;
    } else {
      log('⚠️ Splash screens manquants', 'yellow');
    }
  } catch (error) {
    log('⚠️ Splash screens non vérifiables', 'yellow');
  }
  
  // Test 7: Page de nettoyage de cache
  log('\n7️⃣ Test de la page de nettoyage...', 'yellow');
  total++;
  try {
    const response = await httpRequest(`${PRODUCTION_URL}/clear-cache.html`);
    if (response.statusCode === 200 && response.data.includes('Nettoyage du Cache')) {
      log('✅ Page de nettoyage de cache disponible', 'green');
      score++;
    } else {
      log('❌ Page de nettoyage de cache manquante', 'red');
    }
  } catch (error) {
    log(`❌ Erreur page de nettoyage: ${error.message}`, 'red');
  }
  
  // Résultats finaux
  log('\n' + '='.repeat(50), 'blue');
  log('📊 RÉSULTATS DU TEST PRODUCTION', 'bold');
  log('================================\n', 'blue');
  
  const percentage = Math.round((score / total) * 100);
  let statusColor = 'red';
  let statusText = 'ÉCHEC';
  
  if (percentage >= 90) {
    statusColor = 'green';
    statusText = 'EXCELLENT';
  } else if (percentage >= 75) {
    statusColor = 'yellow';
    statusText = 'BON';
  } else if (percentage >= 50) {
    statusColor = 'cyan';
    statusText = 'MOYEN';
  }
  
  log(`Score: ${score}/${total} (${percentage}%) - ${statusText}`, statusColor);
  log(`\n🌐 URL Production: ${PRODUCTION_URL}`, 'cyan');
  
  if (percentage >= 75) {
    log('\n🎉 PWA PRÊTE POUR UTILISATION !', 'green');
    log('\n📱 Instructions d\'installation:', 'yellow');
    log('• Desktop: Cliquez sur l\'icône d\'installation dans la barre d\'adresse', 'cyan');
    log('• Mobile iOS: Partagez → Ajouter à l\'écran d\'accueil', 'cyan');
    log('• Mobile Android: Notification automatique d\'installation', 'cyan');
    
    log('\n👥 Comptes de test:', 'yellow');
    log('• Admin: admin@dgi.ga / admin123', 'cyan');
    log('• Réception: reception@dgi.ga / reception123', 'cyan');
  } else {
    log('\n⚠️ PWA nécessite des améliorations', 'yellow');
    log('Vérifiez les éléments marqués ❌ ci-dessus', 'cyan');
  }
  
  // Sauvegarder le rapport
  const report = {
    timestamp: new Date().toISOString(),
    url: PRODUCTION_URL,
    score: `${score}/${total}`,
    percentage,
    status: statusText,
    tests: {
      accessibility: score >= 1,
      manifest: score >= 2,
      serviceWorker: score >= 3,
      security: score >= 4,
      icons: score >= 5,
      splashScreens: score >= 6,
      cleanupPage: score >= 7
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'production-pwa-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  log('\n📄 Rapport sauvegardé: production-pwa-report.json', 'cyan');
  
  return percentage >= 75;
}

// Exécuter le test
testProductionPWA()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`❌ Erreur critique: ${error.message}`, 'red');
    process.exit(1);
  });
