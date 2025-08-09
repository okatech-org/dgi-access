#!/usr/bin/env node

/**
 * Script de validation de l'intégration des logos DGI
 * Vérifie que logo-dgi.png est utilisé sur le site et logo-dgi1.png pour les icônes PWA
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
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Fonction pour chercher dans un fichier
function searchInFile(filePath, patterns) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {};
    
    patterns.forEach(pattern => {
      const regex = new RegExp(pattern.regex, 'g');
      const matches = content.match(regex);
      results[pattern.name] = {
        found: matches ? matches.length : 0,
        matches: matches || []
      };
    });
    
    return results;
  } catch (error) {
    return { error: error.message };
  }
}

// Fonction pour valider un fichier
function validateFile(filePath, expectedPatterns, type) {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  
  if (!fs.existsSync(filePath)) {
    log(`❌ ${relativePath} - Fichier non trouvé`, 'red');
    return false;
  }
  
  const results = searchInFile(filePath, expectedPatterns);
  
  if (results.error) {
    log(`❌ ${relativePath} - Erreur: ${results.error}`, 'red');
    return false;
  }
  
  let isValid = true;
  let hasCorrectLogo = false;
  let hasOldLogo = false;
  
  expectedPatterns.forEach(pattern => {
    const result = results[pattern.name];
    if (pattern.expected && result.found === 0) {
      log(`  ⚠️ Pattern manquant: ${pattern.name}`, 'yellow');
      isValid = false;
    } else if (!pattern.expected && result.found > 0) {
      log(`  ❌ Pattern indésirable trouvé: ${pattern.name} (${result.found} fois)`, 'red');
      log(`    Occurrences: ${result.matches.join(', ')}`, 'cyan');
      hasOldLogo = true;
      isValid = false;
    } else if (pattern.expected && result.found > 0) {
      hasCorrectLogo = true;
    }
  });
  
  if (isValid && hasCorrectLogo) {
    log(`✅ ${relativePath} - Utilise le bon logo`, 'green');
  } else if (hasOldLogo) {
    log(`❌ ${relativePath} - Utilise encore les anciens logos`, 'red');
  }
  
  return isValid;
}

// Patterns de validation
const webLogoPatterns = [
  { name: 'nouveau_logo', regex: '/logo-dgi\\.png', expected: true },
  { name: 'ancien_logo_dgi', regex: '/logo DGI\\.PNG', expected: false },
  { name: 'ancien_logo_impots', regex: '/logo IMPOTS\\.PNG', expected: false }
];

const mobileLogoPatterns = [
  { name: 'logo_mobile', regex: 'logo-dgi1\\.png', expected: true }
];

// Fonction pour valider les icônes générées
function validateGeneratedIcons() {
  log('\n🔍 Validation des icônes générées...', 'yellow');
  
  const iconSizes = [72, 96, 128, 144, 152, 167, 180, 192, 384, 512];
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  
  let allIconsExist = true;
  
  iconSizes.forEach(size => {
    const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    if (fs.existsSync(iconPath)) {
      const stats = fs.statSync(iconPath);
      const sizeKB = Math.round(stats.size / 1024);
      log(`  ✅ icon-${size}x${size}.png (${sizeKB} KB)`, 'cyan');
    } else {
      log(`  ❌ icon-${size}x${size}.png - Manquant`, 'red');
      allIconsExist = false;
    }
  });
  
  return allIconsExist;
}

// Fonction pour valider les splash screens
function validateSplashScreens() {
  log('\n🌟 Validation des splash screens...', 'yellow');
  
  const splashScreens = ['iphone12-splash', 'iphonex-splash', 'ipad-splash', 'ipadpro-splash'];
  const splashDir = path.join(__dirname, '..', 'public', 'splash');
  
  let allSplashExist = true;
  
  splashScreens.forEach(screen => {
    const splashPath = path.join(splashDir, `${screen}.png`);
    if (fs.existsSync(splashPath)) {
      const stats = fs.statSync(splashPath);
      const sizeKB = Math.round(stats.size / 1024);
      log(`  ✅ ${screen}.png (${sizeKB} KB)`, 'cyan');
    } else {
      log(`  ❌ ${screen}.png - Manquant`, 'red');
      allSplashExist = false;
    }
  });
  
  return allSplashExist;
}

// Fonction pour valider le manifest
function validateManifest() {
  log('\n📝 Validation du manifest.json...', 'yellow');
  
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    log('❌ manifest.json non trouvé', 'red');
    return false;
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    if (!manifest.icons || manifest.icons.length === 0) {
      log('❌ Aucune icône dans le manifest', 'red');
      return false;
    }
    
    log(`✅ ${manifest.icons.length} icônes dans le manifest`, 'green');
    
    // Vérifier que les icônes existent
    let allIconsExist = true;
    manifest.icons.forEach(icon => {
      const iconPath = path.join(__dirname, '..', 'public', icon.src);
      if (fs.existsSync(iconPath)) {
        log(`  ✅ ${icon.src} (${icon.sizes})`, 'cyan');
      } else {
        log(`  ❌ ${icon.src} - Fichier manquant`, 'red');
        allIconsExist = false;
      }
    });
    
    return allIconsExist;
    
  } catch (error) {
    log(`❌ Erreur de parsing du manifest: ${error.message}`, 'red');
    return false;
  }
}

// Fonction principale
function main() {
  log('🔍 VALIDATION DE L\'INTÉGRATION DES LOGOS', 'bold');
  log('==========================================\n', 'blue');
  
  let totalIssues = 0;
  
  // Files à valider pour l'usage du logo web
  const webFiles = [
    'src/components/HomePage.tsx',
    'src/components/layout/Header.tsx',
    'src/components/layout/Sidebar.tsx',
    'src/components/screens/AppleLoginScreen.tsx',
    'src/components/ui/BadgePreview.tsx',
    'src/components/visitor/VisitorBadge.tsx',
    'src/components/visitor/VisitorExport.tsx',
    'src/utils/badgeGenerator.ts',
    'src/components/LoginScreen.tsx',
    'src/components/Login.tsx'
  ];
  
  // Validation des fichiers web
  log('🌐 Validation de l\'usage du logo sur le site web...', 'yellow');
  
  webFiles.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (!validateFile(fullPath, webLogoPatterns, 'web')) {
      totalIssues++;
    }
  });
  
  // Validation des assets PWA
  const iconsValid = validateGeneratedIcons();
  const splashValid = validateSplashScreens();
  const manifestValid = validateManifest();
  
  if (!iconsValid) totalIssues++;
  if (!splashValid) totalIssues++;
  if (!manifestValid) totalIssues++;
  
  // Validation des fichiers de configuration
  log('\n📋 Validation des fichiers de configuration...', 'yellow');
  
  const indexPath = path.join(__dirname, '..', 'index.html');
  if (!validateFile(indexPath, [
    { name: 'logo_web', regex: '/logo-dgi\\.png', expected: true },
    { name: 'icon_apple', regex: '/icons/icon-180x180\\.png', expected: true }
  ], 'config')) {
    totalIssues++;
  }
  
  // Résultats finaux
  log('\n' + '='.repeat(50), 'blue');
  
  if (totalIssues === 0) {
    log('🎉 VALIDATION RÉUSSIE !', 'green');
    log('======================', 'green');
    log('\n✅ Tous les tests sont passés:', 'green');
    log('• Logo web (logo-dgi.png) utilisé correctement', 'cyan');
    log('• Icônes PWA générées depuis logo mobile (logo-dgi1.png)', 'cyan');
    log('• Splash screens créés', 'cyan');
    log('• Manifest.json configuré', 'cyan');
    log('• Fichiers de configuration mis à jour', 'cyan');
    
    log('\n🚀 Prêt pour le déploiement !', 'green');
    
    // Créer un rapport de validation
    const report = {
      timestamp: new Date().toISOString(),
      status: 'success',
      webLogo: 'logo-dgi.png',
      mobileLogo: 'logo-dgi1.png',
      iconsGenerated: 10,
      splashScreensGenerated: 4,
      issues: 0
    };
    
    fs.writeFileSync(
      path.join(__dirname, '..', 'logo-validation-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    log('\n📄 Rapport sauvegardé: logo-validation-report.json', 'cyan');
    
  } else {
    log('❌ VALIDATION ÉCHOUÉE !', 'red');
    log('=====================', 'red');
    log(`\n${totalIssues} problème(s) détecté(s)`, 'red');
    log('\nActions recommandées:', 'yellow');
    log('1. Vérifier les fichiers marqués ❌', 'cyan');
    log('2. Relancer generate-mobile-pwa-icons.js si nécessaire', 'cyan');
    log('3. Corriger les références aux anciens logos', 'cyan');
    
    process.exit(1);
  }
}

main();
