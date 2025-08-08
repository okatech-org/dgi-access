# Serveur d'audit DGI Access
FROM node:20-alpine

# Métadonnées
LABEL maintainer="ORGANEUS Gabon"
LABEL description="Serveur d'audit pour DGI Access Application"
LABEL version="1.0.0"

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY --chown=nodejs:nodejs . .

# Créer le dossier de logs
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001
ENV LOG_DIR=/app/logs
ENV AUDIT_API_KEY=production-audit-key-change-me

# Utiliser l'utilisateur non-root
USER nodejs

# Commande de démarrage
CMD ["npm", "start"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:${PORT}/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"
