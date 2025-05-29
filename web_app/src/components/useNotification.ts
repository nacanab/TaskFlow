import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Types pour nos notifications
export interface Notification {
  id: number;
  tache_id: number;
  contenu: string;
  est_lu: boolean;
  created_at: string;
}

 const baseURL = "http://127.0.0.1:8000/api/v1";
 const token = localStorage.getItem('token');
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadinge, setLoadinge] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Récupérer les notifications depuis l'API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoadinge(true);
      setError(null);
      
      const response = await axios.get(`${baseURL}/notifications/`, {
        headers: {
          'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
      });
      
      setNotifications(response.data.notifications);
      
      // Calculer le nombre de notifications non lues
      const unread = response.data.notifications.filter(
        (notification: Notification) => !notification.est_lu
      ).length;
      
      setUnreadCount(unread);
    } catch (err) {
      setError('Erreur lors de la récupération des notifications');
      console.error('Erreur lors de la récupération des notifications:', err);
    } finally {
      setLoadinge(false);
    }
  }, []);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (id: number) => {
    try {
      await axios.post(`${baseURL}/notifications/mark_as_read/${id}`, {}, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });
      
      // Mettre à jour l'état local sans refaire un appel API
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      
      // Mettre à jour le compteur de notifications non lues
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error('Erreur lors du marquage de la notification:', err);
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.post(`${baseURL}/notifications/mark_all_as_read}`, {}, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      });
      
      // Mettre à jour l'état local sans refaire un appel API
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications:', err);
    }
  }, []);

  // Formater la date de la notification
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

  // Charger les notifications au chargement du composant
  useEffect(() => {
    fetchNotifications();
    
    // Configurer un polling pour rafraîchir régulièrement les notifications
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // Rafraîchir toutes les minutes
    
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  return {
    notifications,
    loadinge,
    error,
    unreadCount,
    hasUnreadNotifications: unreadCount > 0,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    formatNotificationTime
  };
};