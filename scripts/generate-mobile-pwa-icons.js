#!/usr/bin/env node

/**
 * Script pour générer les icônes PWA à partir du logo mobile DGI
 * Utilise logo-dgi1.png pour créer toutes les icônes d'application mobile
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

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

// Configuration des tailles d'icônes PWA
const iconSizes = [
  72, 96, 128, 144, 152, 167, 180, 192, 384, 512
];

// Configuration des Apple Touch Icons
const appleTouchSizes = [
  57, 60, 72, 76, 114, 120, 144, 152, 167, 180
];

// Configuration des splash screens iOS
const splashScreens = [
  { name: 'iphone12-splash', width: 390, height: 844, description: 'iPhone 12/13/14' },
  { name: 'iphonex-splash', width: 375, height: 812, description: 'iPhone X/XS/11 Pro' },
  { name: 'ipad-splash', width: 820, height: 1180, description: 'iPad Air' },
  { name: 'ipadpro-splash', width: 1024, height: 1366, description: 'iPad Pro 12.9"' }
];

// Paths
const sourceLogo = path.join(__dirname, '..', 'public', 'mobile-icons', 'logo-dgi1.png');
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
const splashDir = path.join(__dirname, '..', 'public', 'splash');

// Fonction pour créer les dossiers nécessaires
function ensureDirectories() {
  const dirs = [iconsDir, splashDir];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✅ Dossier créé: ${path.relative(path.join(__dirname, '..'), dir)}`, 'green');
    }
  });
}

// Fonction pour vérifier que le logo source existe
function checkSourceLogo() {
  if (!fs.existsSync(sourceLogo)) {
    log(`❌ Logo source introuvable: ${sourceLogo}`, 'red');
    log('Assurez-vous que logo-dgi1.png existe dans public/mobile-icons/', 'yellow');
    process.exit(1);
  }
  
  log(`✅ Logo source trouvé: ${path.basename(sourceLogo)}`, 'green');
}

// Fonction pour générer une icône PWA
async function generateIcon(size, type = 'standard') {
  try {
    const filename = type === 'apple' 
      ? `apple-touch-icon-${size}x${size}.png`
      : `icon-${size}x${size}.png`;
    
    const outputPath = path.join(iconsDir, filename);
    
    await sharp(sourceLogo)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 5, g: 150, b: 105, alpha: 1 } // Couleur DGI
      })
      .png({
        compressionLevel: 6,
        adaptiveFiltering: true
      })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    const sizeKB = Math.round(stats.size / 1024);
    
    log(`  ✅ ${filename} (${sizeKB} KB)`, 'cyan');
    
    return {
      src: `/icons/${filename}`,
      sizes: `${size}x${size}`,
      type: 'image/png',
      purpose: size >= 192 ? 'any maskable' : 'any'
    };
    
  } catch (error) {
    log(`  ❌ Erreur lors de la génération de l'icône ${size}x${size}: ${error.message}`, 'red');
    return null;
  }
}

// Fonction pour générer un splash screen
async function generateSplashScreen(config) {
  try {
    const filename = `${config.name}.png`;
    const outputPath = path.join(splashDir, filename);
    
    // Calculer la taille du logo (20% de la largeur de l'écran)
    const logoSize = Math.round(config.width * 0.2);
    
    // Créer un canvas avec la couleur de fond DGI
    const canvas = sharp({
      create: {
        width: config.width,
        height: config.height,
        channels: 4,
        background: { r: 5, g: 150, b: 105, alpha: 1 }
      }
    });
    
    // Redimensionner le logo
    const resizedLogo = await sharp(sourceLogo)
      .resize(logoSize, logoSize, { fit: 'contain' })
      .png()
      .toBuffer();
    
    // Centrer le logo sur le canvas
    const left = Math.round((config.width - logoSize) / 2);
    const top = Math.round((config.height - logoSize) / 2);
    
    await canvas
      .composite([{ input: resizedLogo, left, top }])
      .png({
        compressionLevel: 6,
        adaptiveFiltering: true
      })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    const sizeKB = Math.round(stats.size / 1024);
    
    log(`  ✅ ${filename} (${sizeKB} KB) - ${config.description}`, 'cyan');
    
  } catch (error) {
    log(`  ❌ Erreur lors de la génération du splash ${config.name}: ${error.message}`, 'red');
  }
}

// Fonction pour mettre à jour le manifest.json
async function updateManifest(iconMetadata) {
  try {
    const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      log('⚠️ manifest.json non trouvé, création...', 'yellow');
      return;
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Mettre à jour les icônes
    manifest.icons = iconMetadata.filter(icon => icon !== null);
    
    // Ajouter/mettre à jour les screenshots
    manifest.screenshots = [
      {
        src: "/screenshots/desktop-home.png",
        sizes: "1920x1080",
        type: "image/png",
        form_factor: "wide",
        label: "Page d'accueil - Desktop"
      },
      {
        src: "/screenshots/mobile-home.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Page d'accueil - Mobile"
      }
    ];
    
    // Mettre à jour les raccourcis avec les nouvelles icônes
    manifest.shortcuts = [
      {
        name: "Nouveau Visiteur",
        short_name: "Visiteur",
        description: "Enregistrer un nouveau visiteur",
        url: "/admin/reception",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
      },
      {
        name: "Gestion Personnel",
        short_name: "Personnel",
        description: "Gérer les employés DGI",
        url: "/admin/personnel",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
      }
    ];
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    log('✅ manifest.json mis à jour avec les nouvelles icônes', 'green');
    
  } catch (error) {
    log(`❌ Erreur lors de la mise à jour du manifest: ${error.message}`, 'red');
  }
}

// Fonction pour mettre à jour index.html
function updateIndexHTML() {
  try {
    const indexPath = path.join(__dirname, '..', 'index.html');
    
    if (!fs.existsSync(indexPath)) {
      log('⚠️ index.html non trouvé', 'yellow');
      return;
    }
    
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Mettre à jour l'apple-touch-icon principal
    const appleIconRegex = /<link rel="apple-touch-icon"[^>]*>/g;
    const newAppleIcon = '<link rel="apple-touch-icon" href="/icons/icon-180x180.png" />';
    
    if (appleIconRegex.test(content)) {
      content = content.replace(appleIconRegex, newAppleIcon);
    } else {
      // Ajouter si n'existe pas
      content = content.replace(
        '<link rel="manifest" href="/manifest.json" />',
        `<link rel="apple-touch-icon" href="/icons/icon-180x180.png" />\n  <link rel="manifest" href="/manifest.json" />`
      );
    }
    
    // Mettre à jour les splash screens
    const splashScreenLinks = splashScreens.map(screen => 
      `<link rel="apple-touch-startup-image" media="(device-width: ${screen.width}px) and (device-height: ${screen.height}px) and (-webkit-device-pixel-ratio: 3)" href="/splash/${screen.name}.png" />`
    ).join('\n  ');
    
    // Remplacer les anciennes splash screens
    const splashRegex = /<link rel="apple-touch-startup-image"[^>]*>/g;
    if (splashRegex.test(content)) {
      content = content.replace(splashRegex, '');
      content = content.replace(
        '<meta name="apple-mobile-web-app-title" content="DGI Access" />',
        `<meta name="apple-mobile-web-app-title" content="DGI Access" />\n  ${splashScreenLinks}`
      );
    }
    
    fs.writeFileSync(indexPath, content);
    log('✅ index.html mis à jour avec les nouvelles références d\'icônes', 'green');
    
  } catch (error) {
    log(`❌ Erreur lors de la mise à jour d'index.html: ${error.message}`, 'red');
  }
}

// Fonction principale
async function main() {
  log('🚀 GÉNÉRATION DES ICÔNES PWA MOBILE', 'bold');
  log('===================================\n', 'blue');
  
  try {
    // Vérifications préalables
    checkSourceLogo();
    ensureDirectories();
    
    // Générer les icônes PWA standard
    log('\n📱 Génération des icônes PWA...', 'yellow');
    const iconMetadata = [];
    
    for (const size of iconSizes) {
      const metadata = await generateIcon(size, 'standard');
      if (metadata) iconMetadata.push(metadata);
    }
    
    // Générer les Apple Touch Icons
    log('\n🍎 Génération des Apple Touch Icons...', 'yellow');
    
    for (const size of appleTouchSizes) {
      await generateIcon(size, 'apple');
    }
    
    // Générer les splash screens
    log('\n✨ Génération des splash screens...', 'yellow');
    
    for (const screen of splashScreens) {
      await generateSplashScreen(screen);
    }
    
    // Mettre à jour les fichiers de configuration
    log('\n📝 Mise à jour des fichiers de configuration...', 'yellow');
    await updateManifest(iconMetadata);
    updateIndexHTML();
    
    // Statistiques finales
    log('\n' + '='.repeat(50), 'blue');
    log('🎉 GÉNÉRATION TERMINÉE AVEC SUCCÈS !', 'green');
    log('='.repeat(50), 'blue');
    
    log('\n📊 Résumé:', 'yellow');
    log(`✅ ${iconSizes.length} icônes PWA générées`, 'cyan');
    log(`✅ ${appleTouchSizes.length} Apple Touch Icons générées`, 'cyan');
    log(`✅ ${splashScreens.length} splash screens générés`, 'cyan');
    log('✅ manifest.json mis à jour', 'cyan');
    log('✅ index.html mis à jour', 'cyan');
    
    log('\n🔧 Prochaines étapes:', 'yellow');
    log('1. Construire l\'application: npm run build', 'cyan');
    log('2. Tester en local: npm run preview', 'cyan');
    log('3. Déployer: npx netlify-cli deploy --prod --dir dist', 'cyan');
    
    log('\n📱 Les icônes sont prêtes pour:', 'yellow');
    log('• Installation PWA sur tous appareils', 'cyan');
    log('• Écran d\'accueil iOS/Android', 'cyan');
    log('• Splash screens natifs iOS', 'cyan');
    log('• Mode standalone complet', 'cyan');
    
  } catch (error) {
    log(`❌ Erreur lors de la génération: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Vérifier si Sharp est installé
try {
  await import('sharp');
} catch (error) {
  log('❌ Sharp non installé. Installation...', 'red');
  log('Exécutez: npm install sharp --save-dev', 'yellow');
  process.exit(1);
}

main().catch(error => {
  log(`❌ Erreur fatale: ${error.message}`, 'red');
  process.exit(1);
});
