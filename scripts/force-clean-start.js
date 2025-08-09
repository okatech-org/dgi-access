#!/usr/bin/env node

/**
 * Script pour forcer un démarrage complètement propre de l'application
 * Résout les problèmes de cache navigateur persistants
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
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

async function cleanCaches() {
  log('🧹 NETTOYAGE COMPLET DES CACHES', 'bold');
  log('================================\n', 'blue');
  
  // Tuer tous les processus
  log('1️⃣ Arrêt des processus en cours...', 'yellow');
  try {
    await execAsync('pkill -f "vite"');
    log('✅ Processus Vite arrêtés', 'green');
  } catch (e) {
    log('ℹ️ Aucun processus Vite actif', 'cyan');
  }
  
  // Nettoyer les caches
  log('\n2️⃣ Suppression des caches...', 'yellow');
  const cacheDirectories = [
    'node_modules/.vite',
    'dist',
    '.vite',
    'node_modules/.cache'
  ];
  
  for (const dir of cacheDirectories) {
    const fullPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      log(`✅ Supprimé: ${dir}`, 'green');
    }
  }
  
  // Mettre à jour le timestamp dans index.html pour forcer le rechargement
  log('\n3️⃣ Mise à jour du timestamp...', 'yellow');
  const indexPath = path.join(__dirname, '..', 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    const timestamp = Date.now();
    
    // Ajouter ou mettre à jour le timestamp dans un commentaire
    if (content.includes('<!-- BUILD_TIMESTAMP:')) {
      content = content.replace(/<!-- BUILD_TIMESTAMP:\d+ -->/g, `<!-- BUILD_TIMESTAMP:${timestamp} -->`);
    } else {
      content = content.replace('</head>', `  <!-- BUILD_TIMESTAMP:${timestamp} -->\n  </head>`);
    }
    
    fs.writeFileSync(indexPath, content);
    log(`✅ Timestamp mis à jour: ${timestamp}`, 'green');
  }
  
  log('\n4️⃣ Nettoyage des fichiers temporaires...', 'yellow');
  
  // Supprimer les fichiers lock qui peuvent causer des problèmes
  const tempFiles = [
    '.DS_Store',
    'src/.DS_Store',
    'public/.DS_Store',
    'pwa-test-report.json'
  ];
  
  for (const file of tempFiles) {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      log(`✅ Supprimé: ${file}`, 'green');
    }
  }
  
  log('\n' + '='.repeat(50), 'blue');
  log('✨ NETTOYAGE TERMINÉ !', 'green');
  log('\n📋 Instructions pour continuer:', 'yellow');
  log('1. Ouvrir Chrome/Firefox en mode incognito', 'cyan');
  log('2. Ou vider le cache navigateur : Ctrl+Shift+Delete', 'cyan');
  log('3. Lancer : npm run dev', 'cyan');
  log('4. Forcer le rechargement : Ctrl+Shift+R', 'cyan');
  
  log('\n🚀 Démarrage automatique dans 2 secondes...', 'green');
  
  // Attendre 2 secondes puis démarrer le serveur
  setTimeout(async () => {
    log('\n🔄 Démarrage du serveur de développement...', 'yellow');
    const { spawn } = await import('child_process');
    
    const devServer = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });
    
    devServer.on('error', (err) => {
      log(`❌ Erreur lors du démarrage: ${err.message}`, 'red');
    });
    
    devServer.on('close', (code) => {
      if (code !== 0) {
        log(`⚠️ Le serveur s'est arrêté avec le code ${code}`, 'yellow');
      }
    });
    
  }, 2000);
}

cleanCaches().catch(error => {
  log(`❌ Erreur: ${error.message}`, 'red');
  process.exit(1);
});
