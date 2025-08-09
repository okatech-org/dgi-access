# 🧪 Guide de Test Rapide PWA - DGI Access

## 🚀 **Tests Immédiats**

### **1. Test de Démarrage**

```bash
# Arrêter tous les processus
pkill -f "vite"

# Nettoyer et redémarrer
npm run dev
```

### **2. Vérifications Console**

Ouvrir **DevTools** (F12) et vérifier :

- ✅ **Aucune erreur** de hook invalide
- ✅ **Service Worker** enregistré
- ✅ **PWA Provider** initialisé
- ✅ **Manifest** chargé correctement

### **3. Test Debug PWA**

1. Aller sur `http://localhost:5173`
2. **Cliquer sur le bouton bleu** 🔍 en bas à droite
3. Vérifier les informations :
   - Plateforme détectée
   - Support PWA
   - État d'installation

### **4. Test Installation**

#### **Sur Desktop :**

- Rechercher **icône d'installation** dans la barre d'adresse
- Ou attendre le **popup automatique**

#### **Sur Mobile :**

- **iOS Safari** : Instructions avec bouton partage
- **Android Chrome** : Popup "Ajouter à l'écran d'accueil"

---

## 🔧 **Résolution de Problèmes**

### **Erreur "Invalid Hook Call"**

```bash
# Solution complète
rm -rf node_modules/.vite
rm -rf dist/
npm run dev
```

### **Port 5173 occupé**

```bash
pkill -f "vite"
pkill -f "port.*5173"
npm run dev
```

### **Icônes non trouvées**

```bash
# Régénérer les icônes
node scripts/generate-pwa-icons.js
node scripts/convert-icons-to-png.js
```

### **Cache navigateur**

- **Ctrl+Shift+R** (Windows/Linux)
- **Cmd+Shift+R** (Mac)
- Ou **mode incognito**

---

## ✅ **Checklist de Validation**

### **Console DevTools**

- [ ] Aucune erreur React
- [ ] Service Worker enregistré
- [ ] Manifest valide
- [ ] PWA initialisée

### **Interface**

- [ ] Bouton debug PWA visible (dev)
- [ ] Notifications PWA fonctionnelles
- [ ] Navigation fluide
- [ ] Responsive design

### **Fonctionnalités PWA**

- [ ] Détection de plateforme
- [ ] Popup d'installation
- [ ] Mode hors-ligne
- [ ] Mises à jour automatiques

### **Performance**

- [ ] Chargement < 3s
- [ ] Pas d'erreurs console
- [ ] Service Worker actif
- [ ] Cache fonctionnel

---

## 📊 **Tests Automatiques**

### **Test Complet PWA**

```bash
node scripts/test-pwa.js
# Doit afficher: SCORE GLOBAL 100%
```

### **Build Production**

```bash
npm run build
npm run preview
# Tester installation en mode production
```

---

## 🎯 **Commandes de Debug**

### **Logs Service Worker**

```javascript
// Dans la console navigateur
navigator.serviceWorker.ready.then(reg => console.log('SW:', reg));
```

### **État PWA**

```javascript
// Vérifier l'état d'installation
console.log('Standalone:', window.matchMedia('(display-mode: standalone)').matches);
console.log('PWA:', 'serviceWorker' in navigator);
```

### **Cache Status**

```javascript
// Vérifier le cache
caches.keys().then(keys => console.log('Caches:', keys));
```

---

## 🚨 **Erreurs Communes et Solutions**

### **1. "Cannot read properties of null (reading 'useState')"**

**Cause :** Conflits entre anciens et nouveaux composants PWA

**Solution :**

```bash
node scripts/clean-project.js
npm run dev
```

### **2. "Port 5173 is already in use"**

**Cause :** Processus Vite encore actifs

**Solution :**

```bash
pkill -f "vite"
npm run dev
```

### **3. "Download error or resource isn't a valid image"**

**Cause :** Icônes PNG corrompues ou manquantes

**Solution :**

```bash
node scripts/convert-icons-to-png.js
npm run dev
```

### **4. "Invalid hook call"**

**Cause :** Anciens hooks en conflit

**Solution :**

```bash
rm -rf node_modules/.vite
rm -rf src/components/PWAInstallPrompt.tsx
rm -rf src/hooks/useServiceWorker.*
npm run dev
```

---

## ✨ **Test de Succès**

### **Indicateurs de Bon Fonctionnement**

1. **Console propre** : Aucune erreur rouge
2. **PWA détectée** : Lighthouse score 100
3. **Installation possible** : Popup ou icône visible
4. **Mode debug** : Bouton bleu fonctionnel
5. **Hors-ligne** : Pages accessibles sans réseau

### **Messages de Succès Attendus**

```text
🏛️ Initialisation de l'application DGI Access...
✅ Données réelles DGI initialisées avec succès
🚀 Application DGI Access initialisée avec les données réelles
🚀 Initialisation des améliorations PWA
✅ Améliorations PWA initialisées
```

---

## 🎉 **Validation Finale**

Une fois tous les tests passés :

1. **Score PWA** : 100% avec `node scripts/test-pwa.js`
2. **Lighthouse** : Score PWA 100
3. **Installation** : Fonctionnelle sur tous appareils
4. **Mode hors-ligne** : Pages accessibles
5. **Performance** : Chargement rapide

**🏛️ Votre PWA DGI Access est prête pour la production !**
