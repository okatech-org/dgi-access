#!/usr/bin/env node
/**
 * Script de test de la configuration OpenAI
 * Usage: node scripts/test-openai.js
 */

import 'dotenv/config';

const API_KEY = process.env.VITE_AI_API_KEY;
const MODEL = process.env.VITE_AI_MODEL || 'gpt-4o-mini';
const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

console.log('🧪 Test de la configuration OpenAI...\n');

if (!API_KEY) {
  console.error('❌ Clé API OpenAI manquante');
  console.log('💡 Assurez-vous que VITE_AI_API_KEY est défini dans votre fichier .env');
  process.exit(1);
}

console.log('📋 Configuration:');
console.log(`  Modèle: ${MODEL}`);
console.log(`  Clé API: ${API_KEY.substring(0, 20)}...`);
console.log(`  Endpoint: ${ENDPOINT}\n`);

async function testBasicAPI() {
  console.log('🔍 Test 1: Appel API basique...');
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: 'Réponds juste "Test réussi" en français.'
          }
        ],
        max_tokens: 10,
        temperature: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log(`✅ Réponse OpenAI: "${content}"`);
    console.log(`📊 Tokens utilisés: ${data.usage.total_tokens}\n`);
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur API: ${error.message}\n`);
    return false;
  }
}

async function testVisionAPI() {
  console.log('🔍 Test 2: API Vision (simulation extraction document)...');
  
  // Image de test (petit PNG 1x1 en base64)
  const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: 'Cette image est un test. Réponds juste "Vision API fonctionnelle" en français.' 
              },
              { 
                type: 'image_url', 
                image_url: { url: testImage } 
              }
            ]
          }
        ],
        max_tokens: 20,
        temperature: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log(`✅ API Vision: "${content}"`);
    console.log(`📊 Tokens utilisés: ${data.usage.total_tokens}\n`);
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur Vision API: ${error.message}\n`);
    return false;
  }
}

async function testDocumentExtraction() {
  console.log('🔍 Test 3: Simulation extraction document CNI...');
  
  const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  const prompt = `Analysez ce document d'identité CNI gabonais et extrayez les informations suivantes en JSON:
{
  "firstName": "prénom",
  "lastName": "nom de famille", 
  "idNumber": "numéro du document",
  "nationality": "nationalité",
  "birthDate": "date de naissance (YYYY-MM-DD)",
  "issueDate": "date d'émission (YYYY-MM-DD)", 
  "expiryDate": "date d'expiration (YYYY-MM-DD)",
  "placeOfBirth": "lieu de naissance"
}
IMPORTANT: Comme c'est un test avec une image vide, renvoyez des données fictives réalistes pour un CNI gabonais. Répondez uniquement avec le JSON, sans explication.`;

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: testImage } }
            ]
          }
        ],
        max_tokens: 200,
        temperature: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      // Nettoyer le contenu si l'IA renvoie du markdown
      let cleanContent = content;
      if (cleanContent.includes('```json')) {
        cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      if (cleanContent.includes('```')) {
        cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      const extractedData = JSON.parse(cleanContent.trim());
      console.log('✅ Extraction réussie:');
      console.log('📄 Données extraites:');
      Object.entries(extractedData).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      console.log(`📊 Tokens utilisés: ${data.usage.total_tokens}\n`);
      return true;
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError.message);
      console.log('📝 Réponse brute:', content);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erreur extraction: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests OpenAI...\n');
  
  const results = [];
  
  results.push(await testBasicAPI());
  results.push(await testVisionAPI());
  results.push(await testDocumentExtraction());
  
  const passedTests = results.filter(Boolean).length;
  const totalTests = results.length;
  
  console.log('📊 Résultats des tests:');
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Tous les tests sont passés ! Configuration OpenAI opérationnelle.');
  } else {
    console.log('⚠️  Certains tests ont échoué. Vérifiez la configuration.');
  }
  
  console.log('\n💰 Estimation du coût:');
  console.log('  - Tests basiques: ~0.001$ par test');
  console.log('  - Extraction document: ~0.005$ par document');
  console.log('  - Usage recommandé: Surveiller les quotas OpenAI');
}

// Exécution
runTests().catch(console.error);
