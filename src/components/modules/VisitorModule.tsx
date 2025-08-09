import React from 'react';
import { db } from '../../services/database';
import { VisitorRegistrationFormSimple as VisitorRegistrationForm } from '../visitor/VisitorRegistrationForm';

const TodayVisitors: React.FC = () => {
  const visitors = db.getTodayVisitors();
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Visiteurs du jour</h3>
      <div className="divide-y">
        {visitors.map((v) => (
          <div key={v.id} className="py-2 text-sm">
            <div className="font-medium">{v.firstName} {v.lastName} — Badge {v.badgeNumber}</div>
            <div className="text-gray-600">Entrée: {new Date(String(v.checkInTime)).toLocaleTimeString('fr-FR')} — Statut: {v.status}</div>
          </div>
        ))}
        {visitors.length === 0 && <div className="text-sm text-gray-500">Aucun visiteur pour le moment.</div>}
      </div>
    </div>
  );
};

export const VisitorModule: React.FC = () => {
  const services = db.getServices();
  const employees = db.getEmployees();
  const handleRegisterVisitor = async () => {
    window.dispatchEvent(new Event('force-update'));
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <VisitorRegistrationForm employees={employees} services={services} onSubmit={handleRegisterVisitor} />
      <TodayVisitors />
    </div>
  );
};


