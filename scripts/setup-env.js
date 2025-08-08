#!/usr/bin/env node
/**
 * Script de configuration de l'environnement
 * Usage: node scripts/setup-env.js [environment]
 */

import fs from 'fs';
import path from 'path';

const environments = {
  development: {
    VITE_AI_PROVIDER: 'openai',
    VITE_AI_API_KEY: '${VITE_AI_API_KEY}', // À définir via variables d'environnement
    VITE_AI_MODEL: 'gpt-4o-mini',
    VITE_AI_MAX_RETRIES: '3',
    VITE_AI_TIMEOUT: '30000',
    VITE_AUDIT_ENABLED: 'true',
    VITE_AUDIT_LEVEL: 'info',
    VITE_AUDIT_RETENTION_DAYS: '90',
    VITE_AUDIT_MAX_ENTRIES: '10000',
    VITE_APP_NAME: 'DGI Access Application',
    VITE_APP_VERSION: '1.0.0',
    VITE_DEV_MODE: 'true',
    VITE_BASE_URL: 'http://localhost:5173',
    VITE_NOTIFICATION_SERVICE: 'local',
    VITE_SESSION_DURATION: '480',
    VITE_2FA_ENABLED: 'false'
  },
  
  staging: {
    VITE_AI_PROVIDER: 'openai',
    VITE_AI_API_KEY: '${VITE_AI_API_KEY}', // À définir via variables d'environnement
    VITE_AI_MODEL: 'gpt-4o-mini',
    VITE_AI_MAX_RETRIES: '3',
    VITE_AI_TIMEOUT: '30000',
    VITE_AUDIT_ENABLED: 'true',
    VITE_AUDIT_LEVEL: 'info',
    VITE_AUDIT_ENDPOINT: 'http://localhost:3001/api/logs',
    VITE_AUDIT_API_KEY: 'dev-audit-key-123',
    VITE_APP_NAME: 'DGI Access Application (Staging)',
    VITE_APP_VERSION: '1.0.0',
    VITE_DEV_MODE: 'false',
    VITE_BASE_URL: 'https://staging.dgi-access.ga',
    VITE_NOTIFICATION_SERVICE: 'local',
    VITE_SESSION_DURATION: '480',
    VITE_2FA_ENABLED: 'true'
  },
  
  production: {
    VITE_AI_PROVIDER: 'openai',
    VITE_AI_API_KEY: '${VITE_AI_API_KEY}', // À définir en prod via secrets
    VITE_AI_MODEL: 'gpt-4o',
    VITE_AI_MAX_RETRIES: '5',
    VITE_AI_TIMEOUT: '45000',
    VITE_AUDIT_ENABLED: 'true',
    VITE_AUDIT_LEVEL: 'warn',
    VITE_AUDIT_ENDPOINT: 'https://audit.dgi.ga/api/logs',
    VITE_AUDIT_API_KEY: '${VITE_AUDIT_API_KEY}', // À définir en prod via secrets
    VITE_AUDIT_RETENTION_DAYS: '365',
    VITE_APP_NAME: 'DGI Access Application',
    VITE_APP_VERSION: '1.0.0',
    VITE_DEV_MODE: 'false',
    VITE_BASE_URL: 'https://access.dgi.ga',
    VITE_NOTIFICATION_SERVICE: 'firebase',
    VITE_SESSION_DURATION: '240',
    VITE_2FA_ENABLED: 'true',
    VITE_ENCRYPTION_KEY: '${VITE_ENCRYPTION_KEY}' // À définir en prod
  }
};

function createEnvFile(env = 'development') {
  const config = environments[env];
  
  if (!config) {
    console.error(`❌ Environnement "${env}" non trouvé`);
    console.log(`Environnements disponibles: ${Object.keys(environments).join(', ')}`);
    process.exit(1);
  }
  
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const header = `# Configuration ${env.toUpperCase()} - DGI Access Application
# Généré automatiquement le ${new Date().toLocaleString('fr-FR')}

`;
  
  const fullContent = header + envContent;
  
  try {
    fs.writeFileSync('.env', fullContent);
    console.log(`✅ Fichier .env créé pour l'environnement "${env}"`);
    console.log(`📁 Fichier: ${path.resolve('.env')}`);
    console.log(`\n🔧 Variables configurées:`);
    Object.keys(config).forEach(key => {
      const value = config[key].includes('${') ? '[SECRET]' : config[key];
      console.log(`  ${key}=${value}`);
    });
  } catch (error) {
    console.error(`❌ Erreur lors de la création du fichier .env:`, error.message);
    process.exit(1);
  }
}

// Script principal
const env = process.argv[2] || 'development';
console.log(`🚀 Configuration de l'environnement "${env}"...`);
createEnvFile(env);
