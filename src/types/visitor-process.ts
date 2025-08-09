/**
 * Types pour le processus d'enregistrement des visiteurs et colis
 */

// Types de base
export type VisitorStep = 'identity' | 'badge' | 'visit-type' | 'destination' | 'confirmation';
export type RegistrationMethod = 'manual' | 'ai-scan';
export type IdType = 'CNI' | 'Passeport' | 'Permis';
export type VisitPurpose = 'reunion' | 'livraison' | 'prestation' | 'personnel' | 'autre';
export type DestinationType = 'employee' | 'service' | 'both';
export type VisitorStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type PackageType = 'document' | 'colis' | 'courrier' | 'recommande';

// Interface principale du processus visiteur
export interface VisitorRegistrationProcess {
  step: VisitorStep;
  data: VisitorRegistrationData;
  isComplete: boolean;
  validationErrors: string[];
}

// Données d'enregistrement visiteur
export interface VisitorRegistrationData {
  // Étape 1: Identité
  identity: {
    method: RegistrationMethod;
    firstName: string;
    lastName: string;
    idType: IdType;
    idNumber: string;
    phone: string;
    email?: string;
    company?: string;
    photo?: string;
    idScanUrl?: string;
    nationality?: string;
    address?: string;
  };
  
  // Étape 2: Badge
  badge: {
    required: boolean;
    badgeId?: string;
    badgeNumber?: string;
    accessZones: string[];
    specialAccess?: string[];
    returnTime?: Date;
  };
  
  // Étape 3: Type de visite
  visitType: {
    hasAppointment: boolean;
    appointmentId?: string;
    purpose: VisitPurpose;
    description: string;
    expectedDuration: string;
    urgency: 'normal' | 'urgent' | 'high';
    accompaniedBy?: string[]; // Accompagnants
  };
  
  // Étape 4: Destination
  destination: {
    type: DestinationType;
    employeeId?: string;
    employeeName?: string;
    serviceId?: string;
    serviceName?: string;
    specificLocation?: string; // Bureau, salle de réunion, etc.
    floor?: string;
    building?: string;
    meetingRoom?: string;
  };
  
  // Métadonnées
  metadata: {
    registeredBy: string;
    registrationTime: Date;
    checkInTime: Date;
    expectedCheckOut?: Date;
    actualCheckOut?: Date;
    status: VisitorStatus;
    registrationNumber: string;
    qrCode?: string;
    notes?: string;
    securityLevel: 'standard' | 'elevated' | 'high';
  };
}

// Interface pour les colis
export interface PackageRegistrationData {
  // Informations du colis
  package: {
    trackingNumber: string;
    carrier: string;
    type: PackageType;
    weight?: number;
    dimensions?: string;
    fragile: boolean;
    urgent: boolean;
    confidential: boolean;
    photo?: string;
    barcode?: string;
    description?: string;
    value?: number;
    insurance?: boolean;
  };
  
  // Destinataire
  recipient: {
    type: DestinationType;
    employeeId?: string;
    employeeName?: string;
    serviceId?: string;
    serviceName?: string;
    floor?: string;
    office?: string;
    notificationSent: boolean;
    notificationMethod: 'email' | 'sms' | 'both';
    deliveryInstructions?: string;
  };
  
  // Expéditeur
  sender: {
    name: string;
    company?: string;
    address?: string;
    phone?: string;
    email?: string;
    country?: string;
  };
  
  // Statut
  status: {
    received: Date;
    receivedBy: string;
    delivered?: Date;
    deliveredTo?: string;
    signature?: string;
    signatureUrl?: string;
    attempts: number;
    notes?: string;
    location: string; // Où est stocké le colis
  };
  
  // Métadonnées
  metadata: {
    id: string;
    registrationNumber: string;
    storageLocation: string;
    expiryDate?: Date; // Si le colis n'est pas récupéré
    securityChecked: boolean;
    requiresId: boolean;
  };
}

// Rendez-vous
export interface Appointment {
  id: string;
  visitorName: string;
  visitorCompany?: string;
  visitorPhone: string;
  visitorEmail?: string;
  employeeId: string;
  employeeName: string;
  serviceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  subject: string;
  description?: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  meetingType: 'office' | 'meeting-room' | 'external';
  requiresBadge: boolean;
  securityLevel: 'standard' | 'elevated' | 'high';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  notifications: {
    sent: boolean;
    method: 'email' | 'sms' | 'both';
    sentAt?: Date;
  };
}

// Badge disponible
export interface AvailableBadge {
  id: string;
  number: string;
  type: 'visitor' | 'contractor' | 'vip' | 'escort';
  zones: string[];
  isActive: boolean;
  lastUsedBy?: string;
  lastUsedAt?: Date;
  batteryLevel?: number;
  needsMaintenance: boolean;
}

// Zone d'accès
export interface AccessZone {
  id: string;
  name: string;
  level: number; // 0 = public, 1 = restricted, 2 = confidential
  description: string;
  requiresEscort: boolean;
  workingHours?: {
    start: string;
    end: string;
    days: string[];
  };
}

// Notification
export interface NotificationData {
  id: string;
  type: 'visitor_arrival' | 'package_arrival' | 'appointment_reminder' | 'security_alert';
  to: string; // Email ou téléphone
  method: 'email' | 'sms' | 'both';
  subject: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled?: Date;
  sent: boolean;
  sentAt?: Date;
  deliveryStatus?: 'pending' | 'delivered' | 'failed';
  retryCount: number;
}

// Récépissé
export interface Receipt {
  id: string;
  type: 'visitor' | 'package';
  referenceNumber: string;
  issuedAt: Date;
  issuedBy: string;
  content: string;
  qrCode?: string;
  barcode?: string;
  printed: boolean;
  printedAt?: Date;
}

// Statistiques
export interface VisitorStats {
  totalVisitors: number;
  activeVisitors: number;
  completedVisits: number;
  averageVisitDuration: number;
  badgesInUse: number;
  availableBadges: number;
  pendingNotifications: number;
  securityAlerts: number;
}

export interface PackageStats {
  totalPackages: number;
  pendingDelivery: number;
  deliveredToday: number;
  urgentPackages: number;
  expiringSoon: number;
  averageDeliveryTime: number;
}

// Validation des données
export interface ValidationRule {
  field: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  errorMessage: string;
}

// Configuration du workflow
export interface WorkflowConfig {
  steps: VisitorStep[];
  requiredFields: Record<VisitorStep, string[]>;
  validationRules: Record<string, ValidationRule>;
  autoAdvance: boolean;
  saveOnEachStep: boolean;
  allowBacktrack: boolean;
}

// Audit trail
export interface AuditEntry {
  id: string;
  entityType: 'visitor' | 'package' | 'badge' | 'appointment';
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'printed';
  performedBy: string;
  performedAt: Date;
  changes?: Record<string, { from: any; to: any }>;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

// Export des types
export type {
  VisitorRegistrationProcess,
  VisitorRegistrationData,
  PackageRegistrationData,
  Appointment,
  AvailableBadge,
  AccessZone,
  NotificationData,
  Receipt,
  VisitorStats,
  PackageStats,
  ValidationRule,
  WorkflowConfig,
  AuditEntry
};
