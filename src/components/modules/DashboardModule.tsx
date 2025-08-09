import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  UserCheck, 
  Calendar, 
  Package, 
  Badge, 
  BarChart3, 
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardStats {
  visitorsToday: number;
  activeVisitors: number;
  appointmentsToday: number;
  packagesReceived: number;
  activeBadges: number;
  pendingApprovals: number;
}

interface RecentActivity {
  id: string;
  type: 'visitor' | 'appointment' | 'package' | 'badge';
  message: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: string;
  color: string;
  adminOnly?: boolean;
}

export const DashboardModule: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    visitorsToday: 0,
    activeVisitors: 0,
    appointmentsToday: 0,
    packagesReceived: 0,
    activeBadges: 0,
    pendingApprovals: 0
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données simulées
      const mockStats: DashboardStats = {
        visitorsToday: 23,
        activeVisitors: 8,
        appointmentsToday: 15,
        packagesReceived: 7,
        activeBadges: 12,
        pendingApprovals: 3
      };

      const mockActivities: RecentActivity[] = [
        {
          id: '1',
          type: 'visitor',
          message: 'Marie OBAME enregistrée pour la Direction Générale',
          time: '14:32',
          status: 'success'
        },
        {
          id: '2',
          type: 'package',
          message: 'Colis DHL123456789 reçu pour Jean NGUEMA',
          time: '14:15',
          status: 'info'
        },
        {
          id: '3',
          type: 'appointment',
          message: 'RDV 15h confirmé avec Paul OBIANG',
          time: '13:45',
          status: 'success'
        },
        {
          id: '4',
          type: 'badge',
          message: 'Badge DGI-V-002 attribué',
          time: '13:20',
          status: 'info'
        },
        {
          id: '5',
          type: 'visitor',
          message: 'Sortie enregistrée - Badge DGI-V-001 rendu',
          time: '12:55',
          status: 'warning'
        }
      ];

      setStats(mockStats);
      setRecentActivities(mockActivities);
      
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const quickActions: QuickAction[] = [
    {
      id: 'new-visitor',
      title: 'Nouveau Visiteur',
      description: 'Enregistrer un visiteur',
      icon: UserCheck,
      action: 'reception',
      color: 'bg-blue-500'
    },
    {
      id: 'new-appointment',
      title: 'Nouveau RDV',
      description: 'Planifier un rendez-vous',
      icon: Calendar,
      action: 'appointments',
      color: 'bg-purple-500'
    },
    {
      id: 'new-package',
      title: 'Nouveau Colis',
      description: 'Enregistrer un colis',
      icon: Package,
      action: 'packages',
      color: 'bg-orange-500'
    },
    {
      id: 'create-badge',
      title: 'Créer Badge',
      description: 'Nouveau badge d\'accès',
      icon: Badge,
      action: 'badges',
      color: 'bg-green-500'
    },
    {
      id: 'manage-staff',
      title: 'Gérer Personnel',
      description: 'Administration du personnel',
      icon: Users,
      action: 'personnel',
      color: 'bg-indigo-500',
      adminOnly: true
    },
    {
      id: 'view-reports',
      title: 'Rapports',
      description: 'Statistiques détaillées',
      icon: BarChart3,
      action: 'reports',
      color: 'bg-pink-500',
      adminOnly: true
    }
  ];

  const filteredQuickActions = quickActions.filter(action => 
    !action.adminOnly || user?.role === 'ADMIN'
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'visitor': return UserCheck;
      case 'appointment': return Calendar;
      case 'package': return Package;
      case 'badge': return Badge;
      default: return Activity;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold">Tableau de Bord</h1>
          <p className="text-blue-100">Chargement...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Tableau de Bord</h1>
            <p className="text-blue-100">
              Bienvenue {user?.firstName} - Vue d'ensemble des activités DGI
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Visiteurs Aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900">{stats.visitorsToday}</p>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +12% vs hier
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Visiteurs Actifs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeVisitors}</p>
              <p className="text-sm text-blue-600 flex items-center gap-1">
                <Clock className="h-4 w-4" />
                En visite
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">RDV Aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900">{stats.appointmentsToday}</p>
              <p className="text-sm text-purple-600 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Planifiés
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Colis Reçus</p>
              <p className="text-3xl font-bold text-gray-900">{stats.packagesReceived}</p>
              <p className="text-sm text-orange-600 flex items-center gap-1">
                <Package className="h-4 w-4" />
                Aujourd'hui
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Badges Actifs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeBadges}</p>
              <p className="text-sm text-emerald-600 flex items-center gap-1">
                <Badge className="h-4 w-4" />
                Attribués
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Badge className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Approbations
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => window.location.hash = action.action}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all group text-left"
              >
                <div className={`p-3 ${action.color} rounded-lg mr-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h2>
          
          <div className="space-y-4">
            {recentActivities.map(activity => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button className="w-full mt-4 text-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
            Voir toute l'activité
          </button>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">État du Système</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-900">Base de données</span>
              </div>
              <span className="text-sm text-green-600">Opérationnel</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-900">Service d'impression</span>
              </div>
              <span className="text-sm text-green-600">Connecté</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-900">Système de badges</span>
              </div>
              <span className="text-sm text-green-600">Actif</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-900">Maintenance planifiée</span>
              </div>
              <span className="text-sm text-orange-600">Dimanche 18h</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Conseil du jour</h3>
            <p className="text-sm text-blue-700">
              Pensez à vérifier régulièrement l'expiration des badges temporaires pour maintenir la sécurité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};