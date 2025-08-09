import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Eye, Check, Clock, User, Calendar } from 'lucide-react';

interface PackageItem {
  id: string;
  trackingNumber: string;
  recipient: string;
  sender: string;
  description: string;
  arrivalDate: string;
  arrivalTime: string;
  status: 'pending' | 'received' | 'delivered';
  priority: 'normal' | 'urgent' | 'express';
  recipientDepartment: string;
}

export const PackagesModule: React.FC = () => {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    trackingNumber: '',
    recipient: '',
    sender: '',
    description: '',
    priority: 'normal',
    recipientDepartment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadPackages = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPackages: PackageItem[] = [
        {
          id: 'PKG001',
          trackingNumber: 'DHL123456789',
          recipient: 'Marie OBAME',
          sender: 'Ministère des Finances',
          description: 'Documents officiels',
          arrivalDate: '2024-01-15',
          arrivalTime: '09:30',
          status: 'received',
          priority: 'urgent',
          recipientDepartment: 'Direction Générale'
        },
        {
          id: 'PKG002',
          trackingNumber: 'FED987654321',
          recipient: 'Jean NGUEMA',
          sender: 'Société TOTAL',
          description: 'Matériel informatique',
          arrivalDate: '2024-01-15',
          arrivalTime: '10:15',
          status: 'pending',
          priority: 'normal',
          recipientDepartment: 'Informatique'
        }
      ];

      setPackages(mockPackages);
      setLoading(false);
    };

    loadPackages();
  }, []);

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPackage: PackageItem = {
        id: `PKG${String(packages.length + 1).padStart(3, '0')}`,
        ...formData,
        arrivalDate: new Date().toISOString().split('T')[0],
        arrivalTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        status: 'received',
        priority: formData.priority as PackageItem['priority']
      };

      setPackages(prev => [newPackage, ...prev]);
      setShowAddForm(false);
      setFormData({
        trackingNumber: '',
        recipient: '',
        sender: '',
        description: '',
        priority: 'normal',
        recipientDepartment: ''
      });
      
      alert(`✅ Colis ${newPackage.trackingNumber} enregistré avec succès !`);
      
    } catch (error) {
      alert('❌ Erreur lors de l\'enregistrement du colis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDelivered = async (packageId: string) => {
    if (!confirm('Confirmer la livraison de ce colis ?')) return;
    
    setPackages(prev => prev.map(pkg => 
      pkg.id === packageId 
        ? { ...pkg, status: 'delivered' as const }
        : pkg
    ));
    
    alert('✅ Colis marqué comme livré !');
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.sender.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'express': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold">Courrier & Colis</h1>
          <p className="text-orange-100">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Courrier & Colis</h1>
            <p className="text-orange-100">Réception et suivi des livraisons</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{packages.filter(p => p.status === 'pending').length}</div>
              <div className="text-sm text-orange-200">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{packages.filter(p => p.status === 'received').length}</div>
              <div className="text-sm text-orange-200">Reçus</div>
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
              placeholder="Rechercher par numéro, destinataire, expéditeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 pl-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="received">Reçus</option>
            <option value="delivered">Livrés</option>
          </select>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouveau Colis
          </button>
        </div>
      </div>

      {/* Add Package Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Enregistrer un nouveau colis</h2>
              
              <form onSubmit={handleAddPackage} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de suivi *</label>
                    <input
                      type="text"
                      value={formData.trackingNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: DHL123456789"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="express">Express</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire *</label>
                    <input
                      type="text"
                      value={formData.recipient}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nom du destinataire"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service destinataire *</label>
                    <input
                      type="text"
                      value={formData.recipientDepartment}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipientDepartment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: Direction Générale"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expéditeur *</label>
                  <input
                    type="text"
                    value={formData.sender}
                    onChange={(e) => setFormData(prev => ({ ...prev, sender: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nom de l'expéditeur"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description du contenu *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Description du contenu du colis"
                    required
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
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4" />
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Packages List */}
      <div className="space-y-4">
        {filteredPackages.length > 0 ? (
          filteredPackages.map(pkg => (
            <div key={pkg.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="h-5 w-5 text-orange-600" />
                        {pkg.trackingNumber}
                      </h3>
                      <p className="text-sm text-gray-600">{pkg.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(pkg.priority)}`}>
                        {pkg.priority === 'express' ? 'Express' : 
                         pkg.priority === 'urgent' ? 'Urgent' : 'Normal'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(pkg.status)}`}>
                        {pkg.status === 'pending' ? 'En attente' :
                         pkg.status === 'received' ? 'Reçu' : 'Livré'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Destinataire</p>
                      <p className="text-gray-900 flex items-center gap-1">
                        <User className="h-4 w-4 text-gray-400" />
                        {pkg.recipient}
                      </p>
                      <p className="text-gray-600 text-xs">{pkg.recipientDepartment}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 mb-1">Expéditeur</p>
                      <p className="text-gray-900">{pkg.sender}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 mb-1">Arrivée</p>
                      <p className="text-gray-900 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(pkg.arrivalDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-gray-600 text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {pkg.arrivalTime}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {pkg.status === 'received' && (
                    <button
                      onClick={() => handleMarkDelivered(pkg.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Marquer livré
                    </button>
                  )}
                  
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Détails
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun colis trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};
