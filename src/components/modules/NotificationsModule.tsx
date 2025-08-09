import React, { useMemo, useState } from 'react';
import { Bell, CheckCircle2, Clock, Filter, Mail, Trash2 } from 'lucide-react';

type NotificationType = 'system' | 'security' | 'user' | 'info';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export const NotificationsModule: React.FC = () => {
  const initialItems: NotificationItem[] = useMemo(
    () => [
      { id: 'n1', type: 'security', title: 'Tentative de connexion', message: '5 essais échoués détectés', createdAt: new Date().toISOString(), read: false },
      { id: 'n2', type: 'system', title: 'Sauvegarde terminée', message: 'Backup complet effectué avec succès', createdAt: new Date(Date.now() - 3_600_000).toISOString(), read: false },
      { id: 'n3', type: 'user', title: 'Nouveau compte', message: 'Compte créé: paul.obiang@impots.ga', createdAt: new Date(Date.now() - 6_600_000).toISOString(), read: true },
      { id: 'n4', type: 'info', title: 'Maintenance planifiée', message: 'Mise à jour système demain à 03:00', createdAt: new Date(Date.now() - 86_400_000).toISOString(), read: false },
    ],
    []
  );

  const [items, setItems] = useState<NotificationItem[]>(initialItems);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  const filtered = items.filter(i => (filter === 'all' ? true : i.type === filter));

  const markAllAsRead = () => setItems(prev => prev.map(i => ({ ...i, read: true })));
  const clearRead = () => setItems(prev => prev.filter(i => !i.read));

  const getBadgeColor = (type: NotificationType) => {
    switch (type) {
      case 'security':
        return 'bg-red-100 text-red-700';
      case 'system':
        return 'bg-blue-100 text-blue-700';
      case 'user':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-emerald-100 text-emerald-700';
    }
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleString('fr-FR');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Gérez les alertes système, sécurité et utilisateurs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={markAllAsRead} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Tout marquer comme lu
          </button>
          <button onClick={clearRead} className="px-3 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-700 text-sm flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Nettoyer lus
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Toutes</option>
            <option value="security">Sécurité</option>
            <option value="system">Système</option>
            <option value="user">Utilisateurs</option>
            <option value="info">Information</option>
          </select>
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.map((n) => (
            <div key={n.id} className="py-3 flex items-start gap-3">
              <div className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor(n.type)}`}>{n.type}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 truncate">{n.title}</p>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-1" />
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              Aucune notification pour ce filtre
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm text-emerald-900 flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Les notifications critiques sont automatiquement envoyées par email à l'Administration Système.
        </p>
      </div>
    </div>
  );
};

