import React, { useState, useEffect } from 'react';
import { 
  Badge, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  User, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  X,
  QrCode,
  Printer,
  UserPlus,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface BadgeItem {
  id: string;
  badgeNumber: string;
  badgeType: 'visitor' | 'temporary' | 'permanent' | 'vip';
  status: 'available' | 'assigned' | 'expired' | 'lost' | 'damaged';
  assignedTo?: string;
  assignedDate?: string;
  expiryDate?: string;
  createdDate: string;
  createdBy: string;
  color: string;
  accessLevel: 'basic' | 'restricted' | 'full';
  notes?: string;
}

export const BadgeManagementModule: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Form state for creating badges
  const [badgeForm, setBadgeForm] = useState({
    badgeNumber: '',
    badgeType: 'visitor',
    color: 'blue',
    accessLevel: 'basic',
    expiryDate: '',
    notes: ''
  });

  // Form state for assigning badges
  const [assignForm, setAssignForm] = useState({
    visitorName: '',
    visitorPhone: '',
    purpose: '',
    duration: '1',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockBadges: BadgeItem[] = [
        {
          id: 'B001',
          badgeNumber: 'DGI-V-001',
          badgeType: 'visitor',
          status: 'available',
          createdDate: '2024-01-10',
          createdBy: 'Admin DGI',
          color: 'blue',
          accessLevel: 'basic'
        },
        {
          id: 'B002',
          badgeNumber: 'DGI-V-002',
          badgeType: 'visitor',
          status: 'assigned',
          assignedTo: 'Marie OBAME',
          assignedDate: '2024-01-15',
          expiryDate: '2024-01-15',
          createdDate: '2024-01-10',
          createdBy: 'Réception',
          color: 'blue',
          accessLevel: 'basic'
        },
        {
          id: 'B003',
          badgeNumber: 'DGI-VIP-001',
          badgeType: 'vip',
          status: 'available',
          createdDate: '2024-01-05',
          createdBy: 'Admin DGI',
          color: 'gold',
          accessLevel: 'full'
        },
        {
          id: 'B004',
          badgeNumber: 'DGI-T-001',
          badgeType: 'temporary',
          status: 'expired',
          assignedTo: 'Jean NGUEMA',
          assignedDate: '2024-01-10',
          expiryDate: '2024-01-14',
          createdDate: '2024-01-08',
          createdBy: 'Admin DGI',
          color: 'orange',
          accessLevel: 'restricted'
        }
      ];

      setBadges(mockBadges);
    } catch (error) {
      console.error('Erreur lors du chargement des badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBadge: BadgeItem = {
        id: `B${String(badges.length + 1).padStart(3, '0')}`,
        badgeNumber: badgeForm.badgeNumber || `DGI-${badgeForm.badgeType.toUpperCase()}-${String(badges.length + 1).padStart(3, '0')}`,
        badgeType: badgeForm.badgeType as BadgeItem['badgeType'],
        status: 'available',
        createdDate: new Date().toISOString().split('T')[0],
        createdBy: user?.firstName ? `${user.firstName} ${user.lastName}` : 'Utilisateur',
        color: badgeForm.color,
        accessLevel: badgeForm.accessLevel as BadgeItem['accessLevel'],
        expiryDate: badgeForm.expiryDate || undefined,
        notes: badgeForm.notes || undefined
      };

      setBadges(prev => [newBadge, ...prev]);
      setShowAddForm(false);
      setBadgeForm({
        badgeNumber: '',
        badgeType: 'visitor',
        color: 'blue',
        accessLevel: 'basic',
        expiryDate: '',
        notes: ''
      });
      
      alert(`✅ Badge ${newBadge.badgeNumber} créé avec succès !`);
      
    } catch (error) {
      alert('❌ Erreur lors de la création du badge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBadge) return;
    
    setSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + parseInt(assignForm.duration));
      
      setBadges(prev => prev.map(badge => 
        badge.id === selectedBadge.id 
          ? { 
              ...badge, 
              status: 'assigned' as const,
              assignedTo: assignForm.visitorName,
              assignedDate: new Date().toISOString().split('T')[0],
              expiryDate: expiryDate.toISOString().split('T')[0],
              notes: assignForm.notes || badge.notes
            }
          : badge
      ));
      
      setShowAssignForm(false);
      setSelectedBadge(null);
      setAssignForm({
        visitorName: '',
        visitorPhone: '',
        purpose: '',
        duration: '1',
        notes: ''
      });
      
      alert(`✅ Badge ${selectedBadge.badgeNumber} attribué à ${assignForm.visitorName} !`);
      
    } catch (error) {
      alert('❌ Erreur lors de l\'attribution du badge');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeBadge = async (badgeId: string) => {
    const badge = badges.find(b => b.id === badgeId);
    if (!badge || !confirm(`Révoquer le badge ${badge.badgeNumber} ?`)) return;
    
    setBadges(prev => prev.map(b => 
      b.id === badgeId 
        ? { 
            ...b, 
            status: 'available' as const,
            assignedTo: undefined,
            assignedDate: undefined,
            expiryDate: undefined
          }
        : b
    ));
    
    alert(`✅ Badge ${badge.badgeNumber} révoqué avec succès !`);
  };

  const handleDeleteBadge = async (badgeId: string) => {
    const badge = badges.find(b => b.id === badgeId);
    if (!badge || !confirm(`Supprimer définitivement le badge ${badge.badgeNumber} ?`)) return;
    
    setBadges(prev => prev.filter(b => b.id !== badgeId));
    alert(`✅ Badge ${badge.badgeNumber} supprimé !`);
  };

  const handlePrintBadge = (badge: BadgeItem) => {
    alert(`🖨️ Impression du badge ${badge.badgeNumber} en cours...`);
  };

  const filteredBadges = badges.filter(badge => {
    const matchesSearch = 
      badge.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (badge.assignedTo && badge.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = statusFilter === 'all' || badge.status === statusFilter;
    const matchesType = typeFilter === 'all' || badge.badgeType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'lost': return 'bg-red-100 text-red-800';
      case 'damaged': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visitor': return 'bg-blue-100 text-blue-800';
      case 'temporary': return 'bg-orange-100 text-orange-800';
      case 'permanent': return 'bg-purple-100 text-purple-800';
      case 'vip': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeColorStyle = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-400 bg-blue-50';
      case 'green': return 'border-green-400 bg-green-50';
      case 'orange': return 'border-orange-400 bg-orange-50';
      case 'red': return 'border-red-400 bg-red-50';
      case 'purple': return 'border-purple-400 bg-purple-50';
      case 'gold': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold">Gestion des Badges</h1>
          <p className="text-purple-100">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gestion des Badges</h1>
            <p className="text-purple-100">Création et attribution des badges d'accès</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{badges.filter(b => b.status === 'available').length}</div>
              <div className="text-sm text-purple-200">Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{badges.filter(b => b.status === 'assigned').length}</div>
              <div className="text-sm text-purple-200">Attribués</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher par numéro de badge ou nom du porteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponibles</option>
            <option value="assigned">Attribués</option>
            <option value="expired">Expirés</option>
            <option value="lost">Perdus</option>
            <option value="damaged">Endommagés</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="visitor">Visiteur</option>
            <option value="temporary">Temporaire</option>
            <option value="permanent">Permanent</option>
            <option value="vip">VIP</option>
          </select>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Créer Badge
          </button>
        </div>
      </div>

      {/* Create Badge Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Créer un nouveau badge</h2>
              
              <form onSubmit={handleCreateBadge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de badge (optionnel)
                  </label>
                  <input
                    type="text"
                    value={badgeForm.badgeNumber}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, badgeNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Auto-généré si vide"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={badgeForm.badgeType}
                      onChange={(e) => setBadgeForm(prev => ({ ...prev, badgeType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="visitor">Visiteur</option>
                      <option value="temporary">Temporaire</option>
                      <option value="permanent">Permanent</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                    <select
                      value={badgeForm.color}
                      onChange={(e) => setBadgeForm(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="blue">Bleu</option>
                      <option value="green">Vert</option>
                      <option value="orange">Orange</option>
                      <option value="red">Rouge</option>
                      <option value="purple">Violet</option>
                      <option value="gold">Or</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'accès</label>
                  <select
                    value={badgeForm.accessLevel}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, accessLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="basic">Accès de base</option>
                    <option value="restricted">Accès restreint</option>
                    <option value="full">Accès complet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'expiration (optionnel)
                  </label>
                  <input
                    type="date"
                    value={badgeForm.expiryDate}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={badgeForm.notes}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Instructions spéciales..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Création...
                      </>
                    ) : (
                      <>
                        <Badge className="h-4 w-4" />
                        Créer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Badge Form Modal */}
      {showAssignForm && selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Attribuer le badge {selectedBadge.badgeNumber}
              </h2>
              
              <form onSubmit={handleAssignBadge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du visiteur *
                  </label>
                  <input
                    type="text"
                    value={assignForm.visitorName}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, visitorName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={assignForm.visitorPhone}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, visitorPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objet de la visite *
                  </label>
                  <input
                    type="text"
                    value={assignForm.purpose}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, purpose: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée (heures)
                  </label>
                  <select
                    value={assignForm.duration}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="1">1 heure</option>
                    <option value="2">2 heures</option>
                    <option value="4">4 heures</option>
                    <option value="8">8 heures (journée)</option>
                    <option value="24">24 heures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAssignForm(false); setSelectedBadge(null); }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Attribution...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Attribuer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Badges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.length > 0 ? (
          filteredBadges.map(badge => (
            <div key={badge.id} className={`bg-white rounded-xl p-6 shadow-sm border-2 hover:shadow-md transition-shadow ${getBadgeColorStyle(badge.color)}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Badge className="h-5 w-5 text-purple-600" />
                    {badge.badgeNumber}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(badge.badgeType)}`}>
                      {badge.badgeType === 'visitor' ? 'Visiteur' :
                       badge.badgeType === 'temporary' ? 'Temporaire' :
                       badge.badgeType === 'permanent' ? 'Permanent' : 'VIP'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(badge.status)}`}>
                      {badge.status === 'available' ? 'Disponible' :
                       badge.status === 'assigned' ? 'Attribué' :
                       badge.status === 'expired' ? 'Expiré' :
                       badge.status === 'lost' ? 'Perdu' : 'Endommagé'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePrintBadge(badge)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Imprimer"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {badge.assignedTo && (
                  <div>
                    <p className="text-gray-500">Attribué à</p>
                    <p className="text-gray-900 font-medium flex items-center gap-1">
                      <User className="h-4 w-4 text-gray-400" />
                      {badge.assignedTo}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-gray-500">Niveau d'accès</p>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Shield className="h-4 w-4 text-gray-400" />
                    {badge.accessLevel === 'basic' ? 'Accès de base' :
                     badge.accessLevel === 'restricted' ? 'Accès restreint' : 'Accès complet'}
                  </p>
                </div>
                
                {badge.expiryDate && (
                  <div>
                    <p className="text-gray-500">Expire le</p>
                    <p className="text-gray-900 flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {new Date(badge.expiryDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-gray-500">Créé le</p>
                  <p className="text-gray-600 text-xs">{new Date(badge.createdDate).toLocaleDateString('fr-FR')} par {badge.createdBy}</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                {badge.status === 'available' && (
                  <button
                    onClick={() => { setSelectedBadge(badge); setShowAssignForm(true); }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <UserPlus className="h-3 w-3" />
                    Attribuer
                  </button>
                )}
                
                {badge.status === 'assigned' && (
                  <button
                    onClick={() => handleRevokeBadge(badge.id)}
                    className="flex-1 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Révoquer
                  </button>
                )}
                
                <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Détails
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
            <Badge className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun badge trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};