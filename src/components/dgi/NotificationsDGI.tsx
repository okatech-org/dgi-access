import React, { useState, useEffect } from 'react';
import { Bell, Calendar, User, AlertTriangle, CheckCircle, X, Clock } from 'lucide-react';
import { dgiData } from '../../services/dgi-data';

interface Notification {
  id: string;
  type: 'visite_rappel' | 'visite_confirmee' | 'conflit_horaire' | 'info';
  titre: string;
  message: string;
  date_creation: Date;
  date_evenement?: Date;
  personnel_concerne?: string[];
  lue: boolean;
  urgence: 'faible' | 'normale' | 'haute';
}

export const NotificationsDGI: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsNonLues, setNotificationsNonLues] = useState(0);

  useEffect(() => {
    // Générer des notifications basées sur les visites planifiées
    genererNotifications();
    
    // Rafraîchir les notifications toutes les minutes
    const interval = setInterval(genererNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const genererNotifications = () => {
    const visites = dgiData.getVisites();
    const personnel = dgiData.getPersonnel();
    const nouvellesNotifications: Notification[] = [];
    const maintenant = new Date();

    visites.forEach(visite => {
      const dateVisite = new Date(visite.date_prevue);
      const diffHeures = (dateVisite.getTime() - maintenant.getTime()) / (1000 * 60 * 60);
      const person = personnel.find(p => p.id === visite.personnel_id);

      // Rappel 24h avant
      if (diffHeures <= 24 && diffHeures > 23 && visite.statut === 'planifiee') {
        nouvellesNotifications.push({
          id: `rappel_24h_${visite.id}`,
          type: 'visite_rappel',
          titre: 'Visite prévue demain',
          message: `Visite avec ${person?.prenom} ${person?.nom} prévue le ${dateVisite.toLocaleDateString('fr-FR')} à ${visite.heure_prevue}`,
          date_creation: new Date(),
          date_evenement: dateVisite,
          personnel_concerne: [visite.personnel_id],
          lue: false,
          urgence: 'normale'
        });
      }

      // Rappel 2h avant
      if (diffHeures <= 2 && diffHeures > 1 && visite.statut === 'planifiee') {
        nouvellesNotifications.push({
          id: `rappel_2h_${visite.id}`,
          type: 'visite_rappel',
          titre: 'Visite imminente',
          message: `Visite avec ${person?.prenom} ${person?.nom} dans 2 heures (${visite.heure_prevue})`,
          date_creation: new Date(),
          date_evenement: dateVisite,
          personnel_concerne: [visite.personnel_id],
          lue: false,
          urgence: 'haute'
        });
      }

      // Confirmation de visite
      if (visite.statut === 'confirmee') {
        const notifExiste = notifications.some(n => n.id === `confirmee_${visite.id}`);
        if (!notifExiste) {
          nouvellesNotifications.push({
            id: `confirmee_${visite.id}`,
            type: 'visite_confirmee',
            titre: 'Visite confirmée',
            message: `La visite avec ${person?.prenom} ${person?.nom} a été confirmée pour le ${dateVisite.toLocaleDateString('fr-FR')}`,
            date_creation: new Date(),
            date_evenement: dateVisite,
            personnel_concerne: [visite.personnel_id],
            lue: false,
            urgence: 'normale'
          });
        }
      }
    });

    // Détecter les conflits d'horaires
    const conflits = detecterConflitsHoraires(visites);
    conflits.forEach((conflit, index) => {
      nouvellesNotifications.push({
        id: `conflit_${index}_${Date.now()}`,
        type: 'conflit_horaire',
        titre: 'Conflit d\'horaire détecté',
        message: `Conflit entre visites le ${conflit.date} à ${conflit.heure}`,
        date_creation: new Date(),
        personnel_concerne: conflit.personnel_ids,
        lue: false,
        urgence: 'haute'
      });
    });

    // Fusionner avec les notifications existantes (éviter les doublons)
    const notificationsExistantes = notifications.filter(n => 
      !nouvellesNotifications.some(nn => nn.id === n.id)
    );
    
    const toutesNotifications = [...nouvellesNotifications, ...notificationsExistantes]
      .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime())
      .slice(0, 50); // Garder les 50 plus récentes

    setNotifications(toutesNotifications);
    setNotificationsNonLues(toutesNotifications.filter(n => !n.lue).length);
  };

  const detecterConflitsHoraires = (visites: any[]) => {
    const conflits: any[] = [];
    const visitesParDate: Record<string, any[]> = {};

    // Grouper par date
    visites.forEach(visite => {
      const dateStr = new Date(visite.date_prevue).toISOString().split('T')[0];
      if (!visitesParDate[dateStr]) {
        visitesParDate[dateStr] = [];
      }
      visitesParDate[dateStr].push(visite);
    });

    // Détecter les conflits
    Object.entries(visitesParDate).forEach(([date, visitesJour]) => {
      for (let i = 0; i < visitesJour.length; i++) {
        for (let j = i + 1; j < visitesJour.length; j++) {
          const visite1 = visitesJour[i];
          const visite2 = visitesJour[j];
          
          if (visite1.heure_prevue === visite2.heure_prevue) {
            conflits.push({
              date,
              heure: visite1.heure_prevue,
              personnel_ids: [visite1.personnel_id, visite2.personnel_id]
            });
          }
        }
      }
    });

    return conflits;
  };

  const marquerCommeL = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, lue: true } : n
    ));
    setNotificationsNonLues(prev => Math.max(0, prev - 1));
  };

  const supprimerNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const marquerToutesCommeL = () => {
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
    setNotificationsNonLues(0);
  };

  const getIconeType = (type: string) => {
    switch (type) {
      case 'visite_rappel': return <Calendar className="h-4 w-4" />;
      case 'visite_confirmee': return <CheckCircle className="h-4 w-4" />;
      case 'conflit_horaire': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getCouleurUrgence = (urgence: string) => {
    switch (urgence) {
      case 'haute': return 'border-l-red-500 bg-red-50';
      case 'normale': return 'border-l-blue-500 bg-blue-50';
      case 'faible': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getTempsEcoule = (date: Date) => {
    const maintenant = new Date();
    const diffMs = maintenant.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHeures = Math.floor(diffMinutes / 60);
    const diffJours = Math.floor(diffHeures / 24);

    if (diffJours > 0) return `Il y a ${diffJours} jour${diffJours > 1 ? 's' : ''}`;
    if (diffHeures > 0) return `Il y a ${diffHeures} heure${diffHeures > 1 ? 's' : ''}`;
    if (diffMinutes > 0) return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    return 'À l\'instant';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Notifications & Rappels
            </h1>
            {notificationsNonLues > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notificationsNonLues}
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={marquerToutesCommeL}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={notificationsNonLues === 0}
            >
              Tout marquer comme lu
            </button>
            <button
              onClick={genererNotifications}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-lg font-bold text-gray-900">{notifications.length}</div>
          <div className="text-sm text-gray-600">Total notifications</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-200">
          <div className="text-lg font-bold text-red-900">{notificationsNonLues}</div>
          <div className="text-sm text-red-700">Non lues</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg shadow-sm border border-orange-200">
          <div className="text-lg font-bold text-orange-900">
            {notifications.filter(n => n.urgence === 'haute').length}
          </div>
          <div className="text-sm text-orange-700">Urgentes</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
          <div className="text-lg font-bold text-blue-900">
            {notifications.filter(n => n.type === 'visite_rappel').length}
          </div>
          <div className="text-sm text-blue-700">Rappels de visite</div>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune notification pour le moment</p>
            <p className="text-sm mt-2">Les rappels de visites apparaîtront ici automatiquement</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white border-l-4 rounded-lg shadow-sm p-4 ${getCouleurUrgence(notification.urgence)} ${
                !notification.lue ? 'shadow-md' : 'opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-full ${
                    notification.urgence === 'haute' ? 'bg-red-100 text-red-600' :
                    notification.urgence === 'normale' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getIconeType(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${!notification.lue ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.titre}
                      </h3>
                      {!notification.lue && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    
                    <p className={`text-sm ${!notification.lue ? 'text-gray-700' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{getTempsEcoule(notification.date_creation)}</span>
                      {notification.date_evenement && (
                        <span>
                          Événement: {new Date(notification.date_evenement).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                      {notification.urgence === 'haute' && (
                        <span className="text-red-600 font-medium">URGENT</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {!notification.lue && (
                    <button
                      onClick={() => marquerCommeL(notification.id)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Marquer comme lu
                    </button>
                  )}
                  <button
                    onClick={() => supprimerNotification(notification.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
