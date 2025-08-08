import React from 'react';
import { db } from '../../services/database';
import { downloadCSV } from '../../utils/exportData';

export const ReportsModule: React.FC = () => {
  const visitors = db.getTodayVisitors();
  const employees = db.getEmployees();
  const today = new Date();

  const exportVisitors = () => downloadCSV(visitors as unknown as any[], 'visiteurs.csv');
  const exportEmployees = () => downloadCSV(employees as unknown as any[], 'personnel.csv');

  const topServices = () => {
    const counts: Record<string, number> = {};
    visitors.forEach((v) => {
      counts[v.serviceToVisit] = (counts[v.serviceToVisit] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([serviceId, count]) => ({ service: serviceId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const topEmployees = () => {
    const counts: Record<string, number> = {};
    visitors.forEach((v) => {
      counts[v.employeeToVisit] = (counts[v.employeeToVisit] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([empId, count]) => {
        const emp = employees.find((e) => e.id === empId);
        return { name: emp ? `${emp.firstName} ${emp.lastName}` : empId, service: emp?.service.name || '', visitors: count };
      })
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 3);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Rapport journalier — {today.toLocaleDateString('fr-FR')}</h3>
        <div className="text-sm text-gray-700">Total visiteurs: {visitors.length}</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-medium mb-1">Services les plus visités</div>
            <ul className="list-disc pl-5 text-sm">
              {topServices().map((s) => (
                <li key={s.service}>{s.service} — {s.count}</li>
              ))}
              {topServices().length === 0 && <li className="text-gray-500 list-none">Aucune donnée</li>}
            </ul>
          </div>
          <div>
            <div className="font-medium mb-1">Employés les plus visités</div>
            <ul className="list-disc pl-5 text-sm">
              {topEmployees().map((e) => (
                <li key={e.name}>{e.name} ({e.service}) — {e.visitors}</li>
              ))}
              {topEmployees().length === 0 && <li className="text-gray-500 list-none">Aucune donnée</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Exports</h3>
        <div className="flex gap-3">
          <button onClick={exportVisitors} className="px-4 py-2 bg-blue-600 text-white rounded">Exporter Visiteurs</button>
          <button onClick={exportEmployees} className="px-4 py-2 bg-gray-700 text-white rounded">Exporter Personnel</button>
        </div>
      </div>
    </div>
  );
};


