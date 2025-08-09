# Conversion des icônes SVG en PNG

Les icônes ont été générées en format SVG pour une meilleure qualité et flexibilité.
Pour les convertir en PNG (nécessaire pour certaines plateformes), vous pouvez utiliser :

## Option 1: Outil en ligne
- https://cloudconvert.com/svg-to-png
- https://convertio.co/fr/svg-png/

## Option 2: ImageMagick (ligne de commande)
```bash
# Installer ImageMagick
brew install imagemagick  # macOS
sudo apt-get install imagemagick  # Ubuntu/Debian

# Convertir toutes les icônes
for file in public/icons/*.svg; do
  convert "$file" "${file%.svg}.png"
done
```

## Option 3: Script Node.js avec sharp
```bash
npm install sharp
node scripts/convert-icons-to-png.js
```

Les icônes PNG sont nécessaires pour :
- iOS (Apple Touch Icons)
- Android (Manifest icons)
- Windows (Tiles)
- Splash screens

Les formats SVG peuvent être utilisés pour :
- Navigateurs modernes
- Maskable icons
- Icônes adaptatives
