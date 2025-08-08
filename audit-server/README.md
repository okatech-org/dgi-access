# Serveur d'Audit DGI Access

Serveur centralisé pour la collecte et l'analyse des événements d'audit de l'application DGI Access.

## 🚀 Démarrage rapide

### Installation locale
```bash
cd audit-server
npm install
npm start
```

### Avec Docker
```bash
cd audit-server
docker-compose up -d
```

## 📊 API Endpoints

### Health Check
```http
GET /health
```

### Envoi d'événements d'audit
```http
POST /api/logs
Content-Type: application/json
X-API-Key: your-api-key

{
  "events": [
    {
      "id": "unique-event-id",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "userId": "user123",
      "userName": "Jean NGUEMA",
      "userRole": "ADMIN",
      "action": "LOGIN",
      "resource": "Système",
      "details": "Connexion réussie",
      "status": "success",
      "riskLevel": "low"
    }
  ]
}
```

### Statistiques
```http
GET /api/stats?startDate=2024-01-01&endDate=2024-01-31
X-API-Key: your-api-key
```

### Recherche dans les logs
```http
GET /api/search?action=LOGIN&userId=user123&limit=50
X-API-Key: your-api-key
```

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `PORT` | Port du serveur | `3001` |
| `LOG_DIR` | Dossier des logs | `./logs` |
| `AUDIT_API_KEY` | Clé API d'authentification | `dev-audit-key-123` |
| `SERVER_IP` | IP du serveur (pour métadonnées) | `unknown` |

### Configuration de production

Créer un fichier `.env` :
```env
PORT=3001
LOG_DIR=/var/log/dgi-audit
AUDIT_API_KEY=votre-cle-api-securisee-ici
SERVER_IP=10.0.1.50
```

## 🔒 Sécurité

### Authentification
- Toutes les routes d'API nécessitent une clé API
- Header: `X-API-Key: your-key` ou `Authorization: Bearer your-key`

### Rate Limiting
- 100 requêtes par minute par IP
- Configurable via `rate-limiter-flexible`

### Validation
- Validation stricte des événements d'audit
- Sanitisation des entrées
- Logs d'erreurs sécurisés

## 📁 Structure des logs

Les événements sont stockés dans des fichiers JSONL (JSON Lines) :
```
logs/
├── audit-2024-01-15.jsonl
├── audit-2024-01-16.jsonl
└── ...
```

Chaque ligne est un événement JSON :
```json
{"id":"evt_001","timestamp":"2024-01-15T10:30:00Z","userId":"user123","action":"LOGIN",...}
```

## 📈 Monitoring

### Health Check
Le serveur expose un endpoint `/health` pour le monitoring :
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Métriques recommandées
- Nombre d'événements par minute
- Taux d'erreur des requêtes
- Latence moyenne
- Espace disque utilisé

## 🐳 Déploiement Docker

### Build local
```bash
docker build -t dgi-audit-server .
docker run -p 3001:3001 -e AUDIT_API_KEY=your-key dgi-audit-server
```

### Docker Compose
```bash
# Démarrage
docker-compose up -d

# Logs
docker-compose logs -f audit-server

# Arrêt
docker-compose down
```

## 🧪 Tests

### Test du serveur local
```bash
# Démarrer le serveur
npm start

# Dans un autre terminal
npm test
```

### Test avec curl
```bash
# Health check
curl http://localhost:3001/health

# Envoi d'événement
curl -X POST http://localhost:3001/api/logs \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-audit-key-123" \
  -d '{"events":[{"id":"test","timestamp":"2024-01-15T10:30:00Z","userId":"user1","userName":"Test User","userRole":"ADMIN","action":"LOGIN","resource":"Système","details":"Test","status":"success","riskLevel":"low"}]}'
```

## 🔧 Configuration de l'application cliente

Dans votre application DGI Access, configurez l'endpoint d'audit :

```env
VITE_AUDIT_ENDPOINT=http://localhost:3001/api/logs
# ou pour la production:
VITE_AUDIT_ENDPOINT=https://audit.dgi.ga/api/logs
```

## 📊 Maintenance

### Rotation des logs
Les logs sont automatiquement séparés par jour. Pour nettoyer les anciens logs :

```bash
# Supprimer les logs de plus de 90 jours
find logs/ -name "audit-*.jsonl" -mtime +90 -delete
```

### Sauvegarde
Sauvegarder le dossier `logs/` régulièrement :

```bash
# Backup quotidien
tar -czf backup-audit-$(date +%Y%m%d).tar.gz logs/
```

## 🚨 Alertes recommandées

Configurer des alertes pour :
- Événements avec `riskLevel: "critical"`
- Taux d'erreur > 5%
- Espace disque < 10%
- Serveur indisponible > 1min

## 📞 Support

Pour toute question :
1. Vérifier les logs : `docker-compose logs audit-server`
2. Tester la connectivité : `curl http://localhost:3001/health`
3. Vérifier la configuration des variables d'environnement

---

*Développé par ORGANEUS Gabon*
