/**
 * Service de gestion des visiteurs et colis - DGI Access
 */

import { 
  VisitorRegistrationData, 
  PackageRegistrationData, 
  Appointment,
  AvailableBadge,
  NotificationData,
  Receipt,
  VisitorStats,
  PackageStats,
  AuditEntry
} from '../types/visitor-process';
import { Employee, Service } from '../types/personnel';
import { db } from './database';

// Générateur d'IDs uniques
const generateId = (prefix: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

// Générateur de numéros d'enregistrement
const generateRegistrationNumber = (type: 'visitor' | 'package'): string => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const sequence = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `DGI-${type.toUpperCase()}-${year}${month}${day}-${sequence}`;
};

export class VisitorPackageService {
  
  // ===== GESTION DES VISITEURS =====
  
  /**
   * Enregistrer un nouveau visiteur
   */
  async registerVisitor(data: VisitorRegistrationData): Promise<{
    visitorId: string;
    registrationNumber: string;
    receipt: Receipt;
    badge?: AvailableBadge;
  }> {
    try {
      const visitorId = generateId('VIS');
      const registrationNumber = generateRegistrationNumber('visitor');
      
      // Préparer les données complètes
      const visitor = {
        id: visitorId,
        ...data,
        metadata: {
          ...data.metadata,
          registrationNumber,
          qrCode: this.generateQRCode(visitorId),
          registrationTime: new Date(),
          checkInTime: new Date(),
        }
      };
      
      // Assigner un badge si requis
      let assignedBadge: AvailableBadge | undefined;
      if (data.badge.required) {
        assignedBadge = await this.assignBadge(data.badge.accessZones);
        if (assignedBadge) {
          visitor.badge.badgeId = assignedBadge.id;
          visitor.badge.badgeNumber = assignedBadge.number;
        }
      }
      
      // Sauvegarder en base
      await this.saveVisitor(visitor);
      
      // Générer le récépissé
      const receipt = this.generateVisitorReceipt(visitor);
      await this.saveReceipt(receipt);
      
      // Envoyer les notifications
      await this.sendVisitorNotifications(visitor);
      
      // Audit trail
      await this.createAuditEntry({
        id: generateId('AUD'),
        entityType: 'visitor',
        entityId: visitorId,
        action: 'created',
        performedBy: data.metadata.registeredBy,
        performedAt: new Date(),
        notes: `Visiteur enregistré: ${data.identity.firstName} ${data.identity.lastName}`
      });
      
      return {
        visitorId,
        registrationNumber,
        receipt,
        badge: assignedBadge
      };
      
    } catch (error) {
      console.error('Erreur enregistrement visiteur:', error);
      throw new Error('Impossible d\'enregistrer le visiteur');
    }
  }
  
  /**
   * Enregistrer la sortie d'un visiteur
   */
  async checkOutVisitor(visitorId: string, performedBy: string): Promise<void> {
    try {
      const visitor = await this.getVisitor(visitorId);
      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }
      
      // Mettre à jour le statut
      visitor.metadata.status = 'completed';
      visitor.metadata.actualCheckOut = new Date();
      
      // Libérer le badge
      if (visitor.badge.badgeId) {
        await this.releaseBadge(visitor.badge.badgeId);
      }
      
      // Sauvegarder
      await this.saveVisitor(visitor);
      
      // Audit
      await this.createAuditEntry({
        id: generateId('AUD'),
        entityType: 'visitor',
        entityId: visitorId,
        action: 'updated',
        performedBy,
        performedAt: new Date(),
        notes: 'Sortie enregistrée'
      });
      
    } catch (error) {
      console.error('Erreur checkout visiteur:', error);
      throw error;
    }
  }
  
  // ===== GESTION DES COLIS =====
  
  /**
   * Enregistrer un nouveau colis
   */
  async registerPackage(data: PackageRegistrationData): Promise<{
    packageId: string;
    registrationNumber: string;
    receipt: Receipt;
  }> {
    try {
      const packageId = generateId('PKG');
      const registrationNumber = generateRegistrationNumber('package');
      
      // Préparer les données complètes
      const pkg = {
        id: packageId,
        ...data,
        metadata: {
          id: packageId,
          registrationNumber,
          storageLocation: this.assignStorageLocation(data.package.type),
          securityChecked: true,
          requiresId: data.package.confidential || data.package.type === 'recommande'
        },
        package: {
          ...data.package,
          barcode: this.generateBarcode(packageId)
        },
        status: {
          ...data.status,
          received: new Date(),
          attempts: 0,
          location: this.assignStorageLocation(data.package.type)
        }
      };
      
      // Sauvegarder
      await this.savePackage(pkg);
      
      // Générer le récépissé
      const receipt = this.generatePackageReceipt(pkg);
      await this.saveReceipt(receipt);
      
      // Envoyer les notifications
      if (data.recipient.notificationSent) {
        await this.sendPackageNotifications(pkg);
      }
      
      // Audit
      await this.createAuditEntry({
        id: generateId('AUD'),
        entityType: 'package',
        entityId: packageId,
        action: 'created',
        performedBy: data.status.receivedBy,
        performedAt: new Date(),
        notes: `Colis enregistré: ${data.package.trackingNumber}`
      });
      
      return {
        packageId,
        registrationNumber,
        receipt
      };
      
    } catch (error) {
      console.error('Erreur enregistrement colis:', error);
      throw new Error('Impossible d\'enregistrer le colis');
    }
  }
  
  /**
   * Marquer un colis comme livré
   */
  async deliverPackage(packageId: string, deliveredTo: string, signature: string, performedBy: string): Promise<void> {
    try {
      const pkg = await this.getPackage(packageId);
      if (!pkg) {
        throw new Error('Colis non trouvé');
      }
      
      // Mettre à jour le statut
      pkg.status.delivered = new Date();
      pkg.status.deliveredTo = deliveredTo;
      pkg.status.signature = signature;
      
      // Sauvegarder
      await this.savePackage(pkg);
      
      // Audit
      await this.createAuditEntry({
        id: generateId('AUD'),
        entityType: 'package',
        entityId: packageId,
        action: 'updated',
        performedBy,
        performedAt: new Date(),
        notes: `Colis livré à: ${deliveredTo}`
      });
      
    } catch (error) {
      console.error('Erreur livraison colis:', error);
      throw error;
    }
  }
  
  // ===== GESTION DES BADGES =====
  
  /**
   * Assigner un badge disponible
   */
  private async assignBadge(accessZones: string[]): Promise<AvailableBadge | null> {
    try {
      const availableBadges = await this.getAvailableBadges();
      
      // Trouver un badge compatible avec les zones d'accès
      const compatibleBadge = availableBadges.find(badge => 
        badge.isActive && 
        !badge.needsMaintenance &&
        accessZones.every(zone => badge.zones.includes(zone))
      );
      
      if (compatibleBadge) {
        // Marquer comme utilisé
        compatibleBadge.isActive = false;
        compatibleBadge.lastUsedAt = new Date();
        await this.saveBadge(compatibleBadge);
        
        return compatibleBadge;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur assignation badge:', error);
      return null;
    }
  }
  
  /**
   * Libérer un badge
   */
  private async releaseBadge(badgeId: string): Promise<void> {
    try {
      const badge = await this.getBadge(badgeId);
      if (badge) {
        badge.isActive = true;
        badge.lastUsedBy = undefined;
        await this.saveBadge(badge);
      }
    } catch (error) {
      console.error('Erreur libération badge:', error);
    }
  }
  
  // ===== NOTIFICATIONS =====
  
  /**
   * Envoyer les notifications pour un visiteur
   */
  private async sendVisitorNotifications(visitor: any): Promise<void> {
    try {
      if (visitor.destination.employeeId) {
        await this.notifyEmployee(visitor.destination.employeeId, visitor, 'visitor_arrival');
      }
      
      if (visitor.destination.serviceId) {
        await this.notifyService(visitor.destination.serviceId, visitor, 'visitor_arrival');
      }
    } catch (error) {
      console.error('Erreur notifications visiteur:', error);
    }
  }
  
  /**
   * Envoyer les notifications pour un colis
   */
  private async sendPackageNotifications(pkg: any): Promise<void> {
    try {
      if (pkg.recipient.employeeId) {
        await this.notifyEmployee(pkg.recipient.employeeId, pkg, 'package_arrival');
      }
      
      if (pkg.recipient.serviceId) {
        await this.notifyService(pkg.recipient.serviceId, pkg, 'package_arrival');
      }
    } catch (error) {
      console.error('Erreur notifications colis:', error);
    }
  }
  
  /**
   * Notifier un employé
   */
  private async notifyEmployee(employeeId: string, data: any, type: string): Promise<void> {
    try {
      const employee = await db.getEmployeeById(employeeId);
      if (!employee) return;
      
      const notification: NotificationData = {
        id: generateId('NOT'),
        type: type as any,
        to: employee.email,
        method: 'email',
        subject: this.getNotificationSubject(type, data),
        body: this.getNotificationBody(type, data, employee),
        priority: data.urgency === 'urgent' ? 'urgent' : 'normal',
        sent: false,
        retryCount: 0
      };
      
      await this.sendNotification(notification);
    } catch (error) {
      console.error('Erreur notification employé:', error);
    }
  }
  
  /**
   * Notifier un service
   */
  private async notifyService(serviceId: string, data: any, type: string): Promise<void> {
    try {
      const service = await db.getServiceById(serviceId);
      if (!service) return;
      
      // Notifier le responsable du service
      const employees = await db.getEmployeesByService(serviceId);
      const responsable = employees.find(emp => 
        emp.position.toLowerCase().includes('responsable') ||
        emp.position.toLowerCase().includes('chef') ||
        emp.position.toLowerCase().includes('directeur')
      );
      
      if (responsable) {
        await this.notifyEmployee(responsable.id, data, type);
      }
    } catch (error) {
      console.error('Erreur notification service:', error);
    }
  }
  
  // ===== GÉNÉRATION DE DOCUMENTS =====
  
  /**
   * Générer un récépissé visiteur
   */
  private generateVisitorReceipt(visitor: any): Receipt {
    const content = `
╔══════════════════════════════════════════════════╗
║              RÉCÉPISSÉ DE VISITE DGI             ║
╠══════════════════════════════════════════════════╣
║ N° ${visitor.metadata.registrationNumber}                           ║
║ Date: ${new Date().toLocaleString('fr-FR')}            ║
╠══════════════════════════════════════════════════╣
║                    VISITEUR                      ║
╠══════════════════════════════════════════════════╣
║ Nom: ${visitor.identity.firstName} ${visitor.identity.lastName}                   ║
║ Société: ${visitor.identity.company || 'N/A'}                        ║
║ Pièce: ${visitor.identity.idType} N°${visitor.identity.idNumber}      ║
║ Téléphone: ${visitor.identity.phone}                  ║
╠══════════════════════════════════════════════════╣
║                     VISITE                       ║
╠══════════════════════════════════════════════════╣
║ Motif: ${visitor.visitType.description}              ║
║ Destination: ${visitor.destination.type === 'employee' 
  ? `${visitor.destination.employeeName}`
  : `Service ${visitor.destination.serviceName}`}        ║
║ Badge: ${visitor.badge.badgeNumber || 'Sans badge'}              ║
║ Durée prévue: ${visitor.visitType.expectedDuration}      ║
║ Zones autorisées: ${visitor.badge.accessZones?.join(', ') || 'N/A'} ║
╠══════════════════════════════════════════════════╣
║               CONSIGNES DE SÉCURITÉ              ║
╠══════════════════════════════════════════════════╣
║ • Porter le badge de manière visible             ║
║ • Rester dans les zones autorisées               ║
║ • Être accompagné dans les zones sécurisées      ║
║ • Restituer le badge à la sortie                 ║
║ • Respecter les règles de confidentialité        ║
╠══════════════════════════════════════════════════╣
║ Signature réceptionniste: ________________       ║
║                                                  ║
║ ${visitor.metadata.qrCode ? 'QR Code: [Generated]' : ''}                              ║
╚══════════════════════════════════════════════════╝
    `;
    
    return {
      id: generateId('REC'),
      type: 'visitor',
      referenceNumber: visitor.metadata.registrationNumber,
      issuedAt: new Date(),
      issuedBy: visitor.metadata.registeredBy,
      content: content.trim(),
      qrCode: visitor.metadata.qrCode,
      printed: false
    };
  }
  
  /**
   * Générer un récépissé colis
   */
  private generatePackageReceipt(pkg: any): Receipt {
    const content = `
╔══════════════════════════════════════════════════╗
║           RÉCÉPISSÉ DE COLIS/COURRIER DGI        ║
╠══════════════════════════════════════════════════╣
║ N° ${pkg.metadata.registrationNumber}                           ║
║ Date: ${new Date().toLocaleString('fr-FR')}            ║
╠══════════════════════════════════════════════════╣
║                     COLIS                        ║
╠══════════════════════════════════════════════════╣
║ Suivi: ${pkg.package.trackingNumber}                      ║
║ Transporteur: ${pkg.package.carrier}                   ║
║ Type: ${pkg.package.type}                           ║
║ Poids: ${pkg.package.weight || 'N/A'} kg                       ║
║ ${pkg.package.fragile ? '⚠️  FRAGILE' : ''}                            ║
║ ${pkg.package.urgent ? '🚨 URGENT' : ''}                             ║
║ ${pkg.package.confidential ? '🔒 CONFIDENTIEL' : ''}                     ║
╠══════════════════════════════════════════════════╣
║                  DESTINATAIRE                    ║
╠══════════════════════════════════════════════════╣
║ ${pkg.recipient.type === 'employee' 
  ? `Employé: ${pkg.recipient.employeeName}`
  : `Service: ${pkg.recipient.serviceName}`}                 ║
║ Bureau: ${pkg.recipient.office || 'N/A'}                          ║
║ Étage: ${pkg.recipient.floor || 'N/A'}                           ║
║ Instructions: ${pkg.recipient.deliveryInstructions || 'Aucune'}        ║
╠══════════════════════════════════════════════════╣
║                   EXPÉDITEUR                     ║
╠══════════════════════════════════════════════════╣
║ Nom: ${pkg.sender.name}                           ║
║ Société: ${pkg.sender.company || 'N/A'}                     ║
║ Téléphone: ${pkg.sender.phone || 'N/A'}                   ║
╠══════════════════════════════════════════════════╣
║                    STOCKAGE                      ║
╠══════════════════════════════════════════════════╣
║ Emplacement: ${pkg.status.location}                ║
║ Reçu par: ${pkg.status.receivedBy}                   ║
║ ${pkg.metadata.requiresId ? '⚠️  Pièce d\'identité requise' : ''}         ║
║ ${pkg.metadata.expiryDate ? `📅 À récupérer avant: ${pkg.metadata.expiryDate.toLocaleDateString('fr-FR')}` : ''} ║
╠══════════════════════════════════════════════════╣
║ Signature destinataire: ________________          ║
║                                                  ║
║ Code-barres: ${pkg.package.barcode}                     ║
╚══════════════════════════════════════════════════╝
    `;
    
    return {
      id: generateId('REC'),
      type: 'package',
      referenceNumber: pkg.metadata.registrationNumber,
      issuedAt: new Date(),
      issuedBy: pkg.status.receivedBy,
      content: content.trim(),
      barcode: pkg.package.barcode,
      printed: false
    };
  }
  
  // ===== UTILITAIRES =====
  
  /**
   * Générer un QR Code
   */
  private generateQRCode(visitorId: string): string {
    return `DGI-VISITOR-${visitorId}-${Date.now()}`;
  }
  
  /**
   * Générer un code-barres
   */
  private generateBarcode(packageId: string): string {
    return `DGI${packageId.replace(/-/g, '')}${Date.now().toString().substr(-6)}`;
  }
  
  /**
   * Assigner un emplacement de stockage
   */
  private assignStorageLocation(packageType: string): string {
    const locations = {
      'document': 'Documents - Casier A',
      'courrier': 'Courrier - Casier B',
      'colis': 'Colis - Étagère C',
      'recommande': 'Sécurisé - Coffre D'
    };
    
    return locations[packageType as keyof typeof locations] || 'Divers - Étagère E';
  }
  
  /**
   * Obtenir le sujet de notification
   */
  private getNotificationSubject(type: string, data: any): string {
    switch (type) {
      case 'visitor_arrival':
        return `Visiteur en attente: ${data.identity.firstName} ${data.identity.lastName}`;
      case 'package_arrival':
        return `Nouveau colis reçu: ${data.package.trackingNumber}`;
      default:
        return 'Notification DGI Access';
    }
  }
  
  /**
   * Obtenir le corps de notification
   */
  private getNotificationBody(type: string, data: any, employee: Employee): string {
    switch (type) {
      case 'visitor_arrival':
        return `
Bonjour ${employee.firstName},

Un visiteur vous attend à l'accueil.

Informations du visiteur:
- Nom: ${data.identity.firstName} ${data.identity.lastName}
- Société: ${data.identity.company || 'Non renseigné'}
- Téléphone: ${data.identity.phone}
- Motif: ${data.visitType.description}
- Badge: ${data.badge.badgeNumber || 'Sans badge'}
- Durée prévue: ${data.visitType.expectedDuration}

Merci de vous rendre à l'accueil pour accueillir votre visiteur.

Direction Générale des Impôts
Système DGI Access
        `;
      
      case 'package_arrival':
        return `
Bonjour ${employee.firstName},

Un colis/courrier vous est arrivé.

Informations du colis:
- N° de suivi: ${data.package.trackingNumber}
- Transporteur: ${data.package.carrier}
- Type: ${data.package.type}
- Expéditeur: ${data.sender.name}
- ${data.package.urgent ? 'URGENT' : ''}
- ${data.package.fragile ? 'FRAGILE' : ''}

Le colis est disponible à l'accueil.
Emplacement: ${data.status.location}

Direction Générale des Impôts
Système DGI Access
        `;
      
      default:
        return 'Notification depuis le système DGI Access.';
    }
  }
  
  // ===== MÉTHODES DE BASE DE DONNÉES =====
  
  private async saveVisitor(visitor: any): Promise<void> {
    localStorage.setItem(`visitor_${visitor.id}`, JSON.stringify(visitor));
  }
  
  private async getVisitor(visitorId: string): Promise<any> {
    const data = localStorage.getItem(`visitor_${visitorId}`);
    return data ? JSON.parse(data) : null;
  }
  
  private async savePackage(pkg: any): Promise<void> {
    localStorage.setItem(`package_${pkg.id}`, JSON.stringify(pkg));
  }
  
  private async getPackage(packageId: string): Promise<any> {
    const data = localStorage.getItem(`package_${packageId}`);
    return data ? JSON.parse(data) : null;
  }
  
  private async saveBadge(badge: AvailableBadge): Promise<void> {
    localStorage.setItem(`badge_${badge.id}`, JSON.stringify(badge));
  }
  
  private async getBadge(badgeId: string): Promise<AvailableBadge | null> {
    const data = localStorage.getItem(`badge_${badgeId}`);
    return data ? JSON.parse(data) : null;
  }
  
  private async getAvailableBadges(): Promise<AvailableBadge[]> {
    // Simulation de badges disponibles
    return [
      { id: 'B001', number: '001', type: 'visitor', zones: ['Accueil', 'RDC'], isActive: true, needsMaintenance: false },
      { id: 'B002', number: '002', type: 'visitor', zones: ['Accueil', 'RDC', '1er'], isActive: true, needsMaintenance: false },
      { id: 'B003', number: '003', type: 'vip', zones: ['Accueil', 'RDC', '1er', 'Direction'], isActive: true, needsMaintenance: false }
    ];
  }
  
  private async saveReceipt(receipt: Receipt): Promise<void> {
    localStorage.setItem(`receipt_${receipt.id}`, JSON.stringify(receipt));
  }
  
  private async sendNotification(notification: NotificationData): Promise<void> {
    // Simulation d'envoi de notification
    console.log('Notification envoyée:', notification);
    notification.sent = true;
    notification.sentAt = new Date();
  }
  
  private async createAuditEntry(entry: AuditEntry): Promise<void> {
    localStorage.setItem(`audit_${entry.id}`, JSON.stringify(entry));
  }
  
  // ===== STATISTIQUES =====
  
  async getVisitorStats(): Promise<VisitorStats> {
    // Simulation de statistiques
    return {
      totalVisitors: 45,
      activeVisitors: 8,
      completedVisits: 37,
      averageVisitDuration: 95, // minutes
      badgesInUse: 8,
      availableBadges: 25,
      pendingNotifications: 2,
      securityAlerts: 0
    };
  }
  
  async getPackageStats(): Promise<PackageStats> {
    // Simulation de statistiques
    return {
      totalPackages: 23,
      pendingDelivery: 5,
      deliveredToday: 18,
      urgentPackages: 2,
      expiringSoon: 1,
      averageDeliveryTime: 2.5 // heures
    };
  }
}

// Instance singleton
export const visitorPackageService = new VisitorPackageService();
