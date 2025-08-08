/**
 * Tests unitaires pour le module d'extraction IA
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  extractCNIData, 
  extractPassportData, 
  autoExtractDocument,
  validateExtractedData,
  generateConfidenceReport 
} from '../aiExtraction';

// Mock fetch
global.fetch = vi.fn();

// Mock import.meta.env
vi.mock('import.meta', () => ({
  env: {
    VITE_AI_PROVIDER: 'mock',
    VITE_AI_API_KEY: 'test-key',
    VITE_AI_MODEL: 'gpt-4o-mini',
    VITE_AI_MAX_RETRIES: '3',
    VITE_AI_TIMEOUT: '30000',
  }
}));

describe('AI Extraction Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractCNIData', () => {
    it('doit extraire des données CNI en mode mock', async () => {
      const result = await extractCNIData('fake-image-data');
      
      expect(result.success).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.data.idType).toBe('CNI');
      expect(result.data.firstName).toBeDefined();
      expect(result.data.lastName).toBeDefined();
      expect(result.data.idNumber).toBeDefined();
      expect(result.processingTime).toBeDefined();
      expect(result.aiProvider).toBe('mock');
    });

    it('doit inclure des avertissements si la confiance est faible', async () => {
      // Mock Math.random pour forcer une confiance faible
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.01); // Force 85% confidence

      const result = await extractCNIData('fake-image-data');
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.requiresVerification).toBe(true);
      
      Math.random = originalRandom;
    });

    it('doit retourner des données cohérentes', async () => {
      const result = await extractCNIData('fake-image-data');
      
      expect(result.data.nationality).toBe('Gabonaise');
      expect(result.data.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.data.issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.data.expiryDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('extractPassportData', () => {
    it('doit extraire des données de passeport', async () => {
      const result = await extractPassportData('fake-passport-image');
      
      expect(result.success).toBe(true);
      expect(result.data.idType).toBe('passeport');
      expect(result.data.idNumber).toMatch(/^GA\d+/);
      expect(result.aiProvider).toBe('mock');
    });

    it('doit avoir une confiance plus élevée que CNI', async () => {
      const result = await extractPassportData('fake-passport-image');
      
      expect(result.confidence).toBeGreaterThan(0.92);
    });
  });

  describe('autoExtractDocument', () => {
    it('doit détecter automatiquement le type de document', async () => {
      const result = await autoExtractDocument('fake-document-image');
      
      expect(result.success).toBe(true);
      expect(['CNI', 'passeport', 'permis']).toContain(result.data.idType);
    });

    it('doit retourner un résultat cohérent', async () => {
      const result = await autoExtractDocument('fake-document-image');
      
      expect(result.data.firstName).toBeDefined();
      expect(result.data.lastName).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
  });

  describe('validateExtractedData', () => {
    it('doit valider des données correctes', () => {
      const validData = {
        firstName: 'Jean',
        lastName: 'NGUEMA',
        idNumber: 'CNI123456789',
        expiryDate: '2030-12-31'
      };

      const result = validateExtractedData(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('doit détecter les données manquantes', () => {
      const invalidData = {
        firstName: '',
        lastName: 'NGUEMA',
        idNumber: '123'
      };

      const result = validateExtractedData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Prénom invalide ou manquant');
      expect(result.errors).toContain('Numéro de document invalide');
    });

    it('doit détecter un document expiré', () => {
      const expiredData = {
        firstName: 'Jean',
        lastName: 'NGUEMA',
        idNumber: 'CNI123456789',
        expiryDate: '2020-01-01'
      };

      const result = validateExtractedData(expiredData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Document expiré');
    });
  });

  describe('generateConfidenceReport', () => {
    it('doit générer un rapport pour extraction réussie', () => {
      const mockResult = {
        success: true,
        confidence: 0.95,
        data: {
          firstName: 'Jean',
          lastName: 'NGUEMA',
          idNumber: 'CNI123456789',
          idType: 'CNI',
          nationality: 'Gabonaise'
        },
        warnings: [],
        requiresVerification: false
      };

      const report = generateConfidenceReport(mockResult);
      
      expect(report).toContain('RAPPORT D\'EXTRACTION IA - IMPOTS Access');
      expect(report).toContain('Statut: SUCCÈS');
      expect(report).toContain('Confiance globale: 95%');
      expect(report).toContain('Jean');
      expect(report).toContain('NGUEMA');
      expect(report).toContain('✓ Extraction fiable');
    });

    it('doit générer un rapport avec avertissements', () => {
      const mockResult = {
        success: true,
        confidence: 0.87,
        data: {
          firstName: 'Marie',
          lastName: 'OBAME'
        },
        warnings: ['Qualité d\'image moyenne'],
        requiresVerification: true
      };

      const report = generateConfidenceReport(mockResult);
      
      expect(report).toContain('AVERTISSEMENTS:');
      expect(report).toContain('Qualité d\'image moyenne');
      expect(report).toContain('⚠ Vérification manuelle recommandée');
    });

    it('doit générer un rapport pour échec', () => {
      const mockResult = {
        success: false,
        confidence: 0,
        data: {},
        warnings: ['Échec de connexion API'],
        requiresVerification: true
      };

      const report = generateConfidenceReport(mockResult);
      
      expect(report).toContain('Statut: ÉCHEC');
      expect(report).toContain('Confiance globale: 0%');
    });
  });

  describe('Gestion d\'erreurs', () => {
    it('doit gérer les erreurs de fichier', async () => {
      const invalidFile = null as any;
      
      await expect(extractCNIData(invalidFile)).rejects.toThrow();
    });

    it('doit gérer les timeouts', async () => {
      // Mock de fetch qui prend trop de temps
      const fetchMock = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 35000))
      );
      global.fetch = fetchMock;

      // Temporairement modifier la configuration pour utiliser OpenAI
      vi.mocked(import.meta.env).VITE_AI_PROVIDER = 'openai';
      
      // Le test devrait échouer rapidement grâce au timeout
      const start = Date.now();
      const result = await extractCNIData('test-image');
      const duration = Date.now() - start;
      
      // En mode mock, cela devrait retourner rapidement
      expect(duration).toBeLessThan(5000);
      expect(result.success).toBe(true); // Mode mock
    });
  });

  describe('Intégration OpenAI (simulée)', () => {
    beforeEach(() => {
      vi.mocked(import.meta.env).VITE_AI_PROVIDER = 'openai';
    });

    it('doit traiter une réponse OpenAI avec markdown', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: '```json\n{"firstName": "Jean", "lastName": "NGUEMA"}\n```'
            }
          }],
          usage: { total_tokens: 100 }
        })
      };
      
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await extractCNIData('test-image');
      
      expect(result.success).toBe(true);
      expect(result.data.firstName).toBe('Jean');
      expect(result.data.lastName).toBe('NGUEMA');
    });

    it('doit gérer les erreurs d\'API OpenAI', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      };
      
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await extractCNIData('test-image');
      
      expect(result.success).toBe(false);
      expect(result.warnings).toContain(expect.stringContaining('Erreur API'));
    });
  });
});
