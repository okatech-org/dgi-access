import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  Package,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface StatData {
  label: string;
  value: number;
  change: number;
  color: string;
}

interface ChartData {
  name: string;
  visitors: number;
  packages: number;
  appointments: number;
}

export const StatisticsModule: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('today');
  const [refreshing, setRefreshing] = useState(false);
  
  const [stats, setStats] = useState<StatData[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalVisitorsToday, setTotalVisitorsToday] = useState(0);
  const [averageVisitDuration, setAverageVisitDuration] = useState(0);
  const [peakHour, setPeakHour] = useState('');

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données statistiques simulées
      const mockStats: StatData[] = [
        {
          label: 'Visiteurs Aujourd\'hui',
          value: 23,
          change: 12,
          color: 'bg-blue-500'
        },
        {
          label: 'Badges Actifs',
          value: 8,
          change: -2,
          color: 'bg-green-500'
        },
        {
          label: 'Rendez-vous',
          value: 15,
          change: 5,
          color: 'bg-purple-500'
        },
        {
          label: 'Colis Reçus',
          value: 7,
          change: 3,
          color: 'bg-orange-500'
        }
      ];

      const mockChartData: ChartData[] = [
        { name: '08h', visitors: 2, packages: 1, appointments: 1 },
        { name: '09h', visitors: 5, packages: 2, appointments: 3 },
        { name: '10h', visitors: 8, packages: 3, appointments: 2 },
        { name: '11h', visitors: 6, packages: 1, appointments: 4 },
        { name: '12h', visitors: 3, packages: 0, appointments: 1 },
        { name: '13h', visitors: 1, packages: 1, appointments: 0 },
        { name: '14h', visitors: 7, packages: 2, appointments: 3 },
        { name: '15h', visitors: 9, packages: 1, appointments: 2 },
        { name: '16h', visitors: 4, packages: 0, appointments: 1 },
        { name: '17h', visitors: 2, packages: 1, appointments: 0 }
      ];

      setStats(mockStats);
      setChartData(mockChartData);
      setTotalVisitorsToday(47);
      setAverageVisitDuration(45);
      setPeakHour('15h');
      
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const handleExport = () => {
    alert('📊 Export des statistiques en cours...');
  };

  const getMaxValue = () => {
    return Math.max(...chartData.map(d => Math.max(d.visitors, d.packages, d.appointments)));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold">Statistiques</h1>
          <p className="text-indigo-100">Chargement des métriques...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Statistiques</h1>
            <p className="text-indigo-100">Métriques d'accueil et performance</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/50"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className={`flex items-center text-sm mt-1 ${
                  stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`h-4 w-4 mr-1 ${stat.change < 0 ? 'rotate-180' : ''}`} />
                  {stat.change >= 0 ? '+' : ''}{stat.change}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité par Heure</h2>
          
          <div className="space-y-3">
            {chartData.map((data, index) => {
              const maxValue = getMaxValue();
              const visitorsWidth = (data.visitors / maxValue) * 100;
              const packagesWidth = (data.packages / maxValue) * 100;
              const appointmentsWidth = (data.appointments / maxValue) * 100;
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 text-sm font-medium text-gray-600">{data.name}</div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${visitorsWidth}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6">{data.visitors}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${packagesWidth}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6">{data.packages}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${appointmentsWidth}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-6">{data.appointments}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Visiteurs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Colis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">RDV</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Métriques Clés</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Total Visiteurs</h3>
                  <p className="text-sm text-gray-600">Aujourd'hui</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">{totalVisitorsToday}</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Durée Moyenne</h3>
                  <p className="text-sm text-gray-600">Par visite</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">{averageVisitDuration}min</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Heure de Pointe</h3>
                  <p className="text-sm text-gray-600">Maximum d'affluence</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600">{peakHour}</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Taux de Livraison</h3>
                  <p className="text-sm text-gray-600">Colis livrés</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-orange-600">85%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendances Récentes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">+15%</div>
            <h3 className="font-medium text-gray-900 mb-1">Visiteurs</h3>
            <p className="text-sm text-gray-600">vs semaine dernière</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">+8%</div>
            <h3 className="font-medium text-gray-900 mb-1">Rendez-vous</h3>
            <p className="text-sm text-gray-600">vs semaine dernière</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">+23%</div>
            <h3 className="font-medium text-gray-900 mb-1">Colis</h3>
            <p className="text-sm text-gray-600">vs semaine dernière</p>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Temps de Traitement</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Enregistrement Visiteur</span>
                <span className="text-sm text-gray-600">2.3 min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Génération Badge</span>
                <span className="text-sm text-gray-600">1.1 min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Traitement Colis</span>
                <span className="text-sm text-gray-600">3.7 min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Satisfaction</h2>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-green-600 mb-2">4.8</div>
            <div className="text-gray-600 mb-4">Note moyenne sur 5</div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const percentage = star === 5 ? 75 : star === 4 ? 20 : star === 3 ? 3 : star === 2 ? 1 : 1;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-6">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};