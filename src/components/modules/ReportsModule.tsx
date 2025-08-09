import React, { useState, useEffect } from 'react';
import { Calendar, Download, BarChart3, Users, TrendingUp, Clock } from 'lucide-react';
import { DailyReport } from '../../types/visitor';
import { db } from '../../services/database';

interface ReportCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  subtitle?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  </div>
);

interface DailyReportProps {
  report: DailyReport;
}

const DailyReportComponent: React.FC<DailyReportProps> = ({ report }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold text-gray-900">
        Rapport du {new Date(report.date).toLocaleDateString('fr-FR')}
      </h3>
      <div className="text-3xl font-bold text-blue-600">
        {report.totalVisitors} visiteurs
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Services */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-4">Services les plus visités</h4>
        <div className="space-y-3">
          {report.topServices.length > 0 ? (
            report.topServices.map((service, index) => (
              <div key={service.service} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="ml-3 font-medium">{service.service}</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {service.count} visiteur{service.count > 1 ? 's' : ''}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune visite enregistrée</p>
          )}
        </div>
      </div>

      {/* Top Employees */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-4">Employés les plus visités</h4>
        <div className="space-y-3">
          {report.topEmployees.length > 0 ? (
            report.topEmployees.map((employee, index) => (
              <div key={employee.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.service}</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {employee.visitors} visiteur{employee.visitors > 1 ? 's' : ''}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune visite enregistrée</p>
          )}
        </div>
      </div>
    </div>

    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center text-blue-800">
        <Clock className="w-5 h-5 mr-2" />
        <span className="font-medium">Durée moyenne des visites: {report.averageVisitDuration}</span>
      </div>
    </div>
  </div>
);

interface ExportSectionProps {
  onExportVisitors: () => void;
  onExportEmployees: () => void;
  onExportDaily: () => void;
}

const ExportSection: React.FC<ExportSectionProps> = ({ 
  onExportVisitors, 
  onExportEmployees, 
  onExportDaily 
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-bold text-gray-900 mb-4">Exportations</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        onClick={onExportVisitors}
        className="flex items-center justify-center gap-2 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors"
      >
        <Download className="w-5 h-5 text-green-600" />
        <div className="text-left">
          <div className="font-medium text-green-800">Export Visiteurs</div>
          <div className="text-sm text-green-600">Données complètes</div>
        </div>
      </button>

      <button
        onClick={onExportEmployees}
        className="flex items-center justify-center gap-2 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <Download className="w-5 h-5 text-blue-600" />
        <div className="text-left">
          <div className="font-medium text-blue-800">Export Personnel</div>
          <div className="text-sm text-blue-600">Liste complète</div>
        </div>
      </button>

      <button
        onClick={onExportDaily}
        className="flex items-center justify-center gap-2 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
      >
        <Download className="w-5 h-5 text-purple-600" />
        <div className="text-left">
          <div className="font-medium text-purple-800">Rapport Quotidien</div>
          <div className="text-sm text-purple-600">CSV détaillé</div>
        </div>
      </button>
    </div>
  </div>
);

interface WeeklyStatsProps {
  stats: {
    thisWeek: number;
    thisMonth: number;
    byService: Record<string, number>;
    byEmployee: Record<string, number>;
  };
}

const WeeklyStats: React.FC<WeeklyStatsProps> = ({ stats }) => {
  const topServices = Object.entries(stats.byService)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topEmployees = Object.entries(stats.byEmployee)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Statistiques Hebdomadaires</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">Services (Cette semaine)</h4>
          <div className="space-y-2">
            {topServices.map(([service, count]) => (
              <div key={service} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{service}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min((count / Math.max(...Object.values(stats.byService))) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-gray-800 mb-4">Employés (Total)</h4>
          <div className="space-y-2">
            {topEmployees.map(([employee, count]) => (
              <div key={employee} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{employee}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min((count / Math.max(...Object.values(stats.byEmployee))) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReportsModule: React.FC = () => {
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    thisWeek: 0,
    thisMonth: 0,
    byService: {} as Record<string, number>,
    byEmployee: {} as Record<string, number>
  });

  useEffect(() => {
    loadReports();
  }, [selectedDate]);

  const loadReports = () => {
    const date = new Date(selectedDate);
    const report = db.getDailyReport(date);
    const visitorStats = db.getVisitorStats();
    
    setDailyReport(report);
    setStats({
      thisWeek: visitorStats.thisWeek,
      thisMonth: visitorStats.thisMonth,
      byService: visitorStats.byService,
      byEmployee: visitorStats.byEmployee
    });
  };

  const exportVisitorsToCSV = () => {
    const visitors = db.getVisitors();
    const employees = db.getEmployees();
    const services = db.getServices();

    const headers = [
      'ID', 'Prénom', 'Nom', 'Société', 'Téléphone', 'Email', 
      'Type Pièce', 'Numéro Pièce', 'Motif', 'Employé Visité', 
      'Service', 'Heure Arrivée', 'Heure Départ', 'Statut', 
      'Badge', 'Durée Estimée'
    ];

    const csvData = [
      headers.join(','),
      ...visitors.map(visitor => {
        const employee = employees.find(e => e.id === visitor.employeeToVisit);
        const service = services.find(s => s.id === visitor.serviceToVisit);
        
        return [
          visitor.id,
          visitor.firstName,
          visitor.lastName,
          visitor.company || '',
          visitor.phone,
          visitor.email || '',
          visitor.idType,
          visitor.idNumber,
          visitor.purpose,
          employee ? `${employee.firstName} ${employee.lastName}` : '',
          service?.name || '',
          new Date(visitor.checkInTime).toLocaleString('fr-FR'),
          visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString('fr-FR') : '',
          visitor.status === 'checked-in' ? 'Présent' : 'Parti',
          visitor.badgeNumber,
          visitor.expectedDuration
        ].map(field => `"${field}"`).join(',');
      })
    ].join('\n');

    downloadCSV(csvData, `visiteurs_complet_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportEmployeesToCSV = () => {
    const employees = db.getEmployees();
    
    const headers = [
      'ID', 'Matricule', 'Prénom', 'Nom', 'Email', 'Téléphone',
      'Service', 'Code Service', 'Poste', 'Bureau', 'Étage', 
      'Statut', 'Date Création'
    ];

    const csvData = [
      headers.join(','),
      ...employees.map(employee => [
        employee.id,
        employee.matricule,
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.phone,
        employee.service.name,
        employee.service.code,
        employee.position,
        employee.office,
        employee.floor,
        employee.isActive ? 'Actif' : 'Inactif',
        new Date(employee.createdAt).toLocaleDateString('fr-FR')
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    downloadCSV(csvData, `personnel_complet_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportDailyReportToCSV = () => {
    if (!dailyReport) return;

    const headers = ['Type', 'Nom', 'Valeur'];
    const csvData = [
      headers.join(','),
      `"Rapport","Date","${dailyReport.date}"`,
      `"Rapport","Total Visiteurs","${dailyReport.totalVisitors}"`,
      `"Rapport","Durée Moyenne","${dailyReport.averageVisitDuration}"`,
      '',
      '"Services","Service","Nombre de Visiteurs"',
      ...dailyReport.topServices.map(service => 
        `"Services","${service.service}","${service.count}"`
      ),
      '',
      '"Employés","Nom","Service","Nombre de Visiteurs"',
      ...dailyReport.topEmployees.map(employee => 
        `"Employés","${employee.name}","${employee.service}","${employee.visitors}"`
      )
    ].join('\n');

    downloadCSV(csvData, `rapport_quotidien_${dailyReport.date}.csv`);
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Rapports et Statistiques</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ReportCard
          title="Visiteurs Aujourd'hui"
          value={dailyReport?.totalVisitors || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <ReportCard
          title="Cette Semaine"
          value={stats.thisWeek}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <ReportCard
          title="Ce Mois"
          value={stats.thisMonth}
          icon={BarChart3}
          color="bg-purple-500"
        />
        <ReportCard
          title="Durée Moyenne"
          value={dailyReport?.averageVisitDuration || '0 min'}
          icon={Clock}
          color="bg-orange-500"
        />
      </div>

      {dailyReport && <DailyReportComponent report={dailyReport} />}

      <WeeklyStats stats={stats} />

      <ExportSection
        onExportVisitors={exportVisitorsToCSV}
        onExportEmployees={exportEmployeesToCSV}
        onExportDaily={exportDailyReportToCSV}
      />
    </div>
  );
};
