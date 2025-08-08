#!/usr/bin/env node
/**
 * Script de test pour le serveur d'audit
 */

const API_KEY = 'dev-audit-key-123';
const BASE_URL = 'http://localhost:3001';

console.log('🧪 Test du serveur d\'audit...\n');

async function testHealthCheck() {
  console.log('🔍 Test 1: Health check...');
  
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Serveur en ligne - Uptime: ${Math.round(data.uptime)}s\n`);
      return true;
    } else {
      console.log(`❌ Health check échoué: ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur connexion: ${error.message}\n`);
    return false;
  }
}

async function testSendLogs() {
  console.log('🔍 Test 2: Envoi d\'événements d\'audit...');
  
  const testEvents = [
    {
      id: 'test_001',
      timestamp: new Date().toISOString(),
      userId: 'user_123',
      userName: 'Jean NGUEMA',
      userRole: 'ADMIN',
      action: 'LOGIN',
      resource: 'Système',
      details: 'Test de connexion depuis le script de test',
      status: 'success',
      riskLevel: 'low',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'test_002',
      timestamp: new Date().toISOString(),
      userId: 'user_456',
      userName: 'Marie OBAME',
      userRole: 'RECEPTION',
      action: 'AI_EXTRACTION',
      resource: 'Document CNI',
      details: 'Test extraction IA document CNI',
      status: 'success',
      riskLevel: 'medium',
      metadata: { documentType: 'CNI', confidence: 0.95 }
    },
    {
      id: 'test_003',
      timestamp: new Date().toISOString(),
      userId: 'user_789',
      userName: 'Paul OBIANG',
      userRole: 'ADMIN',
      action: 'SYSTEM_CONFIG_CHANGE',
      resource: 'Configuration IA',
      details: 'Test modification configuration système',
      status: 'success',
      riskLevel: 'high'
    }
  ];
  
  try {
    const response = await fetch(`${BASE_URL}/api/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ events: testEvents })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Événements envoyés: ${result.successful}/${result.processed}`);
      if (result.failed > 0) {
        console.log(`⚠️  Échecs: ${result.failed}`);
      }
      console.log();
      return true;
    } else {
      console.log(`❌ Erreur envoi: ${response.status} - ${result.error}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur envoi événements: ${error.message}\n`);
    return false;
  }
}

async function testGetStats() {
  console.log('🔍 Test 3: Récupération des statistiques...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/stats`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    const stats = await response.json();
    
    if (response.ok) {
      console.log('✅ Statistiques récupérées:');
      console.log(`   Total événements: ${stats.totalEvents}`);
      console.log(`   Actions: ${Object.keys(stats.byAction).join(', ')}`);
      console.log(`   Statuts: ${Object.keys(stats.byStatus).join(', ')}`);
      console.log(`   Niveaux de risque: ${Object.keys(stats.byRiskLevel).join(', ')}`);
      console.log();
      return true;
    } else {
      console.log(`❌ Erreur stats: ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur récupération stats: ${error.message}\n`);
    return false;
  }
}

async function testSearch() {
  console.log('🔍 Test 4: Recherche dans les logs...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/search?action=LOGIN&limit=5`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Recherche réussie: ${result.total} résultats trouvés`);
      console.log(`   Affichés: ${result.events.length} événements`);
      if (result.events.length > 0) {
        const event = result.events[0];
        console.log(`   Premier: ${event.action} par ${event.userName}`);
      }
      console.log();
      return true;
    } else {
      console.log(`❌ Erreur recherche: ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur recherche: ${error.message}\n`);
    return false;
  }
}

async function testAuthFailure() {
  console.log('🔍 Test 5: Test sécurité (clé API invalide)...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'invalid-key'
      },
      body: JSON.stringify({ events: [] })
    });
    
    if (response.status === 401) {
      console.log('✅ Authentification correctement refusée\n');
      return true;
    } else {
      console.log(`❌ Sécurité défaillante: status ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur test sécurité: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests du serveur d\'audit...\n');
  
  const results = [];
  
  results.push(await testHealthCheck());
  results.push(await testSendLogs());
  results.push(await testGetStats());
  results.push(await testSearch());
  results.push(await testAuthFailure());
  
  const passedTests = results.filter(Boolean).length;
  const totalTests = results.length;
  
  console.log('📊 Résultats des tests:');
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Tous les tests sont passés ! Serveur d\'audit opérationnel.');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez la configuration du serveur.');
  }
  
  console.log('\n💡 Pour démarrer le serveur:');
  console.log('   cd audit-server');
  console.log('   npm install');
  console.log('   npm start');
}

// Exécution
runTests().catch(console.error);
