#!/usr/bin/env node

/**
 * Script de nettoyage complet du projet pour résoudre les conflits
 */

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
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function deleteIfExists(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      if (fs.statSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
      log(`✅ Supprimé: ${description}`, 'green');
      return true;
    } catch (error) {
      log(`❌ Erreur lors de la suppression de ${description}: ${error.message}`, 'red');
      return false;
    }
  } else {
    log(`ℹ️ N'existe pas: ${description}`, 'yellow');
    return true;
  }
}

function main() {
  log('🧹 NETTOYAGE COMPLET DU PROJET PWA', 'bold');
  log('==================================\n', 'blue');
  
  // Supprimer les caches et builds
  log('📦 Nettoyage des caches et builds...', 'blue');
  deleteIfExists('node_modules/.vite', 'Cache Vite');
  deleteIfExists('dist', 'Dossier de build');
  deleteIfExists('.vite', 'Cache Vite local');
  
  // Supprimer les anciens fichiers PWA conflictuels
  log('\n🗑️ Suppression des anciens fichiers PWA...', 'blue');
  deleteIfExists('src/components/PWAInstallPrompt.tsx', 'Ancien PWAInstallPrompt');
  deleteIfExists('src/components/OfflineIndicator.tsx', 'Ancien OfflineIndicator');
  deleteIfExists('src/components/ServiceWorkerUpdatePrompt.tsx', 'Ancien ServiceWorkerUpdatePrompt');
  deleteIfExists('src/hooks/useServiceWorker.ts', 'Ancien useServiceWorker hook');
  deleteIfExists('src/hooks/useServiceWorker.tsx', 'Ancien useServiceWorker hook (tsx)');
  
  // Nettoyer les fichiers temporaires
  log('\n🧽 Nettoyage des fichiers temporaires...', 'blue');
  deleteIfExists('.DS_Store', 'Fichiers système macOS');
  deleteIfExists('src/.DS_Store', 'Fichiers système dans src');
  deleteIfExists('public/.DS_Store', 'Fichiers système dans public');
  
  // Vérifier la structure PWA
  log('\n✅ Vérification de la structure PWA...', 'blue');
  
  const requiredFiles = [
    { path: 'public/manifest.json', desc: 'Manifest PWA' },
    { path: 'src/components/pwa/PWAProvider.tsx', desc: 'PWA Provider' },
    { path: 'src/hooks/usePWA.ts', desc: 'Hook PWA' },
    { path: 'vite.config.ts', desc: 'Configuration Vite PWA' }
  ];
  
  let allGood = true;
  requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file.path);
    if (fs.existsSync(fullPath)) {
      log(`✅ ${file.desc}`, 'green');
    } else {
      log(`❌ MANQUANT: ${file.desc}`, 'red');
      allGood = false;
    }
  });
  
  log('\n' + '='.repeat(50), 'blue');
  
  if (allGood) {
    log('🎉 NETTOYAGE TERMINÉ AVEC SUCCÈS !', 'green');
    log('\n📋 Prochaines étapes:', 'yellow');
    log('1. Redémarrer le serveur: npm run dev', 'yellow');
    log('2. Vider le cache navigateur (Ctrl+Shift+R)', 'yellow');
    log('3. Tester l\'application PWA', 'yellow');
  } else {
    log('⚠️ NETTOYAGE TERMINÉ AVEC DES PROBLÈMES', 'yellow');
    log('Certains fichiers PWA essentiels sont manquants.', 'red');
  }
}

main();
