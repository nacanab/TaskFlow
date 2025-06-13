import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {File} from 'lucide-react';
import { getUser } from '../api/auth';

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
  user_id:number;
}

interface Jalon {
  id: number;
  libelle: string;
  description: string;
  projet_id: number;
  statut: string;
}

interface PieceJointe {
  id: number;
  type: string;
  fichier_url: string;
  tache_id: number;
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
  pieces_jointes?: PieceJointe[]; // Ajout des pièces jointes
}

const baseURL = 'http://localhost:8000/api/v1'; // Remplacez par l'URL de votre API
const user=getUser();
const piecesJointesApi = {

  fetchPiecesJointes: async (tacheId:number) => {
    try {
      const response = await axios.get(`${baseURL}/pieces_jointes/taches/${tacheId}`);
      return await response.data.pieces_jointes;
    } catch (error) {
      console.error('Erreur API:', error);
      return [];
    }
  },

  // Télécharger une pièce jointe
  downloadPieceJointe: async (pieceJointe:PieceJointe) => {
    try {
      const response = await fetch(`/api/pieces-jointes/${pieceJointe.id}/download`);
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      
      // Récupérer le blob et créer un lien de téléchargement
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  }
};

const getFileIcon = (type:String) => {
  switch (type.toLowerCase()) {
    case 'pdf': return <File className="w-4 h-4 text-red-500" />;
    case 'doc':
    case 'docx': return <File className="w-4 h-4 text-blue-600" />;
    case 'xls':
    case 'xlsx': return <File className="w-4 h-4 text-green-600" />;
    case 'jpg':
    case 'jpeg':
    case 'png': 
    case 'gif': return <File className="w-4 h-4 text-purple-500" />;
    case 'zip':
    case 'rar': return <File className="w-4 h-4 text-orange-500" />;
    default: return <File className="w-4 h-4 text-gray-500" />;
  }
};
const ProjectPage: React.FC = () => {
  // États
  const [projets, setProjets] = useState<Projet[]>([]);
  const [jalons, setJalons] = useState<Jalon[]>([]);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [membres, setMembres] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('projets');
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);

  // États pour les formulaires
  const [projetForm, setProjetForm] = useState({
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    equipe_id: 0,
  });
  
  const [jalonForm, setJalonForm] = useState({
    libelle: '',
    description: '',
    projet_id: 0,
    statut: 'A faire'
  });
  
  const [tacheForm, setTacheForm] = useState({
    titre: '',
    description: '',
    priorite: 'Normale',
    statut: 'A faire',
    date_debut: '',
    date_fin: '',
    projet_id: 0,
    user_id: null as number | null,
    jalon_id: null as number | null,
    tags_id: null as number | null
  });

  // Modals
  const [projetModalOpen, setProjetModalOpen] = useState(false);
  const [jalonModalOpen, setJalonModalOpen] = useState(false);
  const [tacheModalOpen, setTacheModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Chargement des données
  useEffect(() => {
    fetchProjets();
    fetchEquipes();
    fetchMembres();
  }, []);

  useEffect(() => {
    if (selectedProjet) {
      fetchJalons(selectedProjet.id);
      fetchTaches(selectedProjet.id);
    }
  }, [selectedProjet]);

  // Fonctions de récupération de données
  const fetchProjets = async () => {
    try {
      const response = await axios.get(`${baseURL}/projets/`,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setProjets(response.data.projets);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
    }
  };

  const fetchEquipes = async () => {
    try {
      const response = await axios.get(`${baseURL}/equipes/equipes_user`,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setEquipes(response.data.equipes);
    } catch (error) {
      console.error('Erreur lors de la récupération des équipes:', error);
    }
  };

  const fetchMembres = async () => {
    try {
      const response = await axios.get(`${baseURL}/users`,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setMembres(response.data.users);
    } catch (error) {
      console.error('Erreur lors de la récupération des membres:', error);
    }
  };

  const fetchJalons = async (projetId: number) => {
    try {
      const response = await axios.get(`${baseURL}/jalons/projet_jalons/${projetId}`,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setJalons(response.data.jalons);
    } catch (error) {
      console.error('Erreur lors de la récupération des jalons:', error);
    }
  };

  const fetchTaches = async (projetId: number) => {
    try {
      const response = await axios.get(`${baseURL}/taches?projet_id=${projetId}`,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      const tachesAvecPJ = await Promise.all(response.data.taches.map(async (tache:Tache) => {
        const piecesJointes = await piecesJointesApi.fetchPiecesJointes(tache.id);
        return { ...tache, pieces_jointes: piecesJointes };
      }));
      setTaches(tachesAvecPJ);
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
    }
  };

  // Handlers de formulaires
  const handleProjetChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjetForm(prev => ({
      ...prev,
      [name]: name === 'equipe_id' ? parseInt(value) : value
    }));
  };

  const handleJalonChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJalonForm(prev => ({
      ...prev,
      [name]: name === 'projet_id' ? parseInt(value) : value
    }));
  };

  const handleTacheChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTacheForm(prev => ({
      ...prev,
      [name]: ['projet_id', 'user_id', 'jalon_id', 'tags_id'].includes(name) ? (value ? parseInt(value) : null) : value
    }));
  };

  // Soumission des formulaires
  const handleProjetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && editId) {
        await axios.put(`${baseURL}/projets/update/${editId}`, projetForm,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      } else {
        await axios.post(`${baseURL}/projets/create`, projetForm,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }
      setProjetModalOpen(false);
      setProjetForm({
        titre: '',
        description: '',
        date_debut: '',
        date_fin: '',
        equipe_id: 0,
      });
      setEditMode(false);
      setEditId(null);
      fetchProjets();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du projet:', error);
    }
  };

  const handleJalonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && editId) {
        await axios.put(`${baseURL}/jalons/update/${editId}`, jalonForm,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      } else {
        await axios.post(`${baseURL}/jalons/create`, jalonForm,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }
      setJalonModalOpen(false);
      setJalonForm({
        libelle: '',
        description: '',
        projet_id: selectedProjet?.id || 0,
        statut: 'A faire'
      });
      setEditMode(false);
      setEditId(null);
      if (selectedProjet) {
        fetchJalons(selectedProjet.id);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du jalon:', error);
    }
  };

  const handleTacheSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && editId) {
        await axios.put(`${baseURL}/taches/update/${editId}`, tacheForm,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      } else {
        await axios.post(`${baseURL}/taches/create`, tacheForm,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      }
      setTacheModalOpen(false);
      setTacheForm({
        titre: '',
        description: '',
        priorite: 'Normale',
        statut: 'À faire',
        date_debut: '',
        date_fin: '',
        projet_id: selectedProjet?.id || 0,
        user_id: null,
        jalon_id: null,
        tags_id: null
      });
      setEditMode(false);
      setEditId(null);
      if (selectedProjet) {
        fetchTaches(selectedProjet.id);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la tâche:', error);
    }
  };

  // Fonctions pour modifier et supprimer
  const editProjet = (projet: Projet) => {
    setProjetForm({
      titre: projet.titre,
      description: projet.description,
      date_debut: projet.date_debut,
      date_fin: projet.date_fin,
      equipe_id: projet.equipe_id,
    });
    setEditMode(true);
    setEditId(projet.id);
    setProjetModalOpen(true);
  };

  const editJalon = (jalon: Jalon) => {
    setJalonForm({
      libelle: jalon.libelle,
      description: jalon.description,
      projet_id: jalon.projet_id,
      statut: jalon.statut
    });
    setEditMode(true);
    setEditId(jalon.id);
    setJalonModalOpen(true);
  };

  const editTache = (tache: Tache) => {
    setTacheForm({
      titre: tache.titre,
      description: tache.description,
      priorite: tache.priorite,
      statut: tache.statut,
      date_debut: tache.date_debut,
      date_fin: tache.date_fin,
      projet_id: tache.projet_id,
      user_id: tache.user_id,
      jalon_id: tache.jalon_id,
      tags_id: tache.tags_id
    });
    setEditMode(true);
    setEditId(tache.id);
    setTacheModalOpen(true);
  };

  const deleteProjet = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
      try {
        await axios.delete( `${baseURL}/projets/delete/${id}`,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        fetchProjets();
        if (selectedProjet && selectedProjet.id === id) {
          setSelectedProjet(null);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
      }
    }
  };

  const deleteJalon = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce jalon?')) {
      try {
        await axios.delete( `${baseURL}/jalons/delete/${id}`,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        if (selectedProjet) {
          fetchJalons(selectedProjet.id);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du jalon:', error);
      }
    }
  };

  const deleteTache = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche?')) {
      try {
        await axios.delete( `${baseURL}/taches/delete/${id}`,{ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        if (selectedProjet) {
          fetchTaches(selectedProjet.id);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
      }
    }
  };

  const downloadPieceJointe = (pieceJointe:PieceJointe) => {
    piecesJointesApi.downloadPieceJointe(pieceJointe);
  };

  // Pour démarrer un nouveau formulaire
  const startNewProjet = () => {
    setProjetForm({
      titre: '',
      description: '',
      date_debut: '',
      date_fin: '',
      equipe_id: 0,
    });
    setEditMode(false);
    setEditId(null);
    setProjetModalOpen(true);
  };

  const startNewJalon = () => {
    setJalonForm({
      libelle: '',
      description: '',
      projet_id: selectedProjet?.id || 0,
      statut: 'À faire'
    });
    setEditMode(false);
    setEditId(null);
    setJalonModalOpen(true);
  };

  const startNewTache = () => {
    setTacheForm({
      titre: '',
      description: '',
      priorite: 'Normale',
      statut: 'À faire',
      date_debut: '',
      date_fin: '',
      projet_id: selectedProjet?.id || 0,
      user_id: null,
      jalon_id: null,
      tags_id: null
    });
    setEditMode(false);
    setEditId(null);
    setTacheModalOpen(true);
  };

  // Gestion d'un projet sélectionné
  const handleProjetSelect = (projet: Projet) => {
    setSelectedProjet(projet);
    setActiveTab('details');
  };

  // Obtenir le libelle de l'équipe à partir de l'ID
  const getEquipelibelle = (equipeId: number) => {
    const equipe = equipes.find(e => e.id === equipeId);
    return equipe ? equipe.libelle : 'Inconnu';
  };

  // Obtenir le libelle du membre à partir de l'ID
  const getMembrelibelle = (userId: number | null) => {
    if (!userId) return 'Non assigné';
    const membre = membres.find(m => m.id === userId);
    return membre ? membre.nom_complet : 'Inconnu';
  };

  // Obtenir le libelle du jalon à partir de l'ID
  const getJalonTitre = (jalonId: number | null) => {
    if (!jalonId) return 'Aucun jalon';
    const jalon = jalons.find(j => j.id === jalonId);
    return jalon ? jalon.libelle : 'Inconnu';
  };

  // Couleurs des statuts
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

  // Couleurs des priorités
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
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-4 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('projets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projets' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projets
            </button>
            {selectedProjet && (
              localStorage.setItem('projet_team', selectedProjet.equipe_id.toString()),
              <button 
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'details' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Détails du Projet
              </button>
            )}
          </nav>
        </div>

        {/* Contenu des tabs */}
        <div className="mt-6">
          {/* Liste des projets */}
          {activeTab === 'projets' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Liste des Projets</h2>
                <button 
                  onClick={startNewProjet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Nouveau Projet
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projets.map(projet => (
                  <div 
                    key={projet.id} 
                    className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleProjetSelect(projet)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900">{projet.titre}</h3>
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            editProjet(projet);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProjet(projet.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-500 mt-2 text-sm line-clamp-2">{projet.description}</p>
                    <div className="mt-4 flex justify-between text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Équipe:</span> {getEquipelibelle(projet.equipe_id)}
                      </div>
                      <div>
                        <span className="font-medium">Du</span> {new Date(projet.date_debut).toLocaleDateString()} <span className="font-medium">au</span> {new Date(projet.date_fin).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          { projets.length === 0 && activeTab === 'projets' && (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune projet trouvé</h3>
            </div>
          )}
          

          {/* Détails du projet */}
          {activeTab === 'details' && selectedProjet && (
            <div>
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedProjet.titre}</h2>
                    <p className="text-gray-500 mt-2">{selectedProjet.description}</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Équipe:</span> {getEquipelibelle(selectedProjet.equipe_id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Date de début:</span> {new Date(selectedProjet.date_debut).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Date de fin:</span> {new Date(selectedProjet.date_fin).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Jalons */}
              
              <div className="mt-8">
              
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Jalons</h3>
                  {selectedProjet.user_id==user.id && (
                  <button 
                    onClick={startNewJalon}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Nouveau Jalon
                  </button>
                )}
                </div>
                
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Libellé
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        {selectedProjet.user_id==user.id && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>)}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {jalons.filter(j => j.projet_id === selectedProjet.id).map(jalon => (
                        <tr key={jalon.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{jalon.libelle}</div>
                            <div className="text-sm text-gray-500">{jalon.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(jalon.statut)}`}>
                              {jalon.statut}
                            </span>
                          </td>
                          {selectedProjet.user_id==user.id && (
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => editJalon(jalon)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Modifier
                            </button>
                            <button 
                              onClick={() => deleteJalon(jalon.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Supprimer
                            </button>
                          </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tâches */}
              <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Tâches</h3>
                    {selectedProjet.user_id==user.id && (
                    <button
                      onClick={startNewTache}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Nouvelle Tâche
                    </button>
                    )}
                  </div>
                  
                  {taches.length === 0 ? (
                    <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                      Aucune tâche pour ce projet
                    </div>
                  ) : (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Titre
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assigné à
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Jalon
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Priorité
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Statut
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Pièces jointes
                            </th>
                            {selectedProjet.user_id==user.id && (
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {taches.filter(t => t.projet_id === selectedProjet.id).map(tache => (
                            <tr key={tache.id}>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{tache.titre}</div>
                                <div className="text-sm text-gray-500">{tache.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{getMembrelibelle(tache.user_id)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{getJalonTitre(tache.jalon_id)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(tache.priorite)}`}>
                                  {tache.priorite}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tache.statut)}`}>
                                  {tache.statut}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col space-y-1">
                                  {tache.pieces_jointes && tache.pieces_jointes.length > 0 ? (
                                    <div className="mt-1">
                                      <p className="text-xs text-gray-500 mb-1">Pièces jointes ({tache.pieces_jointes.length})</p>
                                      <div className="flex flex-wrap gap-2">
                                        {tache.pieces_jointes.map(pj => {
                                          const fileName = pj.fichier_url.split('/').pop();
                                          return (
                                            <div key={pj.id} className="flex items-center bg-gray-50 rounded px-2 py-1 text-xs">
                                              {getFileIcon(fileName.split('.').pop().toLowerCase())}
                                              <button
                                                onClick={() => downloadPieceJointe(pj)}
                                                className="ml-1 text-blue-600 hover:text-blue-800 hover:underline truncate max-w-40"
                                                title={fileName}
                                              >
                                                {fileName}
                                              </button>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">Aucune</span>
                                  )}
                                </div>
                              </td>
                              {selectedProjet.user_id==user.id && (
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => editTache(tache)}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => deleteTache(tache.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Supprimer
                                </button>
                              </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Modal Projet */}
      {projetModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editMode ? 'Modifier le Projet' : 'Nouveau Projet'}
                    </h3>
                    <div className="mt-6">
                      <form onSubmit={handleProjetSubmit}>
                        <div className="mb-4">
                          <label htmlFor="titre" className="block text-sm font-medium text-gray-700">Titre</label>
                          <input
                            type="text"
                            name="titre"
                            id="titre"
                            value={projetForm.titre}
                            onChange={handleProjetChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            value={projetForm.description}
                            onChange={handleProjetChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          ></textarea>
                        </div>
                        <div className="mb-4">
                          <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700">Date de début</label>
                          <input
                            type="date"
                            name="date_debut"
                            id="date_debut"
                            value={projetForm.date_debut}
                            onChange={handleProjetChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700">Date de fin</label>
                          <input
                            type="date"
                            name="date_fin"
                            id="date_fin"
                            value={projetForm.date_fin}
                            onChange={handleProjetChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="equipe_id" className="block text-sm font-medium text-gray-700">Équipe</label>
                          <select
                            name="equipe_id"
                            id="equipe_id"
                            value={projetForm.equipe_id}
                            onChange={handleProjetChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          >
                            <option value="">Sélectionner une équipe</option>
                            {equipes.map(equipe => (
                              <option key={equipe.id} value={equipe.id}>{equipe.libelle}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mt-6 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            {editMode ? 'Modifier' : 'Créer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setProjetModalOpen(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Jalon */}
      {jalonModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editMode ? 'Modifier le Jalon' : 'Nouveau Jalon'}
                    </h3>
                    <div className="mt-6">
                      <form onSubmit={handleJalonSubmit}>
                        <div className="mb-4">
                          <label htmlFor="titre" className="block text-sm font-medium text-gray-700">Titre</label>
                          <input
                            type="text"
                            name="libelle"
                            id="libelle"
                            value={jalonForm.libelle}
                            onChange={handleJalonChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            value={jalonForm.description}
                            onChange={handleJalonChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          ></textarea>
                        </div>
                        <div className="mb-4">
                          <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
                          <select
                            name="statut"
                            id="statut"
                            value={jalonForm.statut}
                            onChange={handleJalonChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="A faire">A faire</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        </div>
                        <input
                          type="hidden"
                          name="projet_id"
                          value={selectedProjet?.id || 0}
                        />
                        <div className="mt-6 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            {editMode ? 'Modifier' : 'Créer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setJalonModalOpen(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tâche */}
      {tacheModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editMode ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
                    </h3>
                    <div className="mt-6">
                      <form onSubmit={handleTacheSubmit}>
                        <div className="mb-4">
                          <label htmlFor="titre" className="block text-sm font-medium text-gray-700">Titre</label>
                          <input
                            type="text"
                            name="titre"
                            id="titre"
                            value={tacheForm.titre}
                            onChange={handleTacheChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                          <textarea
                            name="description"
                            id="description"
                            rows={3}
                            value={tacheForm.description}
                            onChange={handleTacheChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          ></textarea>
                        </div>
                        <div className="mb-4">
                          <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700">Date de début</label>
                          <input
                            type="date"
                            name="date_debut"
                            id="date_debut"
                            value={tacheForm.date_debut}
                            onChange={handleTacheChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700">Date de fin</label>
                          <input
                            type="date"
                            name="date_fin"
                            id="date_fin"
                            value={tacheForm.date_fin}
                            onChange={handleTacheChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label htmlFor="priorite" className="block text-sm font-medium text-gray-700">Priorité</label>
                          <select
                            name="priorite"
                            id="priorite"
                            value={tacheForm.priorite}
                            onChange={handleTacheChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="Basse">Basse</option>
                            <option value="Normale">Normale</option>
                            <option value="Haute">Haute</option>
                            <option value="Urgente">Urgente</option>
                          </select>
                        </div>
                        <div className="mb-4">
                          <label htmlFor="statut" className="block text-sm font-medium text-gray-700">Statut</label>
                          <select
                            name="statut"
                            id="statut"
                            value={tacheForm.statut}
                            onChange={handleTacheChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="A faire">A faire</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        </div>
                        <div className="mb-4">
                          <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">Assigné à</label>
                          <select
                            name="user_id"
                            id="user_id"
                            value={tacheForm.user_id || ''}
                            onChange={handleTacheChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="">Non assigné</option>
                            {membres.map(membre => (
                              <option key={membre.id} value={membre.id}>{membre.nom_complet}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mb-4">
                          <label htmlFor="jalon_id" className="block text-sm font-medium text-gray-700">Jalon</label>
                          <select
                            name="jalon_id"
                            id="jalon_id"
                            value={tacheForm.jalon_id || ''}
                            onChange={handleTacheChange}
                            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="">Aucun jalon</option>
                            {jalons.filter(j => j.projet_id === selectedProjet?.id).map(jalon => (
                              <option key={jalon.id} value={jalon.id}>{jalon.libelle}</option>
                            ))}
                          </select>
                        </div>
                        <input
                          type="hidden"
                          name="projet_id"
                          value={selectedProjet?.id || 0}
                        />
                        <div className="mt-6 sm:flex sm:flex-row-reverse">
                          <button
                            type="submit"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                          >
                            {editMode ? 'Modifier' : 'Créer'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setTacheModalOpen(false)}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;