/**
 * Service d'audit pour la traçabilité des actions utilisateur
 * Supporte la persistance locale et l'envoi vers un serveur d'audit externe
 */

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  status: AuditStatus;
  riskLevel: RiskLevel;
  metadata?: Record<string, any>;
}

export type AuditAction = 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'FAILED_LOGIN'
  | 'CREATE_VISITOR'
  | 'UPDATE_VISITOR'
  | 'DELETE_VISITOR'
  | 'CREATE_STAFF'
  | 'UPDATE_STAFF'
  | 'DELETE_STAFF'
  | 'GENERATE_BADGE'
  | 'SCAN_BADGE'
  | 'AI_EXTRACTION'
  | 'EXPORT_DATA'
  | 'SYSTEM_CONFIG_CHANGE'
  | 'ACCESS_DENIED'
  | 'SENSITIVE_DATA_ACCESS';

export type AuditStatus = 'success' | 'failure' | 'warning' | 'alert';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AuditConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  persistLocally: boolean;
  sendToRemote: boolean;
  remoteEndpoint?: string;
  remoteApiKey?: string;
  retentionDays: number;
  maxLocalEntries: number;
}

/**
 * Service d'audit principal
 */
class AuditService {
  private config: AuditConfig;
  private queue: AuditEvent[] = [];
  private sending = false;

  constructor() {
    this.config = {
      enabled: import.meta.env.VITE_AUDIT_ENABLED !== 'false',
      level: (import.meta.env.VITE_AUDIT_LEVEL as AuditConfig['level']) || 'info',
      persistLocally: true,
      sendToRemote: !!import.meta.env.VITE_AUDIT_ENDPOINT,
      remoteEndpoint: import.meta.env.VITE_AUDIT_ENDPOINT,
      remoteApiKey: import.meta.env.VITE_AUDIT_API_KEY,
      retentionDays: parseInt(import.meta.env.VITE_AUDIT_RETENTION_DAYS || '90'),
      maxLocalEntries: parseInt(import.meta.env.VITE_AUDIT_MAX_ENTRIES || '10000'),
    };
  }

  /**
   * Enregistre un événement d'audit
   */
  async logEvent(eventData: Omit<AuditEvent, 'id' | 'timestamp' | 'ipAddress' | 'userAgent' | 'sessionId'>): Promise<void> {
    if (!this.config.enabled) return;

    const event: AuditEvent = {
      ...eventData,
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
    };

    // Filtrer selon le niveau de log
    if (!this.shouldLog(event)) return;

    try {
      // Persistance locale
      if (this.config.persistLocally) {
        await this.saveLocally(event);
      }

      // Envoi vers serveur distant
      if (this.config.sendToRemote && this.config.remoteEndpoint) {
        this.queue.push(event);
        await this.processQueue();
      }

      // Log console en développement
      if (import.meta.env.DEV) {
        console.log(`[AUDIT] ${event.action}: ${event.details}`, event);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'audit:', error);
    }
  }

  /**
   * Méthodes de raccourci pour les actions courantes
   */
  async logLogin(userId: string, userName: string, success: boolean, details?: string): Promise<void> {
    await this.logEvent({
      userId,
      userName,
      userRole: 'UNKNOWN', // À déterminer depuis le contexte
      action: success ? 'LOGIN' : 'FAILED_LOGIN',
      resource: 'Système',
      details: details || (success ? 'Connexion réussie' : 'Échec de connexion'),
      status: success ? 'success' : 'failure',
      riskLevel: success ? 'low' : 'medium',
    });
  }

  async logDataAccess(userId: string, userName: string, userRole: string, resource: string, resourceId?: string): Promise<void> {
    await this.logEvent({
      userId,
      userName,
      userRole,
      action: 'SENSITIVE_DATA_ACCESS',
      resource,
      resourceId,
      details: `Accès aux données sensibles: ${resource}`,
      status: 'success',
      riskLevel: 'medium',
    });
  }

  async logAIExtraction(userId: string, userName: string, userRole: string, documentType: string, confidence: number): Promise<void> {
    await this.logEvent({
      userId,
      userName,
      userRole,
      action: 'AI_EXTRACTION',
      resource: 'Document IA',
      details: `Extraction IA ${documentType} (confiance: ${Math.round(confidence * 100)}%)`,
      status: confidence > 0.8 ? 'success' : 'warning',
      riskLevel: confidence > 0.9 ? 'low' : 'medium',
      metadata: { documentType, confidence },
    });
  }

  async logSystemConfigChange(userId: string, userName: string, userRole: string, setting: string, oldValue: any, newValue: any): Promise<void> {
    await this.logEvent({
      userId,
      userName,
      userRole,
      action: 'SYSTEM_CONFIG_CHANGE',
      resource: 'Configuration système',
      details: `Modification ${setting}: ${oldValue} → ${newValue}`,
      status: 'success',
      riskLevel: 'high',
      metadata: { setting, oldValue, newValue },
    });
  }

  /**
   * Récupère les logs d'audit avec filtres
   */
  async getLogs(filters?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: AuditAction;
    riskLevel?: RiskLevel;
    limit?: number;
    offset?: number;
  }): Promise<AuditEvent[]> {
    const logs = await this.getLocalLogs();
    
    if (!filters) return logs;

    return logs.filter(log => {
      if (filters.startDate && log.timestamp < filters.startDate) return false;
      if (filters.endDate && log.timestamp > filters.endDate) return false;
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.riskLevel && log.riskLevel !== filters.riskLevel) return false;
      return true;
    }).slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || 100));
  }

  /**
   * Nettoie les anciens logs
   */
  async cleanupOldLogs(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    const cutoffTimestamp = cutoffDate.toISOString();

    const logs = await this.getLocalLogs();
    const filteredLogs = logs.filter(log => log.timestamp >= cutoffTimestamp);
    
    if (filteredLogs.length < logs.length) {
      await this.saveAllLogs(filteredLogs);
      console.log(`Nettoyage audit: ${logs.length - filteredLogs.length} entrées supprimées`);
    }
  }

  /**
   * Exporte les logs au format CSV
   */
  async exportLogs(filters?: Parameters<typeof this.getLogs>[0]): Promise<string> {
    const logs = await this.getLogs(filters);
    
    const headers = ['Horodatage', 'Utilisateur', 'Rôle', 'Action', 'Ressource', 'Détails', 'Statut', 'Niveau de risque'];
    const rows = logs.map(log => [
      log.timestamp,
      log.userName,
      log.userRole,
      log.action,
      log.resource,
      `"${log.details.replace(/"/g, '""')}"`,
      log.status,
      log.riskLevel
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // ========== Méthodes privées ==========

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getClientIP(): Promise<string> {
    try {
      // En production, utiliser un service comme ipify
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('audit_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('audit_session_id', sessionId);
    }
    return sessionId;
  }

  private shouldLog(event: AuditEvent): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const eventLevel = this.getEventLevel(event);
    const configLevel = this.config.level;
    
    return levels.indexOf(eventLevel) >= levels.indexOf(configLevel);
  }

  private getEventLevel(event: AuditEvent): 'debug' | 'info' | 'warn' | 'error' {
    if (event.status === 'failure' || event.riskLevel === 'critical') return 'error';
    if (event.status === 'alert' || event.riskLevel === 'high') return 'warn';
    if (event.riskLevel === 'medium') return 'info';
    return 'debug';
  }

  private async saveLocally(event: AuditEvent): Promise<void> {
    const logs = await this.getLocalLogs();
    logs.push(event);
    
    // Limiter le nombre d'entrées locales
    if (logs.length > this.config.maxLocalEntries) {
      logs.splice(0, logs.length - this.config.maxLocalEntries);
    }
    
    await this.saveAllLogs(logs);
  }

  private async getLocalLogs(): Promise<AuditEvent[]> {
    try {
      const stored = localStorage.getItem('audit_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async saveAllLogs(logs: AuditEvent[]): Promise<void> {
    try {
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Erreur sauvegarde logs audit:', error);
    }
  }

  private async processQueue(): Promise<void> {
    if (this.sending || this.queue.length === 0) return;

    this.sending = true;
    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json' 
      };
      
      // Ajouter la clé API si configurée
      if (this.config.remoteApiKey) {
        headers['X-API-Key'] = this.config.remoteApiKey;
      }
      
      const response = await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers,
        body: JSON.stringify({ events: eventsToSend }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`📊 Audit envoyé: ${result.successful || eventsToSend.length} événements`);
      
    } catch (error) {
      console.error('Erreur envoi logs audit vers serveur:', error);
      // Remettre en queue en cas d'échec
      this.queue.unshift(...eventsToSend);
    } finally {
      this.sending = false;
    }
  }
}

// Instance singleton
export const auditService = new AuditService();

// Hook React pour utiliser le service d'audit
export const useAudit = () => {
  return {
    logEvent: auditService.logEvent.bind(auditService),
    logLogin: auditService.logLogin.bind(auditService),
    logDataAccess: auditService.logDataAccess.bind(auditService),
    logAIExtraction: auditService.logAIExtraction.bind(auditService),
    logSystemConfigChange: auditService.logSystemConfigChange.bind(auditService),
    getLogs: auditService.getLogs.bind(auditService),
    exportLogs: auditService.exportLogs.bind(auditService),
  };
};