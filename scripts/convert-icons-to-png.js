#!/usr/bin/env node

/**
 * Script pour convertir les icônes SVG en PNG
 * Utilise sharp pour la conversion
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour convertir un SVG en PNG
async function convertSvgToPng(svgPath, pngPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath);
    
    console.log(`✅ Converti: ${path.basename(pngPath)}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la conversion de ${path.basename(svgPath)}: ${error.message}`);
  }
}

// Fonction principale
async function main() {
  console.log('🎨 Conversion des icônes SVG en PNG...\n');
  
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  const splashDir = path.join(__dirname, '..', 'public', 'splash');
  const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
  
  // Liste tous les fichiers SVG dans le dossier icons
  const iconFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));
  
  // Convertir chaque icône
  for (const file of iconFiles) {
    if (file.startsWith('icon-')) {
      const svgPath = path.join(iconsDir, file);
      const pngPath = svgPath.replace('.svg', '.png');
      
      // Extraire la taille du nom du fichier
      const sizeMatch = file.match(/icon-(\d+)x\d+\.svg/);
      if (sizeMatch) {
        const size = parseInt(sizeMatch[1]);
        await convertSvgToPng(svgPath, pngPath, size);
      }
    }
  }
  
  // Convertir les splash screens
  console.log('\n🎨 Conversion des splash screens...\n');
  
  const splashFiles = fs.readdirSync(splashDir).filter(file => file.endsWith('.svg'));
  
  for (const file of splashFiles) {
    const svgPath = path.join(splashDir, file);
    const pngPath = svgPath.replace('.svg', '.png');
    
    // Dimensions spécifiques pour chaque splash screen
    let width, height;
    if (file.includes('iphone12')) {
      width = 1170;
      height = 2532;
    } else if (file.includes('iphonex')) {
      width = 1125;
      height = 2436;
    } else if (file.includes('ipad')) {
      width = 1668;
      height = 2388;
    }
    
    if (width && height) {
      try {
        await sharp(svgPath)
          .resize(width, height)
          .png()
          .toFile(pngPath);
        
        console.log(`✅ Splash screen converti: ${path.basename(pngPath)}`);
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
      }
    }
  }
  
  // Convertir les screenshots
  console.log('\n🎨 Conversion des screenshots...\n');
  
  const screenshotFiles = fs.readdirSync(screenshotsDir).filter(file => file.endsWith('.svg'));
  
  for (const file of screenshotFiles) {
    const svgPath = path.join(screenshotsDir, file);
    const pngPath = svgPath.replace('.svg', '.png');
    
    // Dimensions spécifiques pour chaque screenshot
    let width, height;
    if (file.includes('desktop')) {
      width = 1920;
      height = 1080;
    } else if (file.includes('mobile')) {
      width = 390;
      height = 844;
    }
    
    if (width && height) {
      try {
        await sharp(svgPath)
          .resize(width, height)
          .png()
          .toFile(pngPath);
        
        console.log(`✅ Screenshot converti: ${path.basename(pngPath)}`);
      } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
      }
    }
  }
  
  console.log('\n✅ Conversion terminée !');
}

// Exécuter le script
main().catch(console.error);
