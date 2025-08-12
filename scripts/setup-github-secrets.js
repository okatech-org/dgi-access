#!/usr/bin/env node

/**
 * Script de configuration des secrets GitHub pour DGI Access
 * Ce script aide à identifier et configurer les secrets nécessaires
 */

import chalk from 'chalk';
import inquirer from 'inquirer';

const secrets = {
  required: [
    {
      name: 'GITHUB_TOKEN',
      description: 'Token GitHub (automatiquement fourni par GitHub Actions)',
      scope: 'GitHub Actions',
      status: '✅ Automatique',
      action: 'Aucune action requise - fourni automatiquement par GitHub'
    }
  ],
  optional: [
    {
      name: 'OPENAI_API_KEY',
      description: 'Clé API OpenAI pour les tests d\'intégration IA',
      scope: 'Tests d\'intégration (branche main uniquement)',
      status: '⚠️ Optionnel',
      action: 'Obtenir sur https://platform.openai.com/api-keys',
      impact: 'Sans cette clé, les tests OpenAI seront ignorés'
    },
    {
      name: 'NETLIFY_AUTH_TOKEN',
      description: 'Token d\'authentification Netlify',
      scope: 'Déploiement automatique',
      status: '⚠️ Optionnel',
      action: 'Obtenir dans Netlify > User Settings > Personal Access Tokens',
      impact: 'Sans ce token, les déploiements Netlify seront ignorés'
    },
    {
      name: 'NETLIFY_STAGING_SITE_ID',
      description: 'ID du site Netlify pour le staging',
      scope: 'Déploiement staging (branche develop)',
      status: '⚠️ Optionnel',
      action: 'Obtenir dans Netlify > Site Settings > General > Site details',
      impact: 'Sans cet ID, le déploiement staging sera ignoré'
    },
    {
      name: 'NETLIFY_PRODUCTION_SITE_ID',
      description: 'ID du site Netlify pour la production',
      scope: 'Déploiement production (branche main)',
      status: '⚠️ Optionnel',
      action: 'Obtenir dans Netlify > Site Settings > General > Site details',
      impact: 'Sans cet ID, le déploiement production sera ignoré'
    },
    {
      name: 'SLACK_WEBHOOK_URL',
      description: 'URL webhook Slack pour les notifications',
      scope: 'Notifications de déploiement et d\'erreurs',
      status: '⚠️ Optionnel',
      action: 'Créer dans Slack > Apps > Incoming Webhooks',
      impact: 'Sans cette URL, les notifications Slack seront ignorées'
    }
  ]
};

function displayHeader() {
  console.log(chalk.blue.bold('\n🔐 Configuration des Secrets GitHub - DGI Access\n'));
  console.log(chalk.gray('Ce script vous aide à configurer les secrets nécessaires pour votre workflow CI/CD.\n'));
}

function displaySecretsTable() {
  console.log(chalk.yellow.bold('📋 Secrets Requis:\n'));
  
  secrets.required.forEach(secret => {
    console.log(chalk.green(`✅ ${secret.name}`));
    console.log(chalk.gray(`   Description: ${secret.description}`));
    console.log(chalk.gray(`   Action: ${secret.action}\n`));
  });

  console.log(chalk.yellow.bold('📋 Secrets Optionnels:\n'));
  
  secrets.optional.forEach(secret => {
    console.log(chalk.yellow(`⚠️  ${secret.name}`));
    console.log(chalk.gray(`   Description: ${secret.description}`));
    console.log(chalk.gray(`   Scope: ${secret.scope}`));
    console.log(chalk.gray(`   Comment obtenir: ${secret.action}`));
    console.log(chalk.gray(`   Impact si manquant: ${secret.impact}\n`));
  });
}

function displayConfigurationInstructions() {
  console.log(chalk.blue.bold('🛠️  Instructions de Configuration:\n'));
  
  console.log(chalk.white('1. Accédez aux paramètres de votre référentiel GitHub'));
  console.log(chalk.gray('   → Allez sur: https://github.com/VOTRE_USERNAME/dgi-access/settings/secrets/actions\n'));
  
  console.log(chalk.white('2. Cliquez sur "New repository secret"'));
  console.log(chalk.gray('   → Pour chaque secret que vous souhaitez configurer\n'));
  
  console.log(chalk.white('3. Configurez les secrets selon vos besoins:'));
  
  secrets.optional.forEach(secret => {
    console.log(chalk.blue(`   • ${secret.name}:`));
    console.log(chalk.gray(`     ${secret.action}`));
  });
  
  console.log(chalk.green.bold('\n✨ Le workflow fonctionnera même sans tous les secrets configurés!'));
  console.log(chalk.gray('Les étapes optionnelles seront simplement ignorées avec continue-on-error: true\n'));
}

function displayValidationChecklist() {
  console.log(chalk.blue.bold('✅ Liste de Vérification:\n'));
  
  const checklist = [
    'Le workflow de base fonctionne sans aucun secret optionnel',
    'Les tests unitaires s\'exécutent correctement',
    'Le build de l\'application réussit',
    'Les tests de sécurité s\'exécutent',
    'Si configuré: les tests OpenAI fonctionnent',
    'Si configuré: les déploiements Netlify fonctionnent',
    'Si configuré: les notifications Slack fonctionnent'
  ];
  
  checklist.forEach((item, index) => {
    console.log(chalk.gray(`${index + 1}. ☐ ${item}`));
  });
  
  console.log(chalk.blue('\n💡 Conseils:'));
  console.log(chalk.gray('• Commencez par tester le workflow sans secrets optionnels'));
  console.log(chalk.gray('• Ajoutez les secrets un par un et testez après chaque ajout'));
  console.log(chalk.gray('• Utilisez des branches de test pour valider la configuration'));
}

async function main() {
  displayHeader();
  displaySecretsTable();
  displayConfigurationInstructions();
  displayValidationChecklist();
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Que souhaitez-vous faire?',
      choices: [
        'Afficher les URLs de configuration',
        'Générer un fichier de configuration',
        'Tester la configuration actuelle',
        'Quitter'
      ]
    }
  ]);
  
  switch (action) {
    case 'Afficher les URLs de configuration':
      displayConfigurationURLs();
      break;
    case 'Générer un fichier de configuration':
      await generateConfigFile();
      break;
    case 'Tester la configuration actuelle':
      testCurrentConfiguration();
      break;
    default:
      console.log(chalk.green('\n👋 Configuration terminée!'));
  }
}

function displayConfigurationURLs() {
  console.log(chalk.blue.bold('\n🔗 URLs de Configuration:\n'));
  
  const urls = {
    'GitHub Secrets': 'https://github.com/VOTRE_USERNAME/dgi-access/settings/secrets/actions',
    'OpenAI API Keys': 'https://platform.openai.com/api-keys',
    'Netlify Access Tokens': 'https://app.netlify.com/user/applications#personal-access-tokens',
    'Slack Webhooks': 'https://api.slack.com/apps'
  };
  
  Object.entries(urls).forEach(([service, url]) => {
    console.log(chalk.blue(`${service}:`));
    console.log(chalk.gray(`${url}\n`));
  });
}

async function generateConfigFile() {
  const configContent = `# Configuration des Secrets GitHub - DGI Access

## Secrets Requis (Automatiques)
- \`GITHUB_TOKEN\`: Fourni automatiquement par GitHub Actions

## Secrets Optionnels

### OpenAI (Tests d'Intégration)
- \`OPENAI_API_KEY\`: Clé API OpenAI
  - Obtenir sur: https://platform.openai.com/api-keys
  - Impact: Tests OpenAI ignorés si manquant

### Netlify (Déploiements)
- \`NETLIFY_AUTH_TOKEN\`: Token d'authentification Netlify
  - Obtenir sur: https://app.netlify.com/user/applications#personal-access-tokens
- \`NETLIFY_STAGING_SITE_ID\`: ID du site staging
- \`NETLIFY_PRODUCTION_SITE_ID\`: ID du site production
  - Obtenir dans: Site Settings > General > Site details
  - Impact: Déploiements ignorés si manquants

### Slack (Notifications)
- \`SLACK_WEBHOOK_URL\`: URL webhook pour notifications
  - Obtenir sur: https://api.slack.com/apps
  - Impact: Notifications ignorées si manquant

## Instructions
1. Allez sur: https://github.com/VOTRE_USERNAME/dgi-access/settings/secrets/actions
2. Cliquez sur "New repository secret"
3. Ajoutez chaque secret selon vos besoins
4. Testez le workflow après chaque ajout
`;

  const fs = await import('fs/promises');
  await fs.writeFile('./SECRETS_CONFIGURATION.md', configContent);
  console.log(chalk.green('\n✅ Fichier SECRETS_CONFIGURATION.md généré!'));
}

function testCurrentConfiguration() {
  console.log(chalk.blue.bold('\n🧪 Test de Configuration:\n'));
  console.log(chalk.gray('Pour tester votre configuration:'));
  console.log(chalk.white('1. Poussez un commit sur la branche develop (pour staging)'));
  console.log(chalk.white('2. Poussez un commit sur la branche main (pour production)'));
  console.log(chalk.white('3. Vérifiez l\'onglet Actions de votre référentiel GitHub'));
  console.log(chalk.gray('\nLes étapes sans secrets configurés seront ignorées avec continue-on-error: true'));
}

// Exécuter uniquement si c'est le module principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { secrets, displaySecretsTable, displayConfigurationInstructions };
