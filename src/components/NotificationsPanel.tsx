import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Types pour nos notifications
interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const NotificationsPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadinge, setLoadinge] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  const hasUnreadNotifications = unreadCount > 0;

  // Formater la date de la notification (ex: "Il y a 5 min")
  const formatNotificationTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "À l'instant";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  // Récupérer les notifications depuis l'API
  const fetchNotifications = async () => {
    try {
      setLoadinge(true);
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications);
      
      // Calculer le nombre de notifications non lues
      const unread = response.data.notifications.filter(
        (notification: Notification) => !notification.read
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setLoadinge(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (id: number) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      
      // Mettre à jour l'état local sans refaire un appel API
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
      
      // Mettre à jour le compteur de notifications non lues
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      
      // Mettre à jour l'état local sans refaire un appel API
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  };

  // Charger les notifications au chargement du composant
  useEffect(() => {
    fetchNotifications();
    
    // Optionnel: Configurer un polling pour rafraîchir régulièrement les notifications
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // Rafraîchir toutes les minutes
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="bg-white p-6 rounded-xl shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
        {hasUnreadNotifications && (
          <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
            {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
     
      {loadinge ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`flex items-start p-3 border-b border-gray-100 ${!notification.read ? 'bg-blue-50 rounded-lg' : ''} cursor-pointer hover:bg-gray-50 transition duration-150`}
            >
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-800">{notification.title}</h3>
                  <span className="text-xs text-gray-500">{formatNotificationTime(notification.created_at)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              </div>
            </div>
          ))}
         
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 transition duration-200 flex items-center"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Marquer tout comme lu
            </button>
            <a
              href="/notifications"
              className="text-sm text-blue-600 hover:text-blue-800 transition duration-200 flex items-center"
            >
              Voir tout
              <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="mt-4 text-gray-500">Vous n'avez pas de notifications</p>
        </div>
      )}
    </section>
  );
};

export default NotificationsPanel;