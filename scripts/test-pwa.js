#!/usr/bin/env node

/**
 * Script de test PWA pour vérifier toutes les fonctionnalités
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Couleurs pour la console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - MANQUANT`, 'red');
    return false;
  }
}

function checkFileContent(filePath, searchContent, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    log(`❌ ${description} - Fichier manquant`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const hasContent = content.includes(searchContent);
  
  if (hasContent) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Contenu manquant`, 'red');
    return false;
  }
}

function checkManifest() {
  log('\n📋 Vérification du Manifest PWA', 'blue');
  
  let score = 0;
  let total = 0;
  
  // Vérifier l'existence
  total++;
  if (checkFile('public/manifest.json', 'Fichier manifest.json')) {
    score++;
    
    try {
      const manifest = JSON.parse(fs.readFileSync(
        path.join(__dirname, '..', 'public/manifest.json'), 
        'utf8'
      ));
      
      // Vérifier les propriétés essentielles
      const checks = [
        { prop: 'name', desc: 'Nom de l\'application' },
        { prop: 'short_name', desc: 'Nom court' },
        { prop: 'start_url', desc: 'URL de démarrage' },
        { prop: 'display', desc: 'Mode d\'affichage' },
        { prop: 'theme_color', desc: 'Couleur du thème' },
        { prop: 'background_color', desc: 'Couleur d\'arrière-plan' },
        { prop: 'icons', desc: 'Icônes' }
      ];
      
      checks.forEach(check => {
        total++;
        if (manifest[check.prop]) {
          log(`✅ ${check.desc}`, 'green');
          score++;
        } else {
          log(`❌ ${check.desc} - Manquant`, 'red');
        }
      });
      
      // Vérifier les icônes
      if (manifest.icons && manifest.icons.length > 0) {
        total++;
        if (manifest.icons.length >= 8) {
          log(`✅ Nombre d'icônes suffisant (${manifest.icons.length})`, 'green');
          score++;
        } else {
          log(`⚠️ Peu d'icônes (${manifest.icons.length}) - Recommandé: 8+`, 'yellow');
        }
      }
      
    } catch (error) {
      log(`❌ Manifest invalide: ${error.message}`, 'red');
    }
  }
  
  return { score, total };
}

function checkServiceWorker() {
  log('\n🛠️ Vérification du Service Worker', 'blue');
  
  let score = 0;
  let total = 0;
  
  // Vérifier les fichiers générés
  const swFiles = [
    { path: 'dist/sw.js', desc: 'Service Worker principal' },
    { path: 'dist/registerSW.js', desc: 'Script d\'enregistrement' },
    { path: 'vite.config.ts', desc: 'Configuration Vite PWA' }
  ];
  
  swFiles.forEach(file => {
    total++;
    if (checkFile(file.path, file.desc)) {
      score++;
    }
  });
  
  // Vérifier la configuration Vite
  total++;
  if (checkFileContent('vite.config.ts', 'VitePWA', 'Plugin PWA configuré')) {
    score++;
  }
  
  return { score, total };
}

function checkIcons() {
  log('\n🎨 Vérification des Icônes', 'blue');
  
  let score = 0;
  let total = 0;
  
  // Icônes PNG requises
  const requiredSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  
  requiredSizes.forEach(size => {
    total++;
    if (checkFile(`public/icons/icon-${size}x${size}.png`, `Icône ${size}x${size}px`)) {
      score++;
    }
  });
  
  // Icônes spéciales iOS
  const iosSizes = [167, 180];
  iosSizes.forEach(size => {
    total++;
    if (checkFile(`public/icons/icon-${size}x${size}.png`, `Icône iOS ${size}x${size}px`)) {
      score++;
    }
  });
  
  return { score, total };
}

function checkSplashScreens() {
  log('\n📱 Vérification des Splash Screens', 'blue');
  
  let score = 0;
  let total = 0;
  
  const splashFiles = [
    'iphone12-splash.png',
    'iphonex-splash.png',
    'ipad-splash.png'
  ];
  
  splashFiles.forEach(file => {
    total++;
    if (checkFile(`public/splash/${file}`, `Splash screen ${file}`)) {
      score++;
    }
  });
  
  return { score, total };
}

function checkHTMLMeta() {
  log('\n🌐 Vérification des Meta Tags HTML', 'blue');
  
  let score = 0;
  let total = 0;
  
  const metaChecks = [
    { content: 'apple-mobile-web-app-capable', desc: 'Meta Apple Web App' },
    { content: 'theme-color', desc: 'Couleur du thème' },
    { content: 'apple-touch-icon', desc: 'Icônes Apple Touch' },
    { content: 'manifest.json', desc: 'Lien vers manifest' },
    { content: 'viewport-fit=cover', desc: 'Support des écrans avec encoche' }
  ];
  
  metaChecks.forEach(check => {
    total++;
    if (checkFileContent('index.html', check.content, check.desc)) {
      score++;
    }
  });
  
  return { score, total };
}

function checkComponents() {
  log('\n⚛️ Vérification des Composants PWA', 'blue');
  
  let score = 0;
  let total = 0;
  
  const components = [
    { path: 'src/hooks/usePWA.ts', desc: 'Hook usePWA' },
    { path: 'src/components/pwa/InstallPrompt.tsx', desc: 'Composant InstallPrompt' },
    { path: 'src/components/pwa/UpdatePrompt.tsx', desc: 'Composant UpdatePrompt' },
    { path: 'src/components/pwa/OfflineIndicator.tsx', desc: 'Indicateur hors-ligne' },
    { path: 'src/components/pwa/PWAProvider.tsx', desc: 'Provider PWA' },
    { path: 'src/utils/platformDetection.ts', desc: 'Détection de plateforme' }
  ];
  
  components.forEach(component => {
    total++;
    if (checkFile(component.path, component.desc)) {
      score++;
    }
  });
  
  return { score, total };
}

function generateReport(results) {
  log('\n📊 RAPPORT DE TEST PWA', 'bold');
  log('================================', 'blue');
  
  let totalScore = 0;
  let totalMax = 0;
  
  Object.entries(results).forEach(([category, result]) => {
    const percentage = Math.round((result.score / result.total) * 100);
    const status = percentage >= 90 ? '🟢' : percentage >= 70 ? '🟡' : '🔴';
    
    log(`${status} ${category}: ${result.score}/${result.total} (${percentage}%)`, 
        percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red');
    
    totalScore += result.score;
    totalMax += result.total;
  });
  
  const overallPercentage = Math.round((totalScore / totalMax) * 100);
  const overallStatus = overallPercentage >= 90 ? '🟢 EXCELLENT' : 
                       overallPercentage >= 70 ? '🟡 BON' : '🔴 AMÉLIORATION REQUISE';
  
  log('\n' + '='.repeat(50), 'blue');
  log(`SCORE GLOBAL: ${totalScore}/${totalMax} (${overallPercentage}%) ${overallStatus}`, 'bold');
  log('='.repeat(50), 'blue');
  
  // Recommandations
  log('\n💡 RECOMMANDATIONS:', 'yellow');
  
  if (overallPercentage < 100) {
    log('• Vérifier les éléments manqués ci-dessus', 'yellow');
  }
  
  if (results['Service Worker'].score < results['Service Worker'].total) {
    log('• Reconstruire l\'application avec: npm run build', 'yellow');
  }
  
  if (results['Icônes'].score < results['Icônes'].total) {
    log('• Régénérer les icônes avec: node scripts/convert-icons-to-png.js', 'yellow');
  }
  
  log('\n🚀 ÉTAPES SUIVANTES:', 'blue');
  log('1. Tester l\'installation sur différents appareils', 'blue');
  log('2. Vérifier le fonctionnement hors-ligne', 'blue');
  log('3. Tester les notifications de mise à jour', 'blue');
  log('4. Valider avec Lighthouse (Score PWA: 100)', 'blue');
  log('5. Déployer en production avec HTTPS', 'blue');
  
  return { totalScore, totalMax, overallPercentage };
}

// Fonction principale
function main() {
  log('🧪 TEST AUTOMATIQUE PWA - DGI ACCESS', 'bold');
  log('=====================================\n', 'blue');
  
  const results = {
    'Manifest': checkManifest(),
    'Service Worker': checkServiceWorker(),
    'Icônes': checkIcons(),
    'Splash Screens': checkSplashScreens(),
    'Meta Tags HTML': checkHTMLMeta(),
    'Composants PWA': checkComponents()
  };
  
  const report = generateReport(results);
  
  // Sauvegarder le rapport
  const reportData = {
    timestamp: new Date().toISOString(),
    results,
    overall: report
  };
  
  fs.writeFileSync(
    path.join(__dirname, '..', 'pwa-test-report.json'), 
    JSON.stringify(reportData, null, 2)
  );
  
  log('\n📄 Rapport détaillé sauvegardé: pwa-test-report.json', 'green');
  
  // Code de sortie selon le résultat
  process.exit(report.overallPercentage >= 90 ? 0 : 1);
}

// Exécuter le test
main();
