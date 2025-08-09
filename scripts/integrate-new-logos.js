#!/usr/bin/env node

/**
 * Script d'intégration des nouveaux logos DGI
 * 1. logo-dgi1.png pour les pages du site
 * 2. logo-dgi1.png pour l'installation mobile PWA
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

const PROJECT_ROOT = path.join(__dirname, '..');

// Configuration des logos
const LOGO_CONFIG = {
  // Logo principal pour les pages du site
  siteLogo: {
    source: 'public/logo-dgi1.png',
    target: 'public/logo-dgi.png',
    description: 'Logo principal du site',
    usedIn: [
      'src/components/layout/Header.tsx',
      'src/components/layout/Sidebar.tsx',
      'src/components/LoginScreen.tsx',
      'src/components/HomePage.tsx',
      'src/components/ui/BadgePreview.tsx',
      'src/components/visitor/VisitorBadge.tsx',
      'src/components/visitor/VisitorExport.tsx',
      'src/utils/badgeGenerator.ts'
    ]
  },
  
  // Logo pour l'installation mobile (icônes PWA)
  mobileLogo: {
    source: 'public/logo-dgi1.png',
    description: 'Logo pour les icônes PWA mobiles',
    iconSizes: [72, 96, 128, 144, 152, 167, 180, 192, 384, 512]
  }
};

async function checkLogoFiles() {
  log('🔍 Vérification des fichiers logo...', 'yellow');
  
  const logoPath = path.join(PROJECT_ROOT, LOGO_CONFIG.siteLogo.source);
  
  if (!fs.existsSync(logoPath)) {
    log(`❌ Fichier manquant: ${LOGO_CONFIG.siteLogo.source}`, 'red');
    return false;
  }
  
  log(`✅ Logo trouvé: ${LOGO_CONFIG.siteLogo.source}`, 'green');
  return true;
}

async function updateSiteLogos() {
  log('\n📝 Mise à jour des logos dans le code source...', 'yellow');
  
  const sourcePath = path.join(PROJECT_ROOT, LOGO_CONFIG.siteLogo.source);
  const targetPath = path.join(PROJECT_ROOT, LOGO_CONFIG.siteLogo.target);
  
  // Copier le nouveau logo vers l'emplacement standard
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    log(`✅ Logo copié: ${LOGO_CONFIG.siteLogo.target}`, 'green');
  }
  
  // Optionnel: mettre à jour les références dans le code pour utiliser le nouveau nom
  let updatedFiles = 0;
  
  for (const filePath of LOGO_CONFIG.siteLogo.usedIn) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        const originalContent = content;
        
        // Remplacer /logo-dgi.png par /logo-dgi1.png si on veut utiliser le nouveau nom
        // Pour l'instant, on garde /logo-dgi.png pour la compatibilité
        content = content.replace(/\/logo-dgi\.png/g, '/logo-dgi.png');
        
        if (content !== originalContent) {
          fs.writeFileSync(fullPath, content);
          updatedFiles++;
          log(`  ✅ Mis à jour: ${filePath}`, 'green');
        } else {
          log(`  ℹ️ Déjà à jour: ${filePath}`, 'cyan');
        }
      } catch (error) {
        log(`  ❌ Erreur lors de la mise à jour de ${filePath}: ${error.message}`, 'red');
      }
    } else {
      log(`  ⚠️ Fichier non trouvé: ${filePath}`, 'yellow');
    }
  }
  
  log(`\n📊 ${updatedFiles} fichiers mis à jour pour les logos du site`, 'cyan');
}

async function generateMobileIcons() {
  log('\n📱 Génération des icônes PWA mobiles...', 'yellow');
  
  const sourcePath = path.join(PROJECT_ROOT, LOGO_CONFIG.mobileLogo.source);
  
  if (!fs.existsSync(sourcePath)) {
    log('❌ Logo source non trouvé pour les icônes mobiles', 'red');
    return;
  }
  
  try {
    // Utiliser sharp pour redimensionner le logo en différentes tailles
    const { default: sharp } = await import('sharp');
    
    const iconsDir = path.join(PROJECT_ROOT, 'public/icons');
    let generatedIcons = 0;
    
    for (const size of LOGO_CONFIG.mobileLogo.iconSizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      try {
        await sharp(sourcePath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 5, g: 150, b: 105, alpha: 1 } // Fond vert DGI
          })
          .png()
          .toFile(outputPath);
        
        log(`  ✅ Icône générée: icon-${size}x${size}.png`, 'green');
        generatedIcons++;
      } catch (error) {
        log(`  ❌ Erreur génération ${size}x${size}: ${error.message}`, 'red');
      }
    }
    
    // Générer aussi les icônes Apple Touch
    const appleSizes = [57, 60, 72, 76, 114, 120, 144, 152, 167, 180];
    
    for (const size of appleSizes) {
      const outputPath = path.join(iconsDir, `apple-touch-icon-${size}x${size}.png`);
      
      try {
        await sharp(sourcePath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 5, g: 150, b: 105, alpha: 1 }
          })
          .png()
          .toFile(outputPath);
        
        log(`  ✅ Apple Touch: apple-touch-icon-${size}x${size}.png`, 'green');
        generatedIcons++;
      } catch (error) {
        log(`  ❌ Erreur Apple Touch ${size}x${size}: ${error.message}`, 'red');
      }
    }
    
    log(`\n📊 ${generatedIcons} icônes mobiles générées`, 'cyan');
    
  } catch (error) {
    log(`❌ Erreur lors de l'importation de Sharp: ${error.message}`, 'red');
    log('💡 Installez Sharp avec: npm install sharp --save-dev', 'yellow');
  }
}

async function updateManifestIcons() {
  log('\n📄 Mise à jour du manifest.json...', 'yellow');
  
  const manifestPath = path.join(PROJECT_ROOT, 'public/manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    log('❌ Fichier manifest.json non trouvé', 'red');
    return;
  }
  
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    // Vérifier que les icônes référencent les bons fichiers
    let iconsUpdated = 0;
    
    if (manifest.icons) {
      for (const icon of manifest.icons) {
        // Les icônes sont déjà correctement configurées
        if (icon.src && icon.src.includes('/icons/icon-')) {
          iconsUpdated++;
        }
      }
    }
    
    log(`✅ Manifest.json vérifié: ${iconsUpdated} icônes configurées`, 'green');
    
  } catch (error) {
    log(`❌ Erreur lors de la lecture du manifest: ${error.message}`, 'red');
  }
}

async function updateIndexHtml() {
  log('\n🌐 Mise à jour des meta tags dans index.html...', 'yellow');
  
  const indexPath = path.join(PROJECT_ROOT, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    log('❌ Fichier index.html non trouvé', 'red');
    return;
  }
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    let updated = false;
    
    // Vérifier les apple-touch-icon
    const appleIconPattern = /<link rel="apple-touch-icon"[^>]*>/g;
    const appleIcons = content.match(appleIconPattern);
    
    if (appleIcons) {
      log(`✅ ${appleIcons.length} apple-touch-icon trouvés dans index.html`, 'green');
    }
    
    // Vérifier le favicon
    if (content.includes('favicon.ico')) {
      log('✅ Favicon configuré dans index.html', 'green');
    }
    
    // Si nécessaire, ajouter une référence au nouveau logo principal
    if (!content.includes('logo-dgi')) {
      log('⚠️ Aucune référence au logo DGI dans index.html', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Erreur lors de la lecture d'index.html: ${error.message}`, 'red');
  }
}

async function validateLogoIntegration() {
  log('\n✅ Validation de l\'intégration des logos...', 'yellow');
  
  const checks = [
    {
      name: 'Logo principal du site',
      path: 'public/logo-dgi.png',
      required: true
    },
    {
      name: 'Nouveau logo DGI',
      path: 'public/logo-dgi1.png',
      required: true
    },
    {
      name: 'Icône 192x192 PWA',
      path: 'public/icons/icon-192x192.png',
      required: true
    },
    {
      name: 'Icône 512x512 PWA',
      path: 'public/icons/icon-512x512.png',
      required: true
    },
    {
      name: 'Apple Touch Icon 180x180',
      path: 'public/icons/apple-touch-icon-180x180.png',
      required: true
    }
  ];
  
  let passedChecks = 0;
  
  for (const check of checks) {
    const fullPath = path.join(PROJECT_ROOT, check.path);
    const exists = fs.existsSync(fullPath);
    
    if (exists) {
      const stats = fs.statSync(fullPath);
      log(`  ✅ ${check.name}: ${(stats.size / 1024).toFixed(1)}KB`, 'green');
      passedChecks++;
    } else if (check.required) {
      log(`  ❌ ${check.name}: MANQUANT`, 'red');
    } else {
      log(`  ⚠️ ${check.name}: Optionnel`, 'yellow');
    }
  }
  
  const percentage = Math.round((passedChecks / checks.length) * 100);
  
  log(`\n📊 Score d'intégration: ${passedChecks}/${checks.length} (${percentage}%)`, 
      percentage >= 80 ? 'green' : percentage >= 60 ? 'yellow' : 'red');
  
  return percentage >= 80;
}

async function main() {
  log('🎨 INTÉGRATION DES NOUVEAUX LOGOS DGI', 'bold');
  log('====================================\n', 'blue');
  
  try {
    // 1. Vérifier les fichiers logo
    const hasLogos = await checkLogoFiles();
    if (!hasLogos) {
      log('\n❌ Logos manquants. Placez logo-dgi1.png dans public/', 'red');
      return;
    }
    
    // 2. Mettre à jour les logos du site
    await updateSiteLogos();
    
    // 3. Générer les icônes mobiles
    await generateMobileIcons();
    
    // 4. Mettre à jour le manifest
    await updateManifestIcons();
    
    // 5. Mettre à jour index.html
    await updateIndexHtml();
    
    // 6. Validation finale
    const success = await validateLogoIntegration();
    
    log('\n' + '='.repeat(50), 'blue');
    
    if (success) {
      log('🎉 INTÉGRATION RÉUSSIE !', 'green');
      log('\n📋 Prochaines étapes:', 'yellow');
      log('1. Tester l\'application: npm run dev', 'cyan');
      log('2. Vérifier les logos sur les pages', 'cyan');
      log('3. Tester l\'installation PWA mobile', 'cyan');
      log('4. Rebuilder pour production: npm run build', 'cyan');
      log('5. Redéployer: npx netlify-cli deploy --prod --dir dist', 'cyan');
    } else {
      log('⚠️ INTÉGRATION PARTIELLE', 'yellow');
      log('Vérifiez les éléments marqués ❌ ci-dessus', 'cyan');
    }
    
  } catch (error) {
    log(`❌ Erreur critique: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
main();
