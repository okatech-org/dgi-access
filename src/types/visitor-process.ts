import { IdType } from './visitor';
import { Employee, Service } from './personnel';
import { Appointment } from './appointment';

export type RegistrationMethod = 'manual' | 'ai-scan';
export type VisitPurpose = 'reunion' | 'livraison' | 'prestation' | 'personnel' | 'autre';
export type DestinationType = 'employee' | 'service' | 'both';
export type VisitorStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type ProcessStep = 'identity' | 'badge' | 'visit-type' | 'destination' | 'confirmation';

export interface VisitorRegistrationProcess {
  step: ProcessStep;
  data: VisitorRegistrationData;
  currentStepIndex: number;
  totalSteps: number;
}

export interface VisitorIdentity {
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
  extractedData?: AIExtractionResult;
}

export interface VisitorBadge {
  required: boolean;
  badgeId?: string;
  badgeNumber?: string;
  accessZones?: string[];
  returnedAt?: Date;
}

export interface VisitorVisitType {
  hasAppointment: boolean;
  appointmentId?: string;
  purpose: VisitPurpose;
  description: string;
  expectedDuration: string;
  isUrgent?: boolean;
}

export interface VisitorDestination {
  type: DestinationType;
  employeeId?: string;
  employee?: Employee;
  serviceId?: string;
  service?: Service;
  specificLocation?: string;
  notificationSent?: boolean;
  notificationTime?: Date;
}

export interface VisitorMetadata {
  registeredBy: string;
  registrationTime: Date;
  checkInTime: Date;
  expectedCheckOut: Date;
  actualCheckOut?: Date;
  status: VisitorStatus;
  registrationNumber: string;
  qrCode: string;
  receiptGenerated: boolean;
}

export interface VisitorRegistrationData {
  identity: Partial<VisitorIdentity>;
  badge: Partial<VisitorBadge>;
  visitType: Partial<VisitorVisitType>;
  destination: Partial<VisitorDestination>;
  metadata: Partial<VisitorMetadata>;
}

export interface AIExtractionResult {
  firstName?: string;
  lastName?: string;
  documentType?: IdType;
  documentNumber?: string;
  birthDate?: string;
  confidence: number;
  errors?: string[];
}

export type PackageType = 'document' | 'colis' | 'courrier' | 'recommande';
export type PackageStatus = 'received' | 'notified' | 'delivered' | 'returned';
export type RecipientType = 'employee' | 'service';

export interface PackageInfo {
  trackingNumber: string;
  carrier: string;
  type: PackageType;
  weight?: number;
  dimensions?: string;
  fragile: boolean;
  urgent: boolean;
  photo?: string;
  barcode?: string;
  description?: string;
}

export interface PackageRecipient {
  type: RecipientType;
  employeeId?: string;
  employee?: Employee;
  serviceId?: string;
  service?: Service;
  notificationSent: boolean;
  notificationTime?: Date;
}

export interface PackageSender {
  name: string;
  company?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PackageStatus {
  received: Date;
  receivedBy: string;
  delivered?: Date;
  deliveredTo?: string;
  deliveredById?: string;
  signature?: string;
  status: PackageStatus;
  notes?: string;
}

export interface PackageRegistrationData {
  id?: string;
  package: PackageInfo;
  recipient: PackageRecipient;
  sender: PackageSender;
  status: PackageStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VisitorReceipt {
  registrationNumber: string;
  visitor: VisitorRegistrationData;
  generatedAt: Date;
  generatedBy: string;
  qrCode: string;
  instructions: string[];
}

export interface NotificationData {
  type: 'visitor_arrival' | 'package_arrival' | 'appointment_reminder';
  to: string;
  subject: string;
  body: string;
  sms?: string;
  urgent?: boolean;
  data?: any;
}

export interface AvailableBadge {
  id: string;
  number: string;
  zone: string;
  isAvailable: boolean;
  currentHolder?: string;
  lastUsed?: Date;
}

export interface AccessZone {
  id: string;
  name: string;
  description: string;
  level: number;
  requiresEscort: boolean;
}
