import React, { useState, useEffect } from 'react';
import { 
  User, Search, Calendar, AlertTriangle, Camera, QrCode,
  CheckCircle, X, Smartphone, Mail, Briefcase, FileText,
  Clock, MapPin, Shield, Package, ChevronDown, ChevronUp,
  Tag, RefreshCw
} from 'lucide-react';
import { AppointmentVerificationResult, verifyVisitorAppointment } from '../../utils/appointmentHelpers';
import { Appointment } from '../../types/appointment';
import { AppointmentVerificationPanel } from '../visitor/AppointmentVerificationPanel';
import { BadgeSelector } from '../badge/BadgeSelector';
import { PhysicalBadge } from '../../types/badge';

interface VisitorRegistrationFormProps {
  appointments: Appointment[];
  onRegisterVisitor: (visitorData: any) => void;
  onAppointmentSelected?: (appointment: Appointment | null) => void;
  className?: string;
}

export const BadgeManagementModule: React.FC<VisitorRegistrationFormProps> = ({
  appointments,
  onRegisterVisitor,
  onAppointmentSelected,
  className = ''
}) => {
  // Selected appointment - must be declared before formData
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Form data state
  const [selectedBadge, setSelectedBadge] = useState<PhysicalBadge | null>(null);
  const [formData, setFormData] = useState({
    firstName: selectedAppointment ? getFirstName(selectedAppointment.citizenName) : '',
    lastName: selectedAppointment ? getLastName(selectedAppointment.citizenName) : '',
    phone: selectedAppointment?.citizenPhone || '',
    email: selectedAppointment?.citizenEmail || '',
    company: '',
    idType: 'CNI',
    idNumber: '',
    purposeOfVisit: selectedAppointment?.purpose || '',
    serviceRequested: selectedAppointment?.service || '',
    employeeToVisit: selectedAppointment?.agent || '',
    department: selectedAppointment?.department || '',
    expectedDuration: selectedAppointment?.duration.toString() || '30',
    urgencyLevel: selectedAppointment?.priority || 'normal',
    notes: selectedAppointment?.notes || ''
  });

  // Form section visibility
  const [showAppointmentSection, setShowAppointmentSection] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showBadgeSelector, setShowBadgeSelector] = useState(false);

  // Appointment verification
  const [verificationResult, setVerificationResult] = useState<AppointmentVerificationResult>({
    isExpected: false,
    appointments: [],
    matchType: 'none'
  });
  
  // Check for appointment when name is entered
  useEffect(() => {
    // Send the visitor name and contact info to parent component for real-time verification
    if (onAppointmentSelected && selectedAppointment) {
      onAppointmentSelected(selectedAppointment);
    }
  }, [selectedAppointment, onAppointmentSelected]);

  useEffect(() => {
    if (formData.firstName && formData.lastName) {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      const result = verifyVisitorAppointment(appointments, fullName, formData.phone, formData.email);
      
      setVerificationResult(result);
      setShowAppointmentSection(result.isExpected);
      
      // If exact match, pre-fill form data
      if (result.matchType === 'exact' && result.exactMatch) {
        prefillFormFromAppointment(result.exactMatch);
      }
    } else {
      setVerificationResult({
        isExpected: false,
        appointments: [],
        matchType: 'none'
      });
    }
  }, [formData.firstName, formData.lastName, formData.phone, formData.email, appointments]);

  // Pre-fill form data from appointment
  const prefillFormFromAppointment = (appointment: Appointment) => {
    // Extract first and last name from full name
    const nameParts = appointment.citizenName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    setFormData(prev => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      phone: appointment.citizenPhone || prev.phone,
      email: appointment.citizenEmail || prev.email,
      purposeOfVisit: appointment.purpose || prev.purposeOfVisit,
      serviceRequested: appointment.service || prev.serviceRequested,
      department: appointment.department || prev.department,
      expectedDuration: appointment.duration.toString() || prev.expectedDuration,
      urgencyLevel: appointment.priority || prev.urgencyLevel,
      notes: appointment.notes || prev.notes
    }));

    // Update selected appointment
    setSelectedAppointment(appointment);
    
    if (onAppointmentSelected) {
      onAppointmentSelected(appointment);
    }
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create visitor data object
    const visitorData = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`,
      hasAppointment: verificationResult.isExpected,
      appointmentId: selectedAppointment?.id,
      appointmentStatus: selectedAppointment?.status,
      registrationTime: new Date().toISOString(),
      appointmentVerified: selectedAppointment ? true : false,
      appointmentMatchType: verificationResult.matchType
    };
    
    onRegisterVisitor(visitorData);
  };

  // Handle appointment selection
  const handleAppointmentSelected = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    prefillFormFromAppointment(appointment);
    
    if (onAppointmentSelected) {
      onAppointmentSelected(appointment);
    }
  };

  // Helper functions to extract first and last name
  function getFirstName(fullName: string): string {
    const parts = fullName.split(' ');
    return parts[0] || '';
  }

  function getLastName(fullName: string): string {
    const parts = fullName.split(' ');
    return parts.slice(1).join(' ') || '';
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Enregistrement Visiteur</h3>
            <p className="text-sm text-blue-700">Saisissez les informations du visiteur</p>
          </div>
          <button
            onClick={() => window.location.hash = 'visitors/planning'}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
          >
            <Calendar className="h-4 w-4" />
            Voir les visites prévues
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Section Rendez-vous */}
        <div className="bg-gray-50 rounded-lg p-4">
          <button
            type="button"
            onClick={() => setShowAppointmentSection(!showAppointmentSection)}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Vérification Rendez-vous
            </h4>
            {showAppointmentSection ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {showAppointmentSection && (
            <div className="mt-4">
              <AppointmentVerificationPanel
                appointments={appointments}
                visitorName={`${formData.firstName} ${formData.lastName}`.trim()}
                phoneNumber={formData.phone}
                email={formData.email}
                onAppointmentSelected={handleAppointmentSelected}
              />
            </div>
          )}
        </div>

        {/* Information personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Sélection badge */}
        <div className="bg-gray-50 rounded-lg p-4">
          <button
            type="button"
            onClick={() => setShowBadgeSelector(!showBadgeSelector)}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-600" />
              Sélection Badge
            </h4>
            {showBadgeSelector ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
          
          {showBadgeSelector && (
            <div className="mt-4">
              <BadgeSelector
                selectedBadgeId={selectedBadge?.id}
                onBadgeSelect={setSelectedBadge}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            onClick={() => window.history.back()}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Enregistrer Visiteur
          </button>
        </div>
      </form>
    </div>
  );
};