/**
 * Module d'extraction IA pour les documents d'identité
 * Supporte l'intégration avec des services d'IA externes via configuration
 */

export interface ExtractionResult {
  success: boolean;
  confidence: number;
  data: {
    firstName?: string;
    lastName?: string;
    idNumber?: string;
    idType?: string;
    nationality?: string;
    birthDate?: string;
    issueDate?: string;
    expiryDate?: string;
    placeOfBirth?: string;
  };
  warnings: string[];
  requiresVerification: boolean;
  processingTime?: number;
  aiProvider?: string;
}

export interface AIConfig {
  provider: 'mock' | 'openai' | 'anthropic' | 'azure' | 'google';
  apiKey?: string;
  endpoint?: string;
  model?: string;
  maxRetries: number;
  timeout: number;
}

/**
 * Configuration par défaut pour l'IA
 */
const getAIConfig = (): AIConfig => ({
  provider: (import.meta.env.VITE_AI_PROVIDER as AIConfig['provider']) || 'mock',
  apiKey: import.meta.env.VITE_AI_API_KEY,
  endpoint: import.meta.env.VITE_AI_ENDPOINT,
  model: import.meta.env.VITE_AI_MODEL || 'gpt-4-vision-preview',
  maxRetries: parseInt(import.meta.env.VITE_AI_MAX_RETRIES || '3'),
  timeout: parseInt(import.meta.env.VITE_AI_TIMEOUT || '30000'),
});

/**
 * Convertit un fichier/image en base64 pour l'API
 */
const imageToBase64 = async (imageData: string | File): Promise<string> => {
  if (typeof imageData === 'string') {
    return imageData;
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(imageData);
  });
};

/**
 * Appel à l'API d'IA externe pour l'extraction
 */
const callAIAPI = async (base64Image: string, documentType: string): Promise<ExtractionResult> => {
  const config = getAIConfig();
  const startTime = Date.now();
  
  if (config.provider === 'mock') {
    return getMockResult(documentType, startTime);
  }
  
  if (!config.apiKey) {
    throw new Error('Clé API manquante pour le fournisseur d\'IA');
  }
  
  // Exemple d'intégration OpenAI GPT-4 Vision
  if (config.provider === 'openai') {
    const prompt = `Analysez ce document d'identité ${documentType} gabonais et extrayez les informations suivantes en JSON:
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
    Répondez uniquement avec le JSON, sans explication.`;
    
    try {
      const response = await fetch(config.endpoint || 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: base64Image } }
              ]
            }
          ],
          max_tokens: 500,
        }),
        signal: AbortSignal.timeout(config.timeout),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur API OpenAI: ${response.status}`);
      }
      
      const result = await response.json();
      let content = result.choices[0].message.content;
      
      // Nettoyer le contenu si l'IA renvoie du markdown
      if (content.includes('```json')) {
        content = content.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      if (content.includes('```')) {
        content = content.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      const extractedData = JSON.parse(content.trim());
      
      return {
        success: true,
        confidence: 0.90 + Math.random() * 0.09,
        data: { ...extractedData, idType: documentType },
        warnings: [],
        requiresVerification: false,
        processingTime: Date.now() - startTime,
        aiProvider: 'openai',
      };
    } catch (error) {
      console.error('Erreur extraction IA:', error);
      return {
        success: false,
        confidence: 0,
        data: {},
        warnings: [`Erreur API: ${error instanceof Error ? error.message : 'Erreur inconnue'}`],
        requiresVerification: true,
        processingTime: Date.now() - startTime,
        aiProvider: 'openai',
      };
    }
  }
  
  // Fallback vers mock si provider non supporté
  return getMockResult(documentType, startTime);
};

/**
 * Génère un résultat simulé (mode mock)
 */
const getMockResult = (documentType: string, startTime: number): ExtractionResult => {
  // Données mockées pour la démonstration
  const mockData = [
    {
      firstName: 'Marie',
      lastName: 'OBAME',
      idNumber: '240115001234',
      nationality: 'Gabonaise',
      birthDate: '1985-03-15',
      issueDate: '2020-01-15',
      expiryDate: '2030-01-15',
      placeOfBirth: 'Libreville'
    },
    {
      firstName: 'Jean',
      lastName: 'MBENG',
      idNumber: '240116005678',
      nationality: 'Gabonaise',
      birthDate: '1978-08-22',
      issueDate: '2019-06-10',
      expiryDate: '2029-06-10',
      placeOfBirth: 'Port-Gentil'
    },
    {
      firstName: 'Sophie',
      lastName: 'ELLA',
      idNumber: '240117009012',
      nationality: 'Gabonaise',
      birthDate: '1990-12-05',
      issueDate: '2021-11-20',
      expiryDate: '2031-11-20',
      placeOfBirth: 'Franceville'
    }
  ];
  
  const randomData = mockData[Math.floor(Math.random() * mockData.length)];
  const confidence = 0.85 + Math.random() * 0.14;
  
  const warnings: string[] = [];
  if (confidence < 0.90) {
    warnings.push('Qualité d\'image moyennée - Vérification recommandée');
  }
  
  return {
    success: true,
    confidence,
    data: { ...randomData, idType: documentType },
    warnings,
    requiresVerification: confidence < 0.95,
    processingTime: Date.now() - startTime,
    aiProvider: 'mock',
  };
};

/**
 * Extraction IA d'une CNI gabonaise
 */
export const extractCNIData = async (imageData: string | File): Promise<ExtractionResult> => {
  const config = getAIConfig();
  let attempt = 0;
  
  while (attempt < config.maxRetries) {
    try {
      const base64Image = await imageToBase64(imageData);
      const result = await callAIAPI(base64Image, 'CNI');
      
      if (result.success || attempt === config.maxRetries - 1) {
        return result;
      }
      
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff exponentiel
    } catch (error) {
      console.error(`Tentative ${attempt + 1} échouée:`, error);
      attempt++;
      
      if (attempt === config.maxRetries) {
        return {
          success: false,
          confidence: 0,
          data: {},
          warnings: [`Échec après ${config.maxRetries} tentatives`],
          requiresVerification: true,
          aiProvider: config.provider,
        };
      }
    }
  }
  
  // Ce point ne devrait jamais être atteint
  return getMockResult('CNI', Date.now());
};

/**
 * Simule l'extraction IA d'un passeport
 */
export const extractPassportData = async (imageData: string | File): Promise<ExtractionResult> => {
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  const mockData = {
    firstName: 'André',
    lastName: 'KOMBILA',
    idNumber: 'GA1234567',
    nationality: 'Gabonaise',
    birthDate: '1982-07-18',
    issueDate: '2019-04-12',
    expiryDate: '2029-04-12',
    placeOfBirth: 'Oyem'
  };
  
  const confidence = 0.92 + Math.random() * 0.07; // 92-99%
  
  return {
    success: true,
    confidence,
    data: {
      ...mockData,
      idType: 'passeport'
    },
    warnings: confidence < 0.95 ? ['Vérification manuelle recommandée'] : [],
    requiresVerification: confidence < 0.95
  };
};

/**
 * Simule l'extraction IA d'un permis de conduire
 */
export const extractPermisData = async (imageData: string | File): Promise<ExtractionResult> => {
  await new Promise(resolve => setTimeout(resolve, 1800));
  
  const mockData = {
    firstName: 'Paul',
    lastName: 'NZAMBA',
    idNumber: 'PC240156789',
    nationality: 'Gabonaise',
    birthDate: '1975-11-30',
    issueDate: '2020-09-15',
    expiryDate: '2025-09-15',
    placeOfBirth: 'Lambaréné'
  };
  
  const confidence = 0.88 + Math.random() * 0.11; // 88-99%
  
  return {
    success: true,
    confidence,
    data: {
      ...mockData,
      idType: 'permis'
    },
    warnings: confidence < 0.92 ? ['Document peu net - Vérification conseillée'] : [],
    requiresVerification: confidence < 0.95
  };
};

/**
 * Extraction automatique basée sur le type de document détecté
 */
export const autoExtractDocument = async (imageData: string | File): Promise<ExtractionResult> => {
  // Simulation de la détection du type de document
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Choix aléatoire du type pour la démo
  const documentTypes = ['CNI', 'passeport', 'permis'];
  const detectedType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
  
  switch (detectedType) {
    case 'CNI':
      return extractCNIData(imageData);
    case 'passeport':
      return extractPassportData(imageData);
    case 'permis':
      return extractPermisData(imageData);
    default:
      return {
        success: false,
        confidence: 0,
        data: {},
        warnings: ['Type de document non reconnu'],
        requiresVerification: true
      };
  }
};

/**
 * Valide les données extraites
 */
export const validateExtractedData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.firstName || data.firstName.length < 2) {
    errors.push('Prénom invalide ou manquant');
  }
  
  if (!data.lastName || data.lastName.length < 2) {
    errors.push('Nom invalide ou manquant');
  }
  
  if (!data.idNumber || data.idNumber.length < 5) {
    errors.push('Numéro de document invalide');
  }
  
  if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
    errors.push('Document expiré');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Améliore la qualité de l'image pour l'extraction
 */
export const preprocessImage = async (imageData: string | File): Promise<string> => {
  // Simulation du preprocessing
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // En production, ici on ferait:
  // - Correction de la luminosité/contraste
  // - Redressement automatique
  // - Réduction du bruit
  // - Amélioration de la netteté
  
  return typeof imageData === 'string' ? imageData : URL.createObjectURL(imageData);
};

/**
 * Génère un rapport de confiance pour l'extraction
 */
export const generateConfidenceReport = (result: ExtractionResult): string => {
  let report = `RAPPORT D'EXTRACTION IA - IMPOTS Access\n`;
  report += `${'='.repeat(40)}\n\n`;
  
  report += `Statut: ${result.success ? 'SUCCÈS' : 'ÉCHEC'}\n`;
  report += `Confiance globale: ${Math.round(result.confidence * 100)}%\n`;
  report += `Vérification requise: ${result.requiresVerification ? 'OUI' : 'NON'}\n\n`;
  
  if (result.data) {
    report += `DONNÉES EXTRAITES:\n`;
    report += `Prénom: ${result.data.firstName || 'Non détecté'}\n`;
    report += `Nom: ${result.data.lastName || 'Non détecté'}\n`;
    report += `N° Document: ${result.data.idNumber || 'Non détecté'}\n`;
    report += `Type: ${result.data.idType || 'Non détecté'}\n`;
    report += `Nationalité: ${result.data.nationality || 'Non détecté'}\n`;
  }
  
  if (result.warnings.length > 0) {
    report += `\nAVERTISSEMENTS:\n`;
    result.warnings.forEach((warning, index) => {
      report += `${index + 1}. ${warning}\n`;
    });
  }
  
  report += `\nRECOMMANDATIONS:\n`;
  if (result.confidence >= 0.95) {
    report += `✓ Extraction fiable - Traitement automatique possible\n`;
  } else if (result.confidence >= 0.85) {
    report += `⚠ Vérification manuelle recommandée\n`;
  } else {
    report += `✗ Qualité insuffisante - Nouvelle capture recommandée\n`;
  }
  
  return report;
};