import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import { Calendar, ChevronDown, Loader2, Plus, Settings } from 'lucide-react';

type Tache = {
  id: number;
  titre: string;
  date_debut: string;
  date_fin: string;
  projet?: string;
};

// Fonction pour générer une couleur basée sur une chaîne de caractères
const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const baseColors = [
    '#4f46e5', // indigo
    '#0ea5e9', // sky
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ec4899', // pink
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#ef4444', // red
    '#84cc16', // lime
  ];
  
  return baseColors[Math.abs(hash) % baseColors.length];
};

const baseURL = 'http://localhost:8000/api/v1';

const CalendarPage: React.FC = () => {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedView, setSelectedView] = useState<string>('dayGridMonth');
  
  useEffect(() => {
    const fetchTaches = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}/taches/`, {
          headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
        });
        setTaches(response.data.taches);
      } catch (error) {
        console.error('Erreur lors du chargement des tâches', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTaches();
  }, []);

  useEffect(() => {
    const formattedEvents: EventInput[] = taches.map((tache) => {
      // Utiliser le nom du projet pour déterminer la couleur, ou utiliser le titre si pas de projet
      const baseColor = stringToColor(tache.projet || tache.titre);
      
      return {
        id: String(tache.id),
        title: tache.titre,
        start: tache.date_debut,
        end: tache.date_fin,
        backgroundColor: baseColor,
        borderColor: baseColor,
        extendedProps: {
          projet: tache.projet
        }
      };
    });
    setEvents(formattedEvents);
  }, [taches]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const tacheId = clickInfo.event.id;
    const tache = taches.find(t => t.id === parseInt(tacheId));
    
    if (tache) {
      const projetInfo = tache.projet ? `Projet: ${tache.projet}` : 'Aucun projet associé';
      const debut = new Date(tache.date_debut).toLocaleString('fr-FR');
      const fin = new Date(tache.date_fin).toLocaleString('fr-FR');
      
      alert(`Tâche: ${tache.titre}\n${projetInfo}\nDébut: ${debut}\nFin: ${fin}`);
    }
  };

  const handleDateClick = (dateInfo: DateClickArg) => {
    const formattedDate = new Date(dateInfo.date).toLocaleDateString('fr-FR');
    alert(`Créer une tâche le ${formattedDate}`);
  };

  const handleViewChange = (viewName: string) => {
    setSelectedView(viewName);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Calendar className="text-indigo-600 h-6 w-6 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">Calendrier de mes tâches</h1>
            </div>
            
            <div className="flex space-x-3">
              <button 
                className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition duration-150 shadow-sm"
                onClick={() => alert('Configuration du calendrier')}
              >
                <Settings className="h-4 w-4 mr-1" />
                <span>Paramètres</span>
              </button>
              
              <button 
                className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-150 shadow-sm"
                onClick={() => handleDateClick({ date: new Date(), dateStr: new Date().toISOString(), allDay: true, dayEl: document.createElement('div'), jsEvent: {} as any })}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Nouvelle tâche</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vue selector (mobile) */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <select 
              className="appearance-none w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedView}
              onChange={(e) => handleViewChange(e.target.value)}
            >
              <option value="dayGridMonth">Mois</option>
              <option value="timeGridWeek">Semaine</option>
              <option value="timeGridDay">Jour</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Calendrier */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={selectedView}
              locale="fr"
              headerToolbar={{
                start: 'prev,next today',
                center: 'title',
                end: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              buttonText={{
                today: "Aujourd'hui",
                month: 'Mois',
                week: 'Semaine',
                day: 'Jour'
              }}
              events={events}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              editable={true}
              selectable={true}
              height="auto"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }}
              firstDay={1} // La semaine commence le lundi
              dayMaxEvents={3} // Limite le nombre d'événements affichés par jour
              moreLinkText={count => `+ ${count} autres`}
              eventContent={(eventInfo) => {
                return (
                  <div className="w-full h-full px-1 py-1 overflow-hidden">
                    <div className="text-xs font-semibold truncate">{eventInfo.event.title}</div>
                    {eventInfo.event.extendedProps.projet && (
                      <div className="text-xs opacity-75 truncate">{eventInfo.event.extendedProps.projet}</div>
                    )}
                  </div>
                );
              }}
              viewDidMount={(viewInfo) => setSelectedView(viewInfo.view.type)}
            />
          )}
        </div>
        
        {/* Légende */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Projets</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(taches.map(t => t.projet).filter(Boolean))).map((projet, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1" 
                  style={{ backgroundColor: stringToColor(projet as string) }}
                ></div>
                <span className="text-xs text-gray-600">{projet}</span>
              </div>
            ))}
            {taches.filter(t => !t.projet).length > 0 && (
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-1 bg-gray-400"
                ></div>
                <span className="text-xs text-gray-600">Sans projet</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;