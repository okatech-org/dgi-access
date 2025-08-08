import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Users, Clock, CheckCircle, AlertTriangle, User, Package, Car as IdCard, Filter, RefreshCw, Loader, Eye } from 'lucide-react';
import { showToast } from '../../utils/toastManager';

export const VisitorStatsModule: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('visitors');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const statsData = {
    today: {
      visitors: 47,
      avgWaitTime: 15,
      activeVisitors: 12,
      badgesIssued: 8,
      packages: 3,
      satisfaction: 4.2
    },
    week: {
      visitors: 324,
      avgWaitTime: 18,
      activeVisitors: 12,
      badgesIssued: 56,
      packages: 18,
      satisfaction: 4.1
    },
    month: {
      visitors: 1456,
      avgWaitTime: 20,
      activeVisitors: 12,
      badgesIssued: 234,
      packages: 87,
      satisfaction: 4.0
    }
  };

  const visitorsData = [
    { day: 'Lun', visitors: 45, packages: 3, badges: 8 },
    { day: 'Mar', visitors: 52, packages: 5, badges: 12 },
    { day: 'Mer', visitors: 38, packages: 2, badges: 6 },
    { day: 'Jeu', visitors: 61, packages: 4, badges: 15 },
    { day: 'Ven', visitors: 47, packages: 3, badges: 8 },
    { day: 'Sam', visitors: 23, packages: 1, badges: 3 },
    { day: 'Dim', visitors: 15, packages: 0, badges: 2 }
  ];

  const serviceStats = [
    { service: 'Documentation', visitors: 145, percentage: 42 },
    { service: 'Passeports', visitors: 98, percentage: 28 },
    { service: 'Immigration', visitors: 67, percentage: 19 },
    { service: 'Administration', visitors: 38, percentage: 11 }
  ];

  const topVisitorTypes = [
    { type: 'Première demande CNI', count: 89, percentage: 26 },
    { type: 'Renouvellement passeport', count: 67, percentage: 19 },
    { type: 'Demande visa', count: 54, percentage: 16 },
    { type: 'Certificat nationalité', count: 43, percentage: 12 },
    { type: 'Duplicata CNI', count: 32, percentage: 9 },
    { type: 'Autres', count: 61, percentage: 18 }
  ];

  const hourlyDistribution = [
    { hour: '08h', visitors: 8 },
    { hour: '09h', visitors: 15 },
    { hour: '10h', visitors: 23 },
    { hour: '11h', visitors: 18 },
    { hour: '12h', visitors: 5 },
    { hour: '13h', visitors: 12 },
    { hour: '14h', visitors: 25 },
    { hour: '15h', visitors: 20 },
    { hour: '16h', visitors: 12 },
    { hour: '17h', visitors: 6 }
  ];

  const waitTimeStats = [
    { range: '0-5 min', count: 123, percentage: 36 },
    { range: '5-10 min', count: 98, percentage: 29 },
    { range: '10-15 min', count: 67, percentage: 20 },
    { range: '15-30 min', count: 34, percentage: 10 },
    { range: '30+ min', count: 17, percentage: 5 }
  ];

  const getCurrentStats = () => {
    return statsData[selectedPeriod as keyof typeof statsData];
  };

  const formatChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  // Gestionnaires d'événements
  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast.success('Données actualisées', 'Les statistiques ont été mises à jour');
    } catch (error) {
      showToast.error('Erreur d\'actualisation', 'Impossible de mettre à jour les statistiques');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    showToast.info('Période modifiée', `Affichage des données pour: ${period === 'today' ? 'aujourd\'hui' : period === 'week' ? 'cette semaine' : 'ce mois'}`);
  };

  const handleMetricClick = (metric: string) => {
    setSelectedMetric(metric);
    showToast.info('Métrique sélectionnée', `Focus sur: ${metric}`);
  };

  const handleExportDetailedReport = () => {
    try {
      setIsLoading(true);
      
      const reportData = {
        period: selectedPeriod,
        generatedAt: new Date().toISOString(),
        summary: getCurrentStats(),
        dailyData: visitorsData,
        serviceDistribution: serviceStats,
        visitorTypes: topVisitorTypes,
        hourlyDistribution: hourlyDistribution,
        waitTimeStats: waitTimeStats
      };

      const jsonReport = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonReport], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-statistiques-detaille-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast.dataExported('du rapport détaillé');
    } catch (error) {
      showToast.error('Erreur d\'export', 'Impossible d\'exporter le rapport détaillé');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-module="visitor-stats" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques Accueil</h1>
          <p className="text-gray-600">Analyse des flux et performance de l'accueil</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
          <button
            onClick={handleRefreshStats}
            disabled={isRefreshing}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
          <button
            onClick={() => {
              const csv = [
                ['Période','Visiteurs','Badges','Colis'].join(','),
                ['Aujourd\'hui', statsData.today.visitors, statsData.today.badgesIssued, statsData.today.packages].join(','),
                ['Semaine', statsData.week.visitors, statsData.week.badgesIssued, statsData.week.packages].join(','),
                ['Mois', statsData.month.visitors, statsData.month.badgesIssued, statsData.month.packages].join(',')
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'stats-accueil.csv';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              showToast.dataExported('des statistiques');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportDetailedReport}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            {isLoading ? 'Génération...' : 'Rapport détaillé'}
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div 
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all hover:shadow-md ${
            selectedMetric === 'visitors' ? 'ring-2 ring-blue-500 border-blue-200' : ''
          }`}
          onClick={() => handleMetricClick('visitors')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visiteurs</p>
              <p className="text-2xl font-bold text-blue-600">{getCurrentStats().visitors}</p>
              <p className="text-sm text-green-600 mt-1">+12% vs période précédente</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all hover:shadow-md ${
            selectedMetric === 'waitTime' ? 'ring-2 ring-orange-500 border-orange-200' : ''
          }`}
          onClick={() => handleMetricClick('waitTime')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Temps d'attente</p>
              <p className="text-2xl font-bold text-orange-600">{getCurrentStats().avgWaitTime} min</p>
              <p className="text-sm text-red-600 mt-1">+5% vs période précédente</p>
            </div>
            <div className="bg-orange-100 rounded-lg p-3">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all hover:shadow-md ${
            selectedMetric === 'active' ? 'ring-2 ring-green-500 border-green-200' : ''
          }`}
          onClick={() => handleMetricClick('active')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-green-600">{getCurrentStats().activeVisitors}</p>
              <p className="text-sm text-gray-600 mt-1">Temps réel</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Badges émis</p>
              <p className="text-2xl font-bold text-purple-600">{getCurrentStats().badgesIssued}</p>
              <p className="text-sm text-green-600 mt-1">+8% vs période précédente</p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <IdCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Colis reçus</p>
              <p className="text-2xl font-bold text-indigo-600">{getCurrentStats().packages}</p>
              <p className="text-sm text-green-600 mt-1">+15% vs période précédente</p>
            </div>
            <div className="bg-indigo-100 rounded-lg p-3">
              <Package className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Satisfaction</p>
              <p className="text-2xl font-bold text-yellow-600">{getCurrentStats().satisfaction}/5</p>
              <p className="text-sm text-green-600 mt-1">+3% vs période précédente</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visitors Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Flux Hebdomadaire</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">7 derniers jours</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {visitorsData.map((data, index) => (
              <div key={index} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors">
                <div className="flex items-center gap-4 w-20">
                  <span className="text-sm font-medium text-gray-900">{data.day}</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 cursor-pointer">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all hover:bg-blue-600" 
                      style={{ width: `${(data.visitors / 70) * 100}%` }}
                      title={`${data.visitors} visiteurs, ${data.badges} badges, ${data.packages} colis`}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{data.visitors}</span>
                  <button
                    onClick={() => showToast.info('Détails du jour', `${data.day}: ${data.visitors} visiteurs, ${data.badges} badges, ${data.packages} colis`)}
                    className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Répartition par Service</h3>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Cette semaine</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {serviceStats.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{service.service}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${service.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {service.visitors}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Visitor Types */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Types de Demandes Populaires</h3>
          
          <div className="space-y-3">
            {topVisitorTypes.map((type, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => showToast.info('Type de demande', `${type.type}: ${type.count} visiteurs (${type.percentage}%)`)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{type.type}</p>
                  <p className="text-xs text-gray-600">{type.count} visiteurs</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600">{type.percentage}%</span>
                  <Eye className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wait Time Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribution Temps d'Attente</h3>
          
          <div className="space-y-4">
            {waitTimeStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{stat.range}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index < 2 ? 'bg-green-500' : 
                        index < 4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {stat.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Affluence par Heure</h3>
        
        <div className="flex items-end justify-between gap-2 h-64">
          {hourlyDistribution.map((hour, index) => (
            <div key={index} className="flex flex-col items-center flex-1 group">
              <div 
                className="bg-blue-500 rounded-t-sm w-full relative cursor-pointer transition-colors hover:bg-blue-600"
                style={{ height: `${(hour.visitors / 25) * 100}%` }}
                onClick={() => showToast.info('Détails horaire', `${hour.hour}: ${hour.visitors} visiteurs`)}
                title={`${hour.hour}: ${hour.visitors} visiteurs`}
              >
                <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-900 group-hover:font-bold">
                  {hour.visitors}
                </span>
              </div>
              <span className="text-xs text-gray-600 mt-2 group-hover:font-medium">{hour.hour}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Pic d'affluence: 14h-15h • Période calme: 12h-13h
          </p>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Résumé des Performances</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Efficacité</h4>
            <p className="text-2xl font-bold text-green-600 mt-2">92%</p>
            <p className="text-sm text-gray-600 mt-1">Objectif: {'>'}90%</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Citoyens servis</h4>
            <p className="text-2xl font-bold text-blue-600 mt-2">324</p>
            <p className="text-sm text-gray-600 mt-1">Cette semaine</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Temps moyen</h4>
            <p className="text-2xl font-bold text-orange-600 mt-2">18 min</p>
            <p className="text-sm text-gray-600 mt-1">Objectif: {'<'}20 min</p>
          </div>
        </div>
      </div>
    </div>
  );
};