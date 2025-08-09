#!/usr/bin/env node

/**
 * Script pour générer les icônes PWA à partir du logo principal
 * Utilise le logo DGI existant pour créer toutes les tailles nécessaires
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des tailles d'icônes nécessaires
const iconSizes = [
  72, 96, 128, 144, 152, 180, 192, 384, 512
];

const splashSizes = [
  { name: 'iphone12-splash', width: 1170, height: 2532 },
  { name: 'iphonex-splash', width: 1125, height: 2436 },
  { name: 'ipad-splash', width: 1668, height: 2388 }
];

// Fonction pour créer les dossiers nécessaires
function ensureDirectories() {
  const dirs = ['public/icons', 'public/splash', 'public/screenshots'];
  
  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Dossier créé: ${dir}`);
    }
  });
}

// Fonction pour créer un fichier SVG d'icône avec le logo DGI
function createIconSVG(size) {
  const padding = size * 0.1;
  const iconSize = size - (padding * 2);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond avec gradient -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#047857;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="2" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Arrière-plan -->
  <rect width="${size}" height="${size}" fill="url(#gradient)" rx="${size * 0.15}" ry="${size * 0.15}"/>
  
  <!-- Conteneur blanc pour le logo -->
  <rect x="${padding}" y="${padding}" width="${iconSize}" height="${iconSize}" 
        fill="white" rx="${iconSize * 0.1}" ry="${iconSize * 0.1}" 
        opacity="0.95" filter="url(#shadow)"/>
  
  <!-- Texte DGI -->
  <text x="${size/2}" y="${size/2 + size*0.05}" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.25}" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="#059669">DGI</text>
  
  <!-- Sous-texte -->
  <text x="${size/2}" y="${size/2 + size*0.18}" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.08}" 
        text-anchor="middle" 
        fill="#6b7280">ACCESS</text>
</svg>`;
}

// Fonction pour créer un splash screen SVG
function createSplashSVG(width, height, name) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond avec gradient -->
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#047857;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Arrière-plan -->
  <rect width="${width}" height="${height}" fill="url(#bg-gradient)"/>
  
  <!-- Logo central -->
  <g transform="translate(${width/2}, ${height/2})">
    <!-- Conteneur blanc -->
    <rect x="-100" y="-100" width="200" height="200" 
          fill="white" rx="30" ry="30" opacity="0.95"/>
    
    <!-- Texte DGI -->
    <text x="0" y="10" 
          font-family="Arial, sans-serif" 
          font-size="60" 
          font-weight="bold" 
          text-anchor="middle" 
          fill="#059669">DGI</text>
    
    <!-- Sous-texte -->
    <text x="0" y="50" 
          font-family="Arial, sans-serif" 
          font-size="24" 
          text-anchor="middle" 
          fill="#6b7280">ACCESS</text>
  </g>
  
  <!-- Texte de chargement -->
  <text x="${width/2}" y="${height - 100}" 
        font-family="Arial, sans-serif" 
        font-size="18" 
        text-anchor="middle" 
        fill="white" 
        opacity="0.8">Chargement de l'application...</text>
</svg>`;
}

// Fonction pour créer les fichiers d'icônes
function generateIcons() {
  console.log('🎨 Génération des icônes PWA...\n');
  
  iconSizes.forEach(size => {
    const svg = createIconSVG(size);
    const filename = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.svg`);
    
    fs.writeFileSync(filename, svg);
    console.log(`✅ Icône créée: icon-${size}x${size}.svg`);
  });
  
  // Créer aussi les versions spéciales pour iOS
  const iosSizes = [152, 167, 180];
  iosSizes.forEach(size => {
    if (!iconSizes.includes(size)) {
      const svg = createIconSVG(size);
      const filename = path.join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.svg`);
      
      fs.writeFileSync(filename, svg);
      console.log(`✅ Icône iOS créée: icon-${size}x${size}.svg`);
    }
  });
}

// Fonction pour créer les splash screens
function generateSplashScreens() {
  console.log('\n🎨 Génération des splash screens...\n');
  
  splashSizes.forEach(({ name, width, height }) => {
    const svg = createSplashSVG(width, height, name);
    const filename = path.join(__dirname, '..', 'public', 'splash', `${name}.svg`);
    
    fs.writeFileSync(filename, svg);
    console.log(`✅ Splash screen créé: ${name}.svg`);
  });
}

// Fonction pour créer un browserconfig.xml pour Windows
function createBrowserConfig() {
  const config = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/icons/icon-72x72.png"/>
      <square150x150logo src="/icons/icon-152x152.png"/>
      <square310x310logo src="/icons/icon-512x512.png"/>
      <TileColor>#059669</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;

  const filename = path.join(__dirname, '..', 'public', 'browserconfig.xml');
  fs.writeFileSync(filename, config);
  console.log('\n✅ browserconfig.xml créé');
}

// Fonction pour créer des screenshots de démonstration
function createDemoScreenshots() {
  console.log('\n🎨 Génération des screenshots de démonstration...\n');
  
  // Desktop screenshot
  const desktopSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1920" height="1080" fill="#f9fafb"/>
  <rect x="0" y="0" width="1920" height="80" fill="#059669"/>
  <text x="960" y="50" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="white">DGI Access - Système de Gestion</text>
  <rect x="100" y="150" width="400" height="800" fill="white" stroke="#e5e7eb" stroke-width="2" rx="8"/>
  <text x="300" y="200" font-family="Arial" font-size="18" font-weight="bold" text-anchor="middle" fill="#111827">Menu Principal</text>
  <rect x="600" y="150" width="1220" height="800" fill="white" stroke="#e5e7eb" stroke-width="2" rx="8"/>
  <text x="1210" y="200" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="#111827">Tableau de Bord</text>
</svg>`;

  // Mobile screenshot
  const mobileSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="390" height="844" viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg">
  <rect width="390" height="844" fill="#f9fafb"/>
  <rect x="0" y="0" width="390" height="100" fill="#059669"/>
  <text x="195" y="60" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="white">DGI Access</text>
  <rect x="20" y="120" width="350" height="200" fill="white" stroke="#e5e7eb" stroke-width="2" rx="8"/>
  <text x="195" y="220" font-family="Arial" font-size="16" text-anchor="middle" fill="#111827">Accès Rapide</text>
</svg>`;

  fs.writeFileSync(path.join(__dirname, '..', 'public', 'screenshots', 'desktop-home.svg'), desktopSVG);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'screenshots', 'mobile-home.svg'), mobileSVG);
  
  console.log('✅ Screenshots de démonstration créés');
}

// Fonction pour créer une note sur la conversion en PNG
function createConversionNote() {
  const note = `# Conversion des icônes SVG en PNG

Les icônes ont été générées en format SVG pour une meilleure qualité et flexibilité.
Pour les convertir en PNG (nécessaire pour certaines plateformes), vous pouvez utiliser :

## Option 1: Outil en ligne
- https://cloudconvert.com/svg-to-png
- https://convertio.co/fr/svg-png/

## Option 2: ImageMagick (ligne de commande)
\`\`\`bash
# Installer ImageMagick
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Ubuntu/Debian

# Convertir toutes les icônes
for file in public/icons/*.svg; do
  convert "$file" "\${file%.svg}.png"
done
\`\`\`

## Option 3: Script Node.js avec sharp
\`\`\`bash
npm install sharp
node scripts/convert-icons-to-png.js
\`\`\`

Les icônes PNG sont nécessaires pour :
- iOS (Apple Touch Icons)
- Android (Manifest icons)
- Windows (Tiles)
- Splash screens

Les formats SVG peuvent être utilisés pour :
- Navigateurs modernes
- Maskable icons
- Icônes adaptatives
`;

  fs.writeFileSync(path.join(__dirname, '..', 'public', 'icons', 'README.md'), note);
  console.log('\n📝 Instructions de conversion créées dans public/icons/README.md');
}

// Fonction principale
function main() {
  console.log('🚀 Génération des assets PWA pour DGI Access\n');
  console.log('================================================\n');
  
  // Créer les dossiers
  ensureDirectories();
  
  // Générer les icônes
  generateIcons();
  
  // Générer les splash screens
  generateSplashScreens();
  
  // Créer browserconfig.xml
  createBrowserConfig();
  
  // Créer les screenshots de démonstration
  createDemoScreenshots();
  
  // Créer la note de conversion
  createConversionNote();
  
  console.log('\n================================================');
  console.log('✅ Génération terminée avec succès !');
  console.log('\n📌 Note: Les icônes sont en format SVG.');
  console.log('   Consultez public/icons/README.md pour les convertir en PNG si nécessaire.');
}

// Exécuter le script
main();
