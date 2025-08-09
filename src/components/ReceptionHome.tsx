import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Package, 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight, 
  Plus,
  Badge,
  FileText,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/database';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
  onClick: () => void;
  count?: number;
  urgent?: boolean;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
  title,
  description,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  hoverColor,
  onClick,
  count,
  urgent
}) => (
  <div 
    onClick={onClick}
    className={`
      relative ${bgColor} border-2 ${borderColor} rounded-xl p-6 cursor-pointer 
      transition-all duration-200 hover:shadow-lg ${hoverColor} hover:scale-105 group
      ${urgent ? 'ring-2 ring-red-200 animate-pulse' : ''}
    `}
  >
    {urgent && (
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
    )}
    
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 ${color} rounded-lg group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {count !== undefined && (
        <div className={`px-2 py-1 ${color} text-white text-xs font-bold rounded-full`}>
          {count}
        </div>
      )}
    </div>
    
    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-900">
      {title}
    </h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-gray-500">Accès rapide</span>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
    </div>
  </div>
);

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-lg border shadow-sm p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-2 ${color} rounded-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    {trend && (
      <div className="mt-2 flex items-center">
        <TrendingUp className={`w-3 h-3 mr-1 ${
          trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
        }`} />
        <span className="text-xs text-gray-500">
          {trend === 'up' ? 'En hausse' : trend === 'down' ? 'En baisse' : 'Stable'}
        </span>
      </div>
    )}
  </div>
);

export const ReceptionHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayVisitors: 0,
    pendingAppointments: 0,
    activeBadges: 0,
    pendingPackages: 0
  });

  useEffect(() => {
    // Charger les statistiques du jour
    const loadStats = () => {
      const todayVisitors = db.getTodayVisitors().length;
      const pendingAppointments = db.getTodayAppointments().filter(a => a.status === 'pending' || a.status === 'confirmed').length;
      const activeBadges = db.getTodayVisitors().filter(v => v.status === 'checked-in').length;
      
      // Simuler les colis en attente (à remplacer par la vraie donnée quand disponible)
      const pendingPackages = Math.floor(Math.random() * 5) + 1;

      setStats({
        todayVisitors,
        pendingAppointments,
        activeBadges,
        pendingPackages
      });
    };

    loadStats();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    {
      title: "Gestion des Visiteurs",
      description: "Enregistrer un nouveau visiteur, gérer les badges et consulter l'historique",
      icon: UserPlus,
      color: "bg-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:bg-blue-100",
      onClick: () => navigate('/visitors'),
      count: stats.todayVisitors,
      urgent: false
    },
    {
      title: "Courrier & Colis",
      description: "Réceptionner, documenter et gérer les colis et courriers entrants",
      icon: Package,
      color: "bg-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      hoverColor: "hover:bg-orange-100",
      onClick: () => navigate('/packages'),
      count: stats.pendingPackages,
      urgent: stats.pendingPackages > 3
    },
    {
      title: "Rendez-vous",
      description: "Consulter, confirmer et gérer les rendez-vous prévus aujourd'hui",
      icon: Calendar,
      color: "bg-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      hoverColor: "hover:bg-green-100",
      onClick: () => navigate('/appointments'),
      count: stats.pendingAppointments,
      urgent: stats.pendingAppointments > 5
    }
  ];

  const currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header d'accueil personnalisé */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Bonjour {user?.firstName} ! 👋
              </h1>
              <p className="text-gray-600 mb-4 lg:mb-0">
                Votre poste de réception DGI est opérationnel - {currentDate}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{currentTime}</div>
                <div className="text-xs text-gray-500">Heure actuelle</div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Visiteurs Aujourd'hui"
            value={stats.todayVisitors}
            icon={Users}
            color="bg-blue-600"
            trend="up"
          />
          <StatCard
            title="Badges Actifs"
            value={stats.activeBadges}
            icon={Badge}
            color="bg-green-600"
            trend="stable"
          />
          <StatCard
            title="Rendez-vous"
            value={stats.pendingAppointments}
            icon={Calendar}
            color="bg-purple-600"
            trend={stats.pendingAppointments > 3 ? 'up' : 'stable'}
          />
          <StatCard
            title="Colis en Attente"
            value={stats.pendingPackages}
            icon={Package}
            color="bg-orange-600"
            trend={stats.pendingPackages > 2 ? 'up' : 'stable'}
          />
        </div>

        {/* Actions rapides principales */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-2">⚡</span>
            Accès Rapide aux Fonctions Principales
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Actions secondaires */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-xl mr-2">🛠️</span>
            Autres Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/badges')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <Badge className="w-6 h-6 text-gray-600 group-hover:text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Badges</span>
            </button>
            
            <button
              onClick={() => navigate('/statistics')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
            >
              <TrendingUp className="w-6 h-6 text-gray-600 group-hover:text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">Statistiques</span>
            </button>
            
            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <Users className="w-6 h-6 text-gray-600 group-hover:text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Mon Profil</span>
            </button>
            
            <button
              onClick={() => navigate('/visitor-workflow')}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
            >
              <Plus className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Workflow</span>
            </button>
          </div>
        </div>

        {/* Conseils rapides */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
            <span className="text-xl mr-2">💡</span>
            Conseils pour une réception efficace
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">
                Vérifiez toujours l'identité des visiteurs avant de leur délivrer un badge
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">
                Documentez tous les colis avec photos pour la traçabilité
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">
                Confirmez les rendez-vous 30 minutes avant l'heure prévue
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800">
                Utilisez les workflows guidés pour les processus complexes
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
