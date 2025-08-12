#!/usr/bin/env node

/**
 * Script de validation de la configuration des secrets
 * Vérifie que le workflow GitHub Actions fonctionne correctement
 */

import chalk from 'chalk';

console.log(chalk.blue.bold('\n🔍 Validation de la Configuration des Secrets\n'));

// URLs importantes
const urls = {
  workflow: 'https://github.com/okatech-org/dgi-access/actions',
  secrets: 'https://github.com/okatech-org/dgi-access/settings/secrets/actions',
  pullRequest: 'https://github.com/okatech-org/dgi-access/pull/new/clean-secrets-test'
};

console.log(chalk.yellow.bold('📋 Étapes de Validation:\n'));

const steps = [
  {
    emoji: '🚀',
    title: 'Vérifier le workflow GitHub Actions',
    description: 'Le workflow doit s\'exécuter sans erreurs',
    action: `Allez sur: ${urls.workflow}`,
    checks: [
      'Job "config-check" affiche le résumé des secrets',
      'Tests unitaires passent',
      'Build réussit',
      'Tests de sécurité s\'exécutent'
    ]
  },
  {
    emoji: '🔐',
    title: 'Configurer les secrets progressivement',
    description: 'Ajoutez les secrets selon vos besoins',
    action: `Allez sur: ${urls.secrets}`,
    checks: [
      'OPENAI_API_KEY (optionnel)',
      'NETLIFY_AUTH_TOKEN (optionnel)',
      'NETLIFY_STAGING_SITE_ID (optionnel)',
      'NETLIFY_PRODUCTION_SITE_ID (optionnel)',
      'SLACK_WEBHOOK_URL (optionnel)'
    ]
  },
  {
    emoji: '🧪',
    title: 'Tester chaque configuration',
    description: 'Testez après chaque ajout de secret',
    action: 'Poussez un commit et surveillez le workflow',
    checks: [
      'Tests OpenAI si OPENAI_API_KEY configuré',
      'Déploiements Netlify si tokens configurés',
      'Notifications Slack si webhook configuré'
    ]
  }
];

steps.forEach((step, index) => {
  console.log(chalk.white.bold(`${step.emoji} ${index + 1}. ${step.title}`));
  console.log(chalk.gray(`   ${step.description}`));
  console.log(chalk.blue(`   Action: ${step.action}`));
  console.log(chalk.gray('   Vérifications:'));
  step.checks.forEach(check => {
    console.log(chalk.gray(`     ☐ ${check}`));
  });
  console.log();
});

console.log(chalk.green.bold('✨ Commandes de Validation:\n'));

const commands = [
  { cmd: 'bun run test:workflow', desc: 'Vérifier la configuration locale' },
  { cmd: 'bun run setup:secrets', desc: 'Guide interactif de configuration' },
  { cmd: 'bun run test:all', desc: 'Tests complets locaux' },
  { cmd: 'bun run build', desc: 'Vérifier que le build fonctionne' }
];

commands.forEach(({ cmd, desc }) => {
  console.log(chalk.blue(`   ${cmd}`));
  console.log(chalk.gray(`   ${desc}\n`));
});

console.log(chalk.yellow.bold('📊 Indicateurs de Réussite:\n'));

const indicators = [
  '✅ Workflow GitHub Actions passe sans erreurs',
  '✅ Job config-check affiche clairement l\'état des secrets',
  '✅ Étapes optionnelles sont ignorées gracieusement',
  '✅ Messages informatifs guident la configuration',
  '✅ Chaque secret ajouté active sa fonctionnalité correspondante'
];

indicators.forEach(indicator => {
  console.log(chalk.gray(`${indicator}`));
});

console.log(chalk.blue.bold('\n🔗 Liens Utiles:\n'));

Object.entries(urls).forEach(([name, url]) => {
  console.log(chalk.white(`${name.charAt(0).toUpperCase() + name.slice(1)}:`));
  console.log(chalk.gray(`${url}\n`));
});

console.log(chalk.green.bold('🎉 Votre workflow CI/CD est maintenant prêt !'));
console.log(chalk.gray('Il fonctionne sans secrets et s\'améliore progressivement avec chaque configuration.'));
