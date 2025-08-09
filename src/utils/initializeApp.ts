import { db } from '../services/database';
import { Employee, Service } from '../types/personnel';

export const initializeDefaultEmployees = async (): Promise<void> => {
  const existingEmployees = db.getEmployees();
  if (existingEmployees.length > 0) return;

  const services = db.getServices();
  
  // Données d'exemple avec les nouveaux types
  const defaultEmployees: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      matricule: 'DGI001',
      firstName: 'Jean',
      lastName: 'NGUEMA',
      email: 'jean.nguema@dgi.ga',
      phone: '+241 77 12 34 56',
      service: services.find(s => s.code === 'FISCALITE') || services[0],
      position: 'Chef de Service Fiscalité',
      office: '203',
      floor: '2ème étage',
      isActive: true
    },
    {
      matricule: 'DGI002',
      firstName: 'Marie',
      lastName: 'OBAME',
      email: 'marie.obame@dgi.ga',
      phone: '+241 77 23 45 67',
      service: services.find(s => s.code === 'RH') || services[1],
      position: 'Responsable RH',
      office: '105',
      floor: '1er étage',
      isActive: true
    },
    {
      matricule: 'DGI003',
      firstName: 'Paul',
      lastName: 'MOUNGOUNGOU',
      email: 'paul.moungoungou@dgi.ga',
      phone: '+241 77 34 56 78',
      service: services.find(s => s.code === 'COMPTA') || services[2],
      position: 'Chef Comptable',
      office: '201',
      floor: '2ème étage',
      isActive: true
    },
    {
      matricule: 'DGI004',
      firstName: 'Sylvie',
      lastName: 'MBOUMBA',
      email: 'sylvie.mboumba@dgi.ga',
      phone: '+241 77 45 67 89',
      service: services.find(s => s.code === 'ACCUEIL') || services[3],
      position: 'Réceptionniste Principale',
      office: 'Hall',
      floor: 'Rez-de-chaussée',
      isActive: true
    },
    {
      matricule: 'DGI005',
      firstName: 'André',
      lastName: 'NDONG',
      email: 'andre.ndong@dgi.ga',
      phone: '+241 77 56 78 90',
      service: services.find(s => s.code === 'FISCALITE') || services[0],
      position: 'Agent Fiscal',
      office: '204',
      floor: '2ème étage',
      isActive: true
    },
    {
      matricule: 'DGI006',
      firstName: 'Claire',
      lastName: 'MOUELE',
      email: 'claire.mouele@dgi.ga',
      phone: '+241 77 67 89 01',
      service: services.find(s => s.code === 'RH') || services[1],
      position: 'Assistante RH',
      office: '106',
      floor: '1er étage',
      isActive: true
    }
  ];

  for (const employeeData of defaultEmployees) {
    const employee: Employee = {
      ...employeeData,
      id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.saveEmployee(employee);
  }

  console.log('✅ Données d\'exemple du personnel initialisées');
};

export const initializeApp = async (): Promise<void> => {
  try {
    // Initialiser les services par défaut
    await db.initializeDefaultData();
    
    // Initialiser les employés par défaut
    await initializeDefaultEmployees();
    
    console.log('🚀 Application DGI Access initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
};
