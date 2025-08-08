import React, { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { PackageWorkflow } from '../workflow/PackageWorkflow';
import { PackageRegistrationData } from '../../types/visitor-process';
import { visitorPackageService } from '../../services/visitor-package-service';

export const PackagesModule: React.FC = () => {
  const [showWorkflow, setShowWorkflow] = useState(false);

  const handlePackageRegistered = async (data: PackageRegistrationData) => {
    try {
      const packageId = await visitorPackageService.registerPackage(data);
      console.log('Colis enregistré avec succès:', packageId);
      
      setShowWorkflow(false);
      alert(`Colis enregistré avec succès!\nID: ${packageId}`);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement du colis');
    }
  };

  const handleWorkflowCancel = () => {
    setShowWorkflow(false);
  };

  if (showWorkflow) {
    return (
      <PackageWorkflow
        onComplete={handlePackageRegistered}
        onCancel={handleWorkflowCancel}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gestion des Colis</h2>
            <p className="text-gray-600 mt-1">
              Réception et suivi des colis et courriers
            </p>
          </div>
          <button
            onClick={() => setShowWorkflow(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau colis
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Aucun colis enregistré aujourd'hui</p>
          <p className="text-sm mt-1">Cliquez sur "Nouveau colis" pour enregistrer un colis</p>
        </div>
      </div>
    </div>
  );
};