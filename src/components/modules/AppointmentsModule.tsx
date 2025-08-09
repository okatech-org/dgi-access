import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search, User, Phone, Building2, Eye, Check, X, AlertCircle, UserCheck, Clock3, CheckCircle } from 'lucide-react';
import { Appointment, AppointmentFormData, AppointmentStatus } from '../../types/appointment';
import { Employee } from '../../types/personnel';
import { db } from '../../services/database';
import { TYPICAL_VISIT_PURPOSES, FAMILY_RELATIONSHIP_TYPES } from '../../data/dgi-sample-visitors';

export const AppointmentsModule: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  const [formData, setFormData] = useState<AppointmentFormData>({
    citizenName: '',
    citizenPhone: '',
    citizenEmail: '',
    date: '',
    time: '',
    duration: 60,
    service: '',
    purpose: '',
    agent: '',
    priority: 'normal',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // États pour la gestion des motifs de visite
  const [showPurposeGrid, setShowPurposeGrid] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [selectedRelationshipType, setSelectedRelationshipType] = useState('');

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const appointmentsData = db.getAppointments();
        const employeesData = db.getEmployees();
        
        setAppointments(appointmentsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Génération d'ID unique
  const generateAppointmentId = (): string => {
    return `rdv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.citizenName.trim()) {
      newErrors.citizenName = 'Le nom du visiteur est obligatoire';
    }
    if (!formData.citizenPhone.trim()) {
      newErrors.citizenPhone = 'Le téléphone est obligatoire';
    }
    if (!formData.date) {
      newErrors.date = 'La date est obligatoire';
    }
    if (!formData.time) {
      newErrors.time = 'L\'heure est obligatoire';
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Le motif est obligatoire';
    }
    // Validation spéciale pour "Visite Parent"
    if (selectedPurpose === 'Visite Parent' && !selectedRelationshipType) {
      newErrors.purpose = 'Veuillez sélectionner le type de parenté pour la visite parent';
    }
    if (!formData.agent) {
      newErrors.agent = 'L\'agent à rencontrer est obligatoire';
    }
    if (!formData.service.trim()) {
      newErrors.service = 'Le service est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des changements de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Gestion de l'agent sélectionné
  const handleAgentSelect = (employeeId: string) => {
    const selectedEmployee = employees.find(emp => emp.id === employeeId);
    if (selectedEmployee) {
      setFormData(prev => ({
        ...prev,
        agent: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
        service: selectedEmployee.service.name
      }));
    }
  };

  // Gestion des motifs de visite
  const handlePurposeSelect = (purpose: string) => {
    setSelectedPurpose(purpose);
    setFormData(prev => ({ ...prev, purpose }));
    setShowPurposeGrid(false);
    if (purpose !== 'Visite Parent') {
      setSelectedRelationshipType('');
    }
  };

  const handleRelationshipTypeSelect = (relationshipType: string) => {
    setSelectedRelationshipType(relationshipType);
    const finalPurpose = `Visite Parent (${relationshipType})`;
    setFormData(prev => ({ ...prev, purpose: finalPurpose }));
  };

  // Fermer la modale avec réinitialisation
  const handleCloseModal = () => {
    setSelectedPurpose('');
    setSelectedRelationshipType('');
    setShowPurposeGrid(false);
    setErrors({});
    setShowAddForm(false);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const newAppointment: Appointment = {
        id: generateAppointmentId(),
        ...formData,
        status: 'pending'
      };

      await db.saveAppointment(newAppointment);
      
      // Recharger les rendez-vous
      const updatedAppointments = db.getAppointments();
      setAppointments(updatedAppointments);

      // Réinitialiser le formulaire
      setFormData({
        citizenName: '',
        citizenPhone: '',
        citizenEmail: '',
        date: '',
        time: '',
        duration: 60,
        service: '',
        purpose: '',
        agent: '',
        priority: 'normal',
        notes: ''
      });
      
      // Réinitialiser les états des motifs
      setSelectedPurpose('');
      setSelectedRelationshipType('');
      setShowPurposeGrid(false);
      
      setShowAddForm(false);
      alert('✅ Rendez-vous programmé avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      alert('❌ Erreur lors de la création du rendez-vous');
    } finally {
      setSubmitting(false);
    }
  };

  // Changer le statut d'un rendez-vous
  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      await db.updateAppointmentStatus(appointmentId, newStatus);
      
      // Recharger les rendez-vous
      const updatedAppointments = db.getAppointments();
      setAppointments(updatedAppointments);
      
      const statusLabels = {
        'pending': 'En attente',
        'confirmed': 'Confirmé',
        'arrived': 'Arrivé',
        'completed': 'Terminé',
        'cancelled': 'Annulé',
        'no_show': 'Absent'
      };
      
      alert(`✅ Statut mis à jour: ${statusLabels[newStatus]}`);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('❌ Erreur lors de la mise à jour');
    }
  };

  // Filtrer les rendez-vous
  const filteredAppointments = appointments.filter(appointment => {
    const today = new Date().toISOString().split('T')[0];
    
    // Filtre par date
    let dateMatch = true;
    if (dateFilter === 'today') {
      dateMatch = appointment.date === today;
    } else if (dateFilter === 'week') {
      const appointmentDate = new Date(appointment.date);
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      dateMatch = appointmentDate >= new Date() && appointmentDate <= weekFromNow;
    }

    // Filtre par statut
    const statusMatch = statusFilter === 'all' || appointment.status === statusFilter;

    // Filtre par recherche
    const searchMatch = !searchTerm || 
      appointment.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    return dateMatch && statusMatch && searchMatch;
  });

  // Obtenir les statistiques
  const stats = db.getAppointmentStats();

  // Classes CSS
  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm";
  const buttonClass = "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des rendez-vous...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Rendez-vous & Planification
          </h1>
          <p className="text-gray-600 mt-1">Gestion des visiteurs attendus et planification des visites</p>
        </div>

          <button
          onClick={() => setShowAddForm(true)}
          className={`${buttonClass} flex items-center gap-2`}
          >
          <Plus className="w-4 h-4" />
            Nouveau Rendez-vous
          </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 text-sm font-medium">Aujourd'hui</p>
              <p className="text-2xl font-bold text-blue-900">{stats.today}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 text-sm font-medium">Confirmés</p>
              <p className="text-2xl font-bold text-green-900">{stats.confirmed}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 text-sm font-medium">En attente</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            <Clock3 className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-800 text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
            </div>
            <Eye className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un rendez-vous..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmé</option>
            <option value="arrived">Arrivé</option>
            <option value="completed">Terminé</option>
            <option value="cancelled">Annulé</option>
            <option value="no_show">Absent</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            {filteredAppointments.length} rendez-vous trouvé(s)
          </div>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous trouvé</h3>
            <p className="text-gray-600">
              {appointments.length === 0 
                ? "Commencez par programmer votre premier rendez-vous" 
                : "Essayez de modifier vos filtres de recherche"
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusChange={handleStatusChange}
              />
            ))}
        </div>
      )}
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
          <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nouveau Rendez-vous</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du visiteur *
                    </label>
                    <input
                      type="text"
                      name="citizenName"
                      value={formData.citizenName}
                      onChange={handleInputChange}
                      className={`${inputClass} ${errors.citizenName ? 'border-red-300' : ''}`}
                      placeholder="Nom complet du visiteur"
                    />
                    {errors.citizenName && (
                      <p className="text-red-600 text-xs mt-1">{errors.citizenName}</p>
                    )}
              </div>

            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="citizenPhone"
                      value={formData.citizenPhone}
                      onChange={handleInputChange}
                      className={`${inputClass} ${errors.citizenPhone ? 'border-red-300' : ''}`}
                      placeholder="+241 01 02 03 04"
                    />
                    {errors.citizenPhone && (
                      <p className="text-red-600 text-xs mt-1">{errors.citizenPhone}</p>
                    )}
          </div>

                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (optionnel)
                    </label>
                    <input
                      type="email"
                      name="citizenEmail"
                      value={formData.citizenEmail}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="email@example.com"
                    />
                  </div>
                  
                        <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agent à rencontrer *
                    </label>
                    <select
                      name="agent"
                      value={formData.agent}
                      onChange={(e) => handleAgentSelect(e.target.value)}
                      className={`${inputClass} ${errors.agent ? 'border-red-300' : ''}`}
                    >
                      <option value="">Sélectionnez un agent DGI</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} - {employee.service.name}
                        </option>
                      ))}
                    </select>
                    {errors.agent && (
                      <p className="text-red-600 text-xs mt-1">{errors.agent}</p>
                            )}
                          </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className={`${inputClass} ${errors.date ? 'border-red-300' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.date && (
                      <p className="text-red-600 text-xs mt-1">{errors.date}</p>
                  )}
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure *
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className={`${inputClass} ${errors.time ? 'border-red-300' : ''}`}
                    />
                    {errors.time && (
                      <p className="text-red-600 text-xs mt-1">{errors.time}</p>
          )}
        </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée (minutes)
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 heure</option>
                      <option value={90}>1h 30</option>
                      <option value={120}>2 heures</option>
                    </select>
            </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priorité
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="normal">Normale</option>
                      <option value="high">Élevée</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                      </div>
                      
                {/* Motif de la visite avec grille de sélection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motif de la Visite DGI *
                  </label>
                  <div className="space-y-4">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPurposeGrid(!showPurposeGrid)}
                        className={`w-full px-4 py-3 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 flex items-center justify-between ${
                          selectedPurpose ? 'border-green-500 bg-green-50' : ''
                        }`}
                      >
                        <span className={selectedPurpose ? 'text-green-800 font-medium' : 'text-gray-500'}>
                          {selectedPurpose || 'Sélectionnez un motif de visite...'}
                        </span>
                        <div className="flex items-center gap-2">
                          {selectedPurpose && <CheckCircle className="w-4 h-4 text-green-600" />}
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        </div>
                        </button>
                      {errors.purpose && (
                        <p className="text-red-600 text-xs mt-1">{errors.purpose}</p>
                      )}
                    </div>

                    {/* Grille des motifs de visite */}
                    {showPurposeGrid && (
                      <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                        <h4 className="text-sm font-medium text-gray-800 mb-3">
                          Sélectionnez le motif de votre visite à la DGI
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {TYPICAL_VISIT_PURPOSES.map(purpose => (
                <button 
                              key={purpose}
                              type="button"
                              onClick={() => handlePurposeSelect(purpose)}
                              className={`p-3 text-left border rounded-lg text-sm transition-all hover:shadow-sm ${
                                selectedPurpose === purpose
                                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{purpose}</span>
                                {selectedPurpose === purpose && (
                                  <CheckCircle className="w-3 h-3 text-blue-600 flex-shrink-0 ml-auto" />
            )}
          </div>
                            </button>
                          ))}
                </div>
              </div>
                    )}

                    {/* Section parenté pour "Visite Parent" */}
                    {selectedPurpose === 'Visite Parent' && (
                      <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                        <h4 className="text-sm font-medium text-pink-800 mb-2">
                          <User className="w-4 h-4 inline mr-1" />
                          Type de Parenté * (requis pour visite parent)
                        </h4>
                        <select
                          value={selectedRelationshipType}
                          onChange={(e) => handleRelationshipTypeSelect(e.target.value)}
                          className={`w-full px-3 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm ${
                            !selectedRelationshipType ? 'border-red-300' : ''
                          }`}
                          required
                        >
                          <option value="">Sélectionnez le type de parenté...</option>
                          {FAMILY_RELATIONSHIP_TYPES.map((relationshipType, index) => (
                            <option key={index} value={relationshipType}>
                              {relationshipType}
                            </option>
                          ))}
                        </select>
                        {selectedRelationshipType && (
                          <div className="mt-2 p-2 bg-pink-100 border border-pink-300 rounded text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-pink-600" />
                              <span className="font-medium text-pink-900">
                                Parenté sélectionnée: {selectedRelationshipType}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="mt-2 text-xs text-pink-700 bg-pink-100 p-2 rounded">
                          La visite parent nécessite la spécification du lien de parenté avec l'employé DGI pour des raisons de sécurité.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes additionnelles
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className={inputClass}
                    placeholder="Informations complémentaires..."
                  />
              </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                <button 
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Programmation...
                      </>
                    ) : (
                      'Programmer le Rendez-vous'
                    )}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher une carte de rendez-vous
interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onStatusChange }) => {
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'arrived': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmé';
      case 'arrived': return 'Arrivé';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'no_show': return 'Absent';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
              <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                {appointment.citizenName}
                {appointment.priority !== 'normal' && (
                  <span className={`text-xs font-bold ${getPriorityColor(appointment.priority)}`}>
                    {appointment.priority === 'urgent' ? '🚨 URGENT' : '⚡ PRIORITÉ'}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{appointment.purpose}</p>
              </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
              {getStatusLabel(appointment.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(appointment.date).toLocaleDateString('fr-FR')}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {appointment.time} ({appointment.duration}min)
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {appointment.agent}
                    </div>
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              {appointment.citizenPhone}
                    </div>
                  </div>
                  
          {appointment.notes && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Notes:</strong> {appointment.notes}
                    </div>
                  )}
                </div>

        <div className="flex flex-wrap gap-2">
          {appointment.status === 'pending' && (
            <button
              onClick={() => onStatusChange(appointment.id, 'confirmed')}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Confirmer
            </button>
          )}

          {appointment.status === 'confirmed' && (
            <>
              <button
                onClick={() => onStatusChange(appointment.id, 'arrived')}
                className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <UserCheck className="w-3 h-3" />
                Arrivé
              </button>
              <button 
                onClick={() => onStatusChange(appointment.id, 'no_show')}
                className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Absent
              </button>
            </>
      )}
      
          {appointment.status === 'arrived' && (
        <button 
              onClick={() => onStatusChange(appointment.id, 'completed')}
              className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors flex items-center gap-1"
        >
              <Check className="w-3 h-3" />
              Terminer
        </button>
          )}
        
          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
        <button 
              onClick={() => onStatusChange(appointment.id, 'cancelled')}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
        >
              <X className="w-3 h-3" />
              Annuler
        </button>
          )}
        </div>
      </div>
    </div>
  );
};