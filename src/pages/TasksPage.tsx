import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUser } from '../api/auth'; // Assurez-vous que le chemin est correct
import { TaskAttachments } from './TaskAttachments';

// Types
interface Equipe {
  id: number;
  libelle: string;
}

interface User {
  id: number;
  nom_complet: string;
}

interface Projet {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  equipe_id: number;
  statut: string;
}

interface Jalon {
  id: number;
  titre: string;
  description: string;
  date_limite: string;
  projet_id: number;
  statut: string;
}

interface Tache {
  id: number;
  titre: string;
  description: string;
  priorite: string;
  statut: string;
  date_debut: string;
  date_fin: string;
  projet_id: number;
  user_id: number | null;
  jalon_id: number | null;
  tags_id: number | null;
}

const baseURL = 'http://localhost:8000/api/v1'; // URL de l'API

const TasksPage: React.FC = () => {
  // États
  const [projets, setProjets] = useState<Projet[]>([]);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [expandedTasks, setExpandedTasks] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Obtenir l'utilisateur actuel et ses tâches
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        // Récupérer l'utilisateur actuel
        const user= await getUser();
        setCurrentUserId(user.id);
        
        // Une fois que nous avons l'ID utilisateur, récupérer ses tâches
        await fetchUserTasks(user.id);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Impossible de charger vos informations. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Récupérer les tâches assignées à l'utilisateur
  const fetchUserTasks = async (userId: number) => {
    try {
      // Récupérer toutes les tâches assignées à l'utilisateur
      const tasksResponse = await axios.get(`${baseURL}/taches/taches_user`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTaches(tasksResponse.data.taches);

      // Récupérer les projets associés aux tâches
      const projectIds = [...new Set(tasksResponse.data.taches.map((task: Tache) => task.projet_id))];
      
      // Si l'utilisateur a des tâches assignées, récupérer les projets correspondants
      if (projectIds.length > 0) {
        const projectPromises = projectIds.map(id => 
          axios.get(`${baseURL}/projets/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
        );
        
        const projectResponses = await Promise.all(projectPromises);
        setProjets(projectResponses.map(response => response.data.projet));
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des tâches:', err);
      setError('Impossible de charger vos tâches. Veuillez réessayer.');
    }
  };

  // Basculer l'expansion d'une tâche
  const toggleTaskExpansion = (taskId: number) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Changer le statut d'une tâche
  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await axios.put(`${baseURL}/taches/updateStatut/${taskId}`, 
        { statut: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      
      // Mettre à jour l'état local après la mise à jour réussie
      setTaches(prev => prev.map(task => 
        task.id === taskId ? { ...task, statut: newStatus } : task
      ));
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      alert('Impossible de mettre à jour le statut de la tâche. Veuillez réessayer.');
    }
  };

  // Filtrer les tâches en fonction du filtre actif
  const filteredTasks = taches.filter(tache => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return tache.date_fin === today;
    }
    if (activeFilter === 'week') {
      const today = new Date();
      const oneWeekLater = new Date();
      oneWeekLater.setDate(today.getDate() + 7);
      const taskDate = new Date(tache.date_fin);
      return taskDate >= today && taskDate <= oneWeekLater;
    }
    if (activeFilter === 'late') {
      const today = new Date();
      const taskDate = new Date(tache.date_fin);
      return taskDate < today && tache.statut !== 'Terminé';
    }
    return tache.statut === activeFilter;
  });

  // Obtenir le projet correspondant à une tâche
  const getProjectForTask = (projectId: number) => {
    return projets.find(project => project.id === projectId);
  };

  // Obtenir la couleur du statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'À faire':
        return 'bg-blue-100 text-blue-800';
      case 'En cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'Terminé':
        return 'bg-green-100 text-green-800';
      case 'En retard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtenir la couleur de la priorité
  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'Basse':
        return 'bg-green-100 text-green-800';
      case 'Normale':
        return 'bg-blue-100 text-blue-800';
      case 'Haute':
        return 'bg-yellow-100 text-yellow-800';
      case 'Urgente':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Grouper les tâches par projet
  const tasksByProject = filteredTasks.reduce((acc: { [key: number]: Tache[] }, task: Tache) => {
    if (!acc[task.projet_id]) {
      acc[task.projet_id] = [];
    }
    acc[task.projet_id].push(task);
    return acc;
  }, {});

  // Vérifier si la date est dépassée
  const isDateOverdue = (dateStr: string) => {
    const today = new Date();
    const taskDate = new Date(dateStr);
    return taskDate < today;
  };

  // Formater la date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Chargement de vos tâches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow max-w-md w-full">
          <div className="text-center text-red-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">Erreur</h3>
          <p className="text-gray-600 text-center">{error}</p>
          <div className="mt-4 text-center">
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">Gestionnaire de Projets</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="/projects" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Projets
                </a>
                <a href="/my-tasks" className="border-blue-500 text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Mes Tâches
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes Tâches</h2>
            <p className="mt-1 text-sm text-gray-500">
              Consultez et gérez vos tâches assignées dans différents projets.
            </p>
          </div>

          {/* Filtres */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setActiveFilter('today')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'today' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Pour aujourd'hui
              </button>
              <button
                onClick={() => setActiveFilter('week')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'week' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Cette semaine
              </button>
              <button
                onClick={() => setActiveFilter('late')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'late' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                En retard
              </button>
              <button
                onClick={() => setActiveFilter('À faire')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'À faire' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                À faire
              </button>
              <button
                onClick={() => setActiveFilter('En cours')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'En cours' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                En cours
              </button>
              <button
                onClick={() => setActiveFilter('Terminé')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeFilter === 'Terminé' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Terminé
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Total</h3>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{taches.length}</p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">À faire</h3>
              <p className="mt-1 text-3xl font-semibold text-blue-600">
                {taches.filter(t => t.statut === 'À faire').length}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">En cours</h3>
              <p className="mt-1 text-3xl font-semibold text-yellow-600">
                {taches.filter(t => t.statut === 'En cours').length}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500">Terminé</h3>
              <p className="mt-1 text-3xl font-semibold text-green-600">
                {taches.filter(t => t.statut === 'Terminé').length}
              </p>
            </div>
          </div>

          {/* Tâches par projet */}
          {Object.keys(tasksByProject).length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
              <p className="text-gray-500">
                {activeFilter === 'all' 
                  ? "Vous n'avez aucune tâche assignée pour le moment." 
                  : "Aucune tâche ne correspond aux critères sélectionnés."}
              </p>
            </div>
          ) : (
            Object.entries(tasksByProject).map(([projectId, projectTasks]) => {
              const project = getProjectForTask(parseInt(projectId));
              return (
                <div key={projectId} className="bg-white shadow rounded-lg mb-6 overflow-hidden">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {project ? project.titre : "Projet inconnu"}
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {projectTasks.map(task => (
                      <li key={task.id} className="hover:bg-gray-50">
                        <div className="px-6 py-4">
                          <div 
                            className="flex justify-between items-start cursor-pointer"
                            onClick={() => toggleTaskExpansion(task.id)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h4 className="text-base font-medium text-gray-900">{task.titre}</h4>
                                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priorite)}`}>
                                  {task.priorite}
                                </span>
                                {isDateOverdue(task.date_fin) && task.statut !== 'Terminé' && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    En retard
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <span>Échéance: {formatDate(task.date_fin)}</span>
                                <span className="mx-2">•</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.statut)}`}>
                                  {task.statut}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <button
                                className="text-gray-400 hover:text-gray-500"
                                aria-expanded={expandedTasks.includes(task.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform ${expandedTasks.includes(task.id) ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Détails de la tâche */}
                          {expandedTasks.includes(task.id) && (
                            <div className="mt-4 bg-gray-50 p-4 rounded-md">
                              <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-500">Date de début</p>
                                  <p className="text-sm font-medium">{formatDate(task.date_debut)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Date d'échéance</p>
                                  <p className="text-sm font-medium">{formatDate(task.date_fin)}</p>
                                </div>
                              </div>
                              
                              {/* Composant des pièces jointes */}
                              <TaskAttachments 
                                tache={task} 
                                onUpdate={() => {
                                  fetchTaskDetails(task.id);
                                }} 
                              />
                              <div className="mt-4 flex justify-end space-x-2">
                                {task.statut !== 'En cours' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTaskStatus(task.id, 'En cours');
                                    }}
                                    className="px-3 py-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded text-sm font-medium"
                                  >
                                    Commencer
                                  </button>
                                )}
                                {task.statut !== 'Terminé' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTaskStatus(task.id, 'Terminé');
                                    }}
                                    className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 rounded text-sm font-medium"
                                  >
                                    Terminer
                                  </button>
                                )}
                                {task.statut === 'Terminé' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTaskStatus(task.id, 'À faire');
                                    }}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-sm font-medium"
                                  >
                                    Rouvrir
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;