import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, MapPin, Calendar, Save, Loader } from 'lucide-react';
import { showToast } from '../../utils/toastManager';

export interface UserData {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  location: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  createdAt?: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserData) => void;
  user?: UserData | null; // null pour création, UserData pour édition
  mode: 'create' | 'edit' | 'view';
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  mode
}) => {
  const [formData, setFormData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'RECEPTION',
    department: '',
    location: 'Libreville',
    status: 'active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setFormData(user);
    } else if (mode === 'create') {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'RECEPTION',
        department: '',
        location: 'Libreville',
        status: 'active'
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Le département est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Supprimer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsLoading(true);
    try {
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(formData);
      
      if (mode === 'create') {
        showToast.userCreated(`${formData.firstName} ${formData.lastName}`);
      } else {
        showToast.userUpdated(`${formData.firstName} ${formData.lastName}`);
      }
      
      onClose();
    } catch (error) {
      showToast.error('Erreur de sauvegarde', 'Impossible de sauvegarder l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      ADMIN: 'Administrateur Système',
      DG: 'Direction Générale',
      CSD: 'Chef de Centre des Impôts',
      CSI: 'Inspecteur Principal (Contrôle Fiscal)',
      AG: 'Agent Accueil Contribuables',
      ACF: 'Agent de Recouvrement',
      SR: 'Chef de Centre Régional',
      AC: 'Auditeur Fiscal',
      RECEPTION: 'Réceptionniste DGI'
    } as const;
    return (labels as Record<string, string>)[role] || role;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Actif',
      inactive: 'Inactif',
      suspended: 'Suspendu'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {mode === 'create' ? 'Nouvel utilisateur' : 
                   mode === 'edit' ? 'Modifier utilisateur' : 
                   'Détails utilisateur'}
                </h2>
                <p className="text-sm text-gray-600">
                  {mode === 'create' ? 'Créer un nouveau compte utilisateur' :
                   mode === 'edit' ? 'Modifier les informations utilisateur' :
                   'Consulter les informations utilisateur'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Prénom et Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  } ${mode === 'view' ? 'bg-gray-50' : ''}`}
                  placeholder="Entrez le prénom"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  } ${mode === 'view' ? 'bg-gray-50' : ''}`}
                  placeholder="Entrez le nom"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } ${mode === 'view' ? 'bg-gray-50' : ''}`}
                placeholder="nom.prenom@dgi.ga"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Rôle */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                <Shield className="h-4 w-4 inline mr-1" />
                Rôle *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  mode === 'view' ? 'bg-gray-50' : 'border-gray-300'
                }`}
              >
                <option value="RECEP">Réceptionniste DGI</option>
                <option value="ADMIN">Administrateur Système</option>
                <option value="CSD">Chef de Centre des Impôts</option>
                <option value="CSI">Inspecteur Principal (Contrôle Fiscal)</option>
                <option value="AG">Agent Accueil Contribuables</option>
                <option value="ACF">Agent de Recouvrement</option>
                <option value="SR">Chef de Centre Régional</option>
                <option value="AC">Auditeur Fiscal</option>
              </select>
              {mode === 'view' && (
                <p className="text-sm text-gray-600 mt-1">{getRoleLabel(formData.role)}</p>
              )}
            </div>

            {/* Département */}
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Département *
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={mode === 'view'}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.department ? 'border-red-300' : 'border-gray-300'
                } ${mode === 'view' ? 'bg-gray-50' : ''}`}
              >
                <option value="">Sélectionnez un département</option>
                <option value="Centre des Impôts – Akanda (CIPEP)">Centre des Impôts – Akanda (CIPEP)</option>
                <option value="Centre des Impôts – Port-Gentil (CIPEP)">Centre des Impôts – Port-Gentil (CIPEP)</option>
                <option value="Direction des Grandes Entreprises (DGE) – Libreville">Direction des Grandes Entreprises (DGE) – Libreville</option>
                <option value="Services aux Contribuables">Services aux Contribuables</option>
                <option value="Contrôle Fiscal & Vérification">Contrôle Fiscal & Vérification</option>
                <option value="Recouvrement & Contentieux">Recouvrement & Contentieux</option>
                <option value="Direction Générale">Direction Générale</option>
                <option value="Administration Système">Administration Système</option>
              </select>
              {errors.department && (
                <p className="text-red-600 text-sm mt-1">{errors.department}</p>
              )}
            </div>

            {/* Localisation et Statut */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Localisation
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    mode === 'view' ? 'bg-gray-50' : 'border-gray-300'
                  }`}
                >
                  <option value="Libreville">Libreville</option>
                  <option value="Port-Gentil">Port-Gentil</option>
                  <option value="Franceville">Franceville</option>
                  <option value="Oyem">Oyem</option>
                  <option value="Lambaréné">Lambaréné</option>
                  <option value="Akanda">Akanda</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={mode === 'view'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    mode === 'view' ? 'bg-gray-50' : 'border-gray-300'
                  }`}
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="suspended">Suspendu</option>
                </select>
                {mode === 'view' && (
                  <p className="text-sm text-gray-600 mt-1">{getStatusLabel(formData.status)}</p>
                )}
              </div>
            </div>

            {/* Informations de lecture seule en mode view */}
            {mode === 'view' && user && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Créé le: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Dernière connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}</span>
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {mode === 'view' ? 'Fermer' : 'Annuler'}
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};