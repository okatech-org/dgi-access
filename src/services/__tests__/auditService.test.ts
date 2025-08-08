/**
 * Tests unitaires pour le service d'audit
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { auditService } from '../auditService';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logEvent', () => {
    it('doit enregistrer un événement d\'audit basique', async () => {
      const eventData = {
        userId: 'user123',
        userName: 'Jean NGUEMA',
        userRole: 'ADMIN',
        action: 'LOGIN' as const,
        resource: 'Système',
        details: 'Connexion réussie',
        status: 'success' as const,
        riskLevel: 'low' as const,
      };

      await auditService.logEvent(eventData);

      // Vérifier que l'événement a été sauvegardé localement
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'audit_logs',
        expect.stringContaining('"action":"LOGIN"')
      );
    });

    it('doit générer un ID unique pour chaque événement', async () => {
      const eventData = {
        userId: 'user123',
        userName: 'Jean NGUEMA',
        userRole: 'ADMIN',
        action: 'LOGIN' as const,
        resource: 'Système',
        details: 'Test',
        status: 'success' as const,
        riskLevel: 'low' as const,
      };

      await auditService.logEvent(eventData);
      await auditService.logEvent(eventData);

      // Vérifier que setItem a été appelé 2 fois avec des IDs différents
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
      
      const calls = localStorageMock.setItem.mock.calls;
      const event1 = JSON.parse(calls[0][1])[0];
      const event2 = JSON.parse(calls[1][1])[0];
      
      expect(event1.id).not.toBe(event2.id);
    });
  });

  describe('logLogin', () => {
    it('doit enregistrer une connexion réussie', async () => {
      await auditService.logLogin('user123', 'Jean NGUEMA', true);

      const savedData = localStorageMock.setItem.mock.calls[0][1];
      const events = JSON.parse(savedData);
      
      expect(events[0]).toMatchObject({
        action: 'LOGIN',
        status: 'success',
        riskLevel: 'low',
      });
    });

    it('doit enregistrer une connexion échouée', async () => {
      await auditService.logLogin('user123', 'Jean NGUEMA', false, 'Mot de passe incorrect');

      const savedData = localStorageMock.setItem.mock.calls[0][1];
      const events = JSON.parse(savedData);
      
      expect(events[0]).toMatchObject({
        action: 'FAILED_LOGIN',
        status: 'failure',
        riskLevel: 'medium',
        details: 'Mot de passe incorrect',
      });
    });
  });

  describe('logAIExtraction', () => {
    it('doit enregistrer une extraction IA avec confiance élevée', async () => {
      await auditService.logAIExtraction('user123', 'Marie OBAME', 'RECEPTION', 'CNI', 0.95);

      const savedData = localStorageMock.setItem.mock.calls[0][1];
      const events = JSON.parse(savedData);
      
      expect(events[0]).toMatchObject({
        action: 'AI_EXTRACTION',
        status: 'success',
        riskLevel: 'low',
        metadata: {
          documentType: 'CNI',
          confidence: 0.95,
        },
      });
    });

    it('doit enregistrer une extraction IA avec confiance faible', async () => {
      await auditService.logAIExtraction('user123', 'Marie OBAME', 'RECEPTION', 'Passeport', 0.75);

      const savedData = localStorageMock.setItem.mock.calls[0][1];
      const events = JSON.parse(savedData);
      
      expect(events[0]).toMatchObject({
        action: 'AI_EXTRACTION',
        status: 'warning',
        riskLevel: 'medium',
      });
    });
  });

  describe('getLogs', () => {
    beforeEach(() => {
      const mockLogs = [
        {
          id: 'log1',
          timestamp: '2024-01-15T10:00:00Z',
          userId: 'user1',
          action: 'LOGIN',
          status: 'success',
        },
        {
          id: 'log2',
          timestamp: '2024-01-15T11:00:00Z',
          userId: 'user2',
          action: 'AI_EXTRACTION',
          status: 'success',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLogs));
    });

    it('doit récupérer tous les logs sans filtre', async () => {
      const logs = await auditService.getLogs();
      
      expect(logs).toHaveLength(2);
      expect(logs[0].action).toBe('LOGIN');
      expect(logs[1].action).toBe('AI_EXTRACTION');
    });

    it('doit filtrer par action', async () => {
      const logs = await auditService.getLogs({ action: 'LOGIN' });
      
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('LOGIN');
    });

    it('doit filtrer par utilisateur', async () => {
      const logs = await auditService.getLogs({ userId: 'user1' });
      
      expect(logs).toHaveLength(1);
      expect(logs[0].userId).toBe('user1');
    });

    it('doit appliquer la limite', async () => {
      const logs = await auditService.getLogs({ limit: 1 });
      
      expect(logs).toHaveLength(1);
    });
  });

  describe('exportLogs', () => {
    beforeEach(() => {
      const mockLogs = [
        {
          id: 'log1',
          timestamp: '2024-01-15T10:00:00Z',
          userId: 'user1',
          userName: 'Jean NGUEMA',
          userRole: 'ADMIN',
          action: 'LOGIN',
          resource: 'Système',
          details: 'Connexion réussie',
          status: 'success',
          riskLevel: 'low',
        },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLogs));
    });

    it('doit générer un CSV valide', async () => {
      const csv = await auditService.exportLogs();
      
      expect(csv).toContain('Horodatage,Utilisateur,Rôle,Action');
      expect(csv).toContain('2024-01-15T10:00:00Z,Jean NGUEMA,ADMIN,LOGIN');
      expect(csv).toContain('"Connexion réussie"');
    });
  });

  describe('cleanupOldLogs', () => {
    it('doit supprimer les logs expirés', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100); // 100 jours
      
      const newDate = new Date();
      newDate.setDate(newDate.getDate() - 10); // 10 jours
      
      const mockLogs = [
        {
          id: 'old_log',
          timestamp: oldDate.toISOString(),
          userId: 'user1',
          action: 'LOGIN',
        },
        {
          id: 'new_log',
          timestamp: newDate.toISOString(),
          userId: 'user2',
          action: 'LOGIN',
        },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLogs));

      await auditService.cleanupOldLogs();

      // Vérifier que seul le log récent est conservé
      const savedCall = localStorageMock.setItem.mock.calls.find(call => call[0] === 'audit_logs');
      if (savedCall) {
        const savedLogs = JSON.parse(savedCall[1]);
        expect(savedLogs).toHaveLength(1);
        expect(savedLogs[0].id).toBe('new_log');
      }
    });
  });
});
