import React from 'react';
import { db } from '../../services/database';

export const BadgeModule: React.FC = () => {
  const visitors = db.getTodayVisitors();
  const active = visitors.filter((v) => v.status === 'checked-in');
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Badges actifs</h3>
      <ul className="list-disc pl-5 text-sm">
        {active.map((v) => (
          <li key={v.id}>Badge {v.badgeNumber} — {v.firstName} {v.lastName}</li>
        ))}
        {active.length === 0 && <li className="text-gray-500 list-none">Aucun badge actif</li>}
      </ul>
    </div>
  );
};


