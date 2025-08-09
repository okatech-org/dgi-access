import { db } from '../services/database';
import { Employee, Service } from '../types/personnel';

export const initializeDGIRealData = async (): Promise<void> => {
  console.log('🏛️ Initialisation des données réelles DGI...');
  
  // Initialiser les services DGI
  await db.initializeDefaultData();
  
  // Initialiser le personnel DGI avec données authentiques
  await db.initializeDGIEmployees();
  
  console.log('✅ Données réelles DGI initialisées avec succès');
};

export const initializeApp = async (): Promise<void> => {
  try {
    console.log('🏛️ Initialisation de l\'application DGI Access...');
    
    // Initialiser avec les données réelles DGI
    await initializeDGIRealData();
    
    console.log('🚀 Application DGI Access initialisée avec les données réelles');
    console.log('📊 Système prêt pour la gestion des visiteurs DGI');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
};
