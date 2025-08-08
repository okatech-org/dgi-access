import { 
  VisitorRegistrationData, 
  PackageRegistrationData, 
  VisitorReceipt, 
  NotificationData,
  AIExtractionResult 
} from '../types/visitor-process';
import { Employee, Service } from '../types/personnel';

interface DatabaseService {
  visitors: {
    add: (visitor: any) => Promise<void>;
    get: (id: string) => Promise<any>;
    update: (id: string, updates: any) => Promise<void>;
    list: (filters?: any) => Promise<any[]>;
  };
  packages: {
    add: (pkg: any) => Promise<void>;
    get: (id: string) => Promise<any>;
    update: (id: string, updates: any) => Promise<void>;
    list: (filters?: any) => Promise<any[]>;
  };
  employees: {
    get: (id: string) => Promise<Employee>;
    list: () => Promise<Employee[]>;
  };
  services: {
    get: (id: string) => Promise<Service>;
    list: () => Promise<Service[]>;
  };
  badges: {
    list: (available?: boolean) => Promise<any[]>;
    update: (id: string, updates: any) => Promise<void>;
  };
}

// Simulation de la base de données - à remplacer par une vraie DB
const mockDatabase: DatabaseService = {
  visitors: {
    add: async (visitor) => { console.log('Visitor added:', visitor); },
    get: async (id) => ({ id }),
    update: async (id, updates) => { console.log('Visitor updated:', id, updates); },
    list: async () => []
  },
  packages: {
    add: async (pkg) => { console.log('Package added:', pkg); },
    get: async (id) => ({ id }),
    update: async (id, updates) => { console.log('Package updated:', id, updates); },
    list: async () => []
  },
  employees: {
    get: async (id) => ({ 
      id, 
      firstName: 'John', 
      lastName: 'Doe', 
      email: 'john@dgi.gov.ga',
      phone: '077 00 00 00'
    } as Employee),
    list: async () => []
  },
  services: {
    get: async (id) => ({ 
      id, 
      name: 'Service Test', 
      responsable: 'emp1' 
    } as Service),
    list: async () => []
  },
  badges: {
    list: async () => [],
    update: async (id, updates) => { console.log('Badge updated:', id, updates); }
  }
};

export class VisitorPackageService {
  private db: DatabaseService;

  constructor(database?: DatabaseService) {
    this.db = database || mockDatabase;
  }

  // Gestion des visiteurs
  async registerVisitor(data: VisitorRegistrationData): Promise<string> {
    try {
      const visitorId = this.generateId('VIS');
      const registrationNumber = this.generateRegistrationNumber();
      const qrCode = this.generateQRCode(visitorId);
      
      const visitor = {
        id: visitorId,
        ...data,
        metadata: {
          ...data.metadata,
          registrationNumber,
          qrCode,
          registrationTime: new Date(),
          checkInTime: new Date(),
          status: 'active'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Sauvegarder en base
      await this.db.visitors.add(visitor);
      
      // Marquer le badge comme utilisé si applicable
      if (data.badge?.badgeId) {
        await this.db.badges.update(data.badge.badgeId, {
          isAvailable: false,
          currentHolder: visitorId,
          assignedAt: new Date()
        });
      }
      
      // Envoyer les notifications
      if (data.destination?.employeeId) {
        await this.notifyEmployee(data.destination.employeeId, visitor);
      } else if (data.destination?.serviceId) {
        await this.notifyService(data.destination.serviceId, visitor);
      }
      
      // Générer et imprimer le récépissé si demandé
      if (data.metadata?.receiptGenerated) {
        await this.generateAndPrintReceipt(visitor);
      }
      
      return visitorId;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du visiteur:', error);
      throw error;
    }
  }

  async checkOutVisitor(visitorId: string): Promise<void> {
    try {
      const visitor = await this.db.visitors.get(visitorId);
      
      if (!visitor) {
        throw new Error('Visiteur non trouvé');
      }
      
      // Mettre à jour le statut
      await this.db.visitors.update(visitorId, {
        'metadata.status': 'completed',
        'metadata.actualCheckOut': new Date()
      });
      
      // Libérer le badge si applicable
      if (visitor.badge?.badgeId) {
        await this.db.badges.update(visitor.badge.badgeId, {
          isAvailable: true,
          currentHolder: null,
          returnedAt: new Date()
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de la sortie du visiteur:', error);
      throw error;
    }
  }

  // Gestion des colis
  async registerPackage(data: PackageRegistrationData): Promise<string> {
    try {
      const packageId = this.generateId('PKG');
      
      const pkg = {
        id: packageId,
        ...data,
        package: {
          ...data.package,
          barcode: this.generateBarcode(packageId)
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await this.db.packages.add(pkg);
      
      // Envoyer la notification si demandée
      if (data.recipient.notificationSent) {
        await this.sendPackageNotification(pkg);
      }
      
      return packageId;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du colis:', error);
      throw error;
    }
  }

  async deliverPackage(packageId: string, deliveredTo: string, signature?: string): Promise<void> {
    try {
      await this.db.packages.update(packageId, {
        'status.delivered': new Date(),
        'status.deliveredTo': deliveredTo,
        'status.signature': signature,
        'status.status': 'delivered'
      });
    } catch (error) {
      console.error('Erreur lors de la livraison du colis:', error);
      throw error;
    }
  }

  // Extraction IA (simulation)
  async extractDocumentInfo(imageFile: File): Promise<AIExtractionResult> {
    // Simulation de l'extraction IA
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          firstName: 'Jean',
          lastName: 'NGUEMA',
          documentType: 'CNI',
          documentNumber: Math.floor(Math.random() * 1000000000).toString(),
          confidence: 0.95
        });
      }, 2000);
    });
  }

  // Notifications
  private async notifyEmployee(employeeId: string, visitor: any): Promise<void> {
    try {
      const employee = await this.db.employees.get(employeeId);
      
      const notification: NotificationData = {
        type: 'visitor_arrival',
        to: employee.email,
        subject: `Visiteur en attente: ${visitor.identity.firstName} ${visitor.identity.lastName}`,
        body: this.generateVisitorNotificationBody(visitor, employee),
        sms: employee.phone
      };
      
      await this.sendNotification(notification);
    } catch (error) {
      console.error('Erreur lors de la notification employé:', error);
    }
  }

  private async notifyService(serviceId: string, visitor: any): Promise<void> {
    try {
      const service = await this.db.services.get(serviceId);
      const responsable = await this.db.employees.get(service.responsable);
      
      const notification: NotificationData = {
        type: 'visitor_arrival',
        to: responsable.email,
        subject: `Visiteur pour le service ${service.name}`,
        body: this.generateServiceNotificationBody(visitor, service),
        sms: responsable.phone
      };
      
      await this.sendNotification(notification);
    } catch (error) {
      console.error('Erreur lors de la notification service:', error);
    }
  }

  private async sendPackageNotification(pkg: any): Promise<void> {
    try {
      let recipient: Employee;
      let notificationBody: string;
      
      if (pkg.recipient.type === 'employee' && pkg.recipient.employeeId) {
        recipient = await this.db.employees.get(pkg.recipient.employeeId);
        notificationBody = this.generatePackageEmployeeNotificationBody(pkg, recipient);
      } else if (pkg.recipient.type === 'service' && pkg.recipient.serviceId) {
        const service = await this.db.services.get(pkg.recipient.serviceId);
        recipient = await this.db.employees.get(service.responsable);
        notificationBody = this.generatePackageServiceNotificationBody(pkg, service);
      } else {
        return;
      }
      
      const notification: NotificationData = {
        type: 'package_arrival',
        to: recipient.email,
        subject: `Nouveau colis reçu`,
        body: notificationBody,
        sms: recipient.phone
      };
      
      await this.sendNotification(notification);
    } catch (error) {
      console.error('Erreur lors de la notification colis:', error);
    }
  }

  private async sendNotification(notification: NotificationData): Promise<void> {
    // Simulation de l'envoi de notification
    console.log('Notification envoyée:', notification);
    
    // Ici, on intégrerait avec un service d'email/SMS réel
    // Par exemple: SendGrid, AWS SES, Twilio, etc.
  }

  // Génération de documents
  private async generateAndPrintReceipt(visitor: any): Promise<string> {
    const receipt = this.generateReceipt(visitor);
    
    // Ici, on intégrerait avec une imprimante ou un service d'impression
    console.log('Récépissé généré:', receipt);
    
    return receipt;
  }

  private generateReceipt(visitor: any): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR');
    const timeStr = now.toLocaleTimeString('fr-FR');
    
    return `
RÉCÉPISSÉ DE VISITE - DIRECTION GÉNÉRALE DES IMPÔTS
================================================

N° d'enregistrement: ${visitor.metadata.registrationNumber}
Date et heure: ${dateStr} à ${timeStr}

INFORMATIONS VISITEUR
--------------------
Nom: ${visitor.identity.firstName} ${visitor.identity.lastName}
${visitor.identity.company ? `Société: ${visitor.identity.company}` : ''}
Pièce d'identité: ${visitor.identity.idType} N°${visitor.identity.idNumber}
Téléphone: ${visitor.identity.phone}
${visitor.identity.email ? `Email: ${visitor.identity.email}` : ''}

DÉTAILS DE LA VISITE
-------------------
Motif: ${visitor.visitType.description}
Destination: ${this.getDestinationText(visitor)}
${visitor.badge?.badgeNumber ? `Badge attribué: N° ${visitor.badge.badgeNumber}` : 'Visite sans badge'}
Durée prévue: ${visitor.visitType.expectedDuration}
${visitor.visitType.isUrgent ? 'VISITE URGENTE - PRIORITÉ ÉLEVÉE' : ''}

CONSIGNES DE SÉCURITÉ
--------------------
${visitor.badge?.required ? 
  `• Porter le badge de manière visible en permanence
• Respecter les zones d'accès autorisées  
• Être accompagné dans les zones sécurisées
• Restituer le badge à la sortie obligatoirement` :
  `• Rester dans la zone d'accueil uniquement
• Être accompagné pour tout déplacement
• Durée limitée à 30 minutes maximum
• Signaler son départ à la réception`}

CONTRÔLE D'ACCÈS
---------------
QR Code: ${visitor.metadata.qrCode}

Signature réceptionniste: ________________________

Direction Générale des Impôts - République Gabonaise
Sécurité et contrôle d'accès
    `.trim();
  }

  // Utilitaires
  private generateId(prefix: string): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  private generateRegistrationNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const time = now.toTimeString().slice(0, 5).replace(':', '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `VIS${year}${month}${day}${time}${random}`;
  }

  private generateQRCode(visitorId: string): string {
    return `https://dgi.gov.ga/visitor/check/${visitorId}`;
  }

  private generateBarcode(packageId: string): string {
    return `DGI${packageId.replace(/[^0-9]/g, '')}`;
  }

  private generateVisitorNotificationBody(visitor: any, employee: Employee): string {
    return `
Bonjour ${employee.firstName},

Un visiteur vous attend à l'accueil de la DGI.

INFORMATIONS DU VISITEUR:
- Nom: ${visitor.identity.firstName} ${visitor.identity.lastName}
- Société: ${visitor.identity.company || 'Particulier'}
- Téléphone: ${visitor.identity.phone}
- Motif de visite: ${visitor.visitType.description}
- Badge: ${visitor.badge?.badgeNumber ? `N° ${visitor.badge.badgeNumber}` : 'Sans badge'}
- Heure d'arrivée: ${new Date().toLocaleTimeString('fr-FR')}

${visitor.visitType.isUrgent ? 'VISITE URGENTE - Merci de vous rendre rapidement à l\'accueil.' : 'Merci de vous rendre à l\'accueil dès que possible.'}

Direction Générale des Impôts
Service de Réception
    `.trim();
  }

  private generateServiceNotificationBody(visitor: any, service: Service): string {
    return `
Bonjour,

Un visiteur se présente pour le service ${service.name}.

INFORMATIONS DU VISITEUR:
- Nom: ${visitor.identity.firstName} ${visitor.identity.lastName}
- Société: ${visitor.identity.company || 'Particulier'}
- Téléphone: ${visitor.identity.phone}
- Motif de visite: ${visitor.visitType.description}
- Heure d'arrivée: ${new Date().toLocaleTimeString('fr-FR')}

Merci de prendre les dispositions nécessaires pour l'accueillir.

Direction Générale des Impôts
Service de Réception
    `.trim();
  }

  private generatePackageEmployeeNotificationBody(pkg: any, employee: Employee): string {
    return `
Bonjour ${employee.firstName},

Un colis est arrivé pour vous à la réception de la DGI.

INFORMATIONS DU COLIS:
- Type: ${this.getPackageTypeLabel(pkg.package.type)}
- Expéditeur: ${pkg.sender.name}
- Transporteur: ${pkg.package.carrier}
- N° de suivi: ${pkg.package.trackingNumber || 'Non renseigné'}
- Heure de réception: ${new Date().toLocaleTimeString('fr-FR')}
${pkg.package.urgent ? '- COLIS URGENT' : ''}
${pkg.package.fragile ? '- COLIS FRAGILE' : ''}

Merci de venir le récupérer à la réception dès que possible.

Direction Générale des Impôts
Service de Réception
    `.trim();
  }

  private generatePackageServiceNotificationBody(pkg: any, service: Service): string {
    return `
Bonjour,

Un colis est arrivé pour le service ${service.name}.

INFORMATIONS DU COLIS:
- Type: ${this.getPackageTypeLabel(pkg.package.type)}
- Expéditeur: ${pkg.sender.name}
- Transporteur: ${pkg.package.carrier}
- N° de suivi: ${pkg.package.trackingNumber || 'Non renseigné'}
- Heure de réception: ${new Date().toLocaleTimeString('fr-FR')}

Merci de désigner une personne pour venir le récupérer à la réception.

Direction Générale des Impôts
Service de Réception
    `.trim();
  }

  private getDestinationText(visitor: any): string {
    if (visitor.destination?.employee) {
      return `${visitor.destination.employee.firstName} ${visitor.destination.employee.lastName} - ${visitor.destination.employee.service.name}`;
    } else if (visitor.destination?.service) {
      return visitor.destination.service.name;
    }
    return 'Non défini';
  }

  private getPackageTypeLabel(type: string): string {
    const typeLabels: { [key: string]: string } = {
      'document': 'Document',
      'colis': 'Colis',
      'courrier': 'Courrier',
      'recommande': 'Recommandé'
    };
    return typeLabels[type] || type;
  }

  // Méthodes de requête
  async getVisitorsByDate(date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.db.visitors.list({
      'metadata.checkInTime': {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
  }

  async getActiveVisitors(): Promise<any[]> {
    return this.db.visitors.list({
      'metadata.status': 'active'
    });
  }

  async getPackagesByStatus(status: string): Promise<any[]> {
    return this.db.packages.list({
      'status.status': status
    });
  }

  async getAvailableBadges(): Promise<any[]> {
    return this.db.badges.list(true);
  }
}

// Instance singleton
export const visitorPackageService = new VisitorPackageService();
