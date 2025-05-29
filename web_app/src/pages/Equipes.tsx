// pages/TeamManagement.tsx
import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { PlusCircle, User, Users, Search, X, UserPlus, Trash2 } from "lucide-react";

const API_URL = "http://127.0.0.1:8000/api/v1";

// Type definitions
interface Member {
  id: number;
  nom_complet: string;
  role: string;
}

interface Team {
  id: number;
  libelle: string;
  description: string;
  members?: Member[];
  creator?: Member;
}

interface UserOption {
  id: number;
  nom_complet: string;
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [libelle, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Member management state
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [memberRole, setMemberRole] = useState("MEMBRE");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");


  useEffect(() => {
    fetchTeams();
    // Log pour confirmer que le composant est monté
    console.log("Composant TeamManagement monté");
  }, []);
  
  // Ajout d'un useEffect pour surveiller les changements de selectedTeam
  useEffect(() => {
    if (selectedTeam) {
      console.log("Équipe sélectionnée changée:", selectedTeam.libelle);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/equipes/equipes_belongs_user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Stocker les équipes sans membres temporairement
      const fetchedTeams = res.data.equipes;
      setTeams(fetchedTeams);
      
      // Charger les membres pour chaque équipe
      const teamsWithMembers = await Promise.all(
        fetchedTeams.map(async (team) => {
          const members = await fetchTeamMembers(team.id);
          const creator = fetchTeamCreator(team.id);
          return { ...team, members,creator };
        })
      );
      
      // Mettre à jour l'état avec les équipes incluant leurs membres
      setTeams(teamsWithMembers);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamCreator = async (teamId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/equipes/creator/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.user;
    } catch (error) {
      console.error("Erreur lors de la récupération du créateur de l'équipe:", error);
      return null;
    }
  }
  const createTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!libelle.trim()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/equipes/create/`,
        { libelle, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setDescription("");
      setIsCreating(false);
      fetchTeams();
    } catch (error) {
      console.error("Erreur lors de la création de l'équipe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId: number) => {
    try {
      const token = localStorage.getItem("token");
      // Assurez-vous que cette URL correspond exactement à l'endpoint de votre API
      const res = await axios.get(`${API_URL}/equipes/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Membres récupérés pour l'équipe", teamId, ":", res.data.users);
      
      // Si le team sélectionné est celui dont on récupère les membres, mettons à jour selectedTeam aussi
      if (selectedTeam && selectedTeam.id === teamId) {
        const members = res.data.users;
        setSelectedTeam(prevTeam => ({
          ...prevTeam!,
          members
        }));
      }
      
      // Retourner les membres pour un usage éventuel ailleurs
      return res.data.users || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des membres pour l'équipe", teamId, ":", error);
      return [];
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableUsers(res.data.users);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
  };

  const handleManageTeam = async (team: Team) => {
    console.log("Gestion de l'équipe:", team.libelle, "ID:", team.id);
    setSelectedTeam(team);
  };

  const handleAddMembers = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTeam || selectedUsers.length === 0) return;
    
    console.log("Ajout de membres:", selectedUsers, "avec le rôle:", memberRole);
    
    try {
      const token = localStorage.getItem("token");
      // Modifier l'URL pour correspondre exactement à l'endpoint de votre API
      await axios.post(
        `${API_URL}/equipes/${selectedTeam.id}`,
        { users: selectedUsers, role: memberRole }, // Adapter la structure selon votre API
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Membres ajoutés avec succès");
      
      // Refresh members pour l'équipe sélectionnée
      const updatedMembers = await fetchTeamMembers(selectedTeam.id);
      
      // Mettre à jour les membres dans l'équipe sélectionnée
      setSelectedTeam(prevTeam => ({
        ...prevTeam!,
        members: updatedMembers
      }));
      
      // Mettre à jour les membres dans la liste des équipes
      setTeams(prevTeams => {
        return prevTeams.map(team => {
          if (team.id === selectedTeam.id) {
            return { ...team, members: updatedMembers };
          }
          return team;
        });
      });
      
      setIsAddingMembers(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Erreur lors de l'ajout des membres:", error);
      // Afficher l'erreur spécifique pour le débogage
      if (axios.isAxiosError(error)) {
        console.error("Détails de l'erreur:", error.response?.data);
      }
    }
  }; 

  const handleRemoveMember = async (teamId: number, userId: number) => {
    console.log("Tentative de suppression du membre:", userId, "de l'équipe:", teamId);
    
    try {
      const token = localStorage.getItem("token");
      // Deux options possibles pour l'API - adapter selon votre backend
      
      // Option 1 - Envoi du body dans data pour DELETE
      await axios.delete(`${API_URL}/equipes/detacher`, {
        data: { user_id: userId, equipe_id: teamId },
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Membre supprimé avec succès");
      
      // Update the UI immediately for better UX
      setTeams(prevTeams => {
        return prevTeams.map(team => {
          if (team.id === teamId && team.members) {
            return {
              ...team,
              members: team.members.filter(member => member.id !== userId)
            };
          }
          return team;
        });
      });
      
      // If the current team is the one we're modifying, update selectedTeam too
      if (selectedTeam && selectedTeam.id === teamId) {
        setSelectedTeam(prevTeam => ({
          ...prevTeam!,
          members: prevTeam!.members?.filter(member => member.id !== userId)
        }));
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du membre:", error);
      // Log detailed error for debugging
      if (axios.isAxiosError(error)) {
        console.error("Détails de l'erreur:", error.response?.data);
        alert("Erreur lors de la suppression du membre. Veuillez réessayer.");
      }
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const closeTeamDetails = () => {
    setSelectedTeam(null);
    setIsAddingMembers(false);
    setSelectedUsers([]);
  };

  const filteredTeams = teams.filter(team => 
    team.libelle.toLowerCase().includes(searchQuery.toLowerCase()) || 
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = availableUsers.filter(user =>
    user.nom_complet.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Mes équipes</h1>
              <p className="text-gray-500 mt-1">Gérez vos équipes et leurs membres</p>
            </div>
            {!selectedTeam && (
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isCreating ? (
                  <>
                    <X className="mr-2 h-5 w-5" />
                    Annuler
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Nouvelle équipe
                  </>
                )}
              </button>
            )}
            {selectedTeam && (
              <button
                onClick={closeTeamDetails}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <X className="mr-2 h-5 w-5" />
                Retour aux équipes
              </button>
            )}
          </div>

          {/* Team Detail View */}
          {selectedTeam ? (
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedTeam.libelle}</h2>
                  <p className="text-gray-600 mt-1">{selectedTeam.description || "Aucune description"}</p>
                </div>
                {!isAddingMembers && (
                  <button
                    onClick={() => {
                      setIsAddingMembers(true);
                      fetchAvailableUsers();
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Ajouter des membres
                  </button>
                )}
              </div>

              {/* Add Members Form */}
              {isAddingMembers && (
                <div className="mb-8 border rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Ajouter des membres</h3>
                    <button
                      onClick={() => setIsAddingMembers(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddMembers}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rôle des nouveaux membres
                      </label>
                      <select
                        value={memberRole}
                        onChange={(e) => setMemberRole(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="MEMBRE">Membre</option>
                        <option value="ADMIN">Chef d'équipe</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rechercher des utilisateurs
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Rechercher un utilisateur..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                      {filteredUsers.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                          {filteredUsers.map((user) => (
                            <li key={user.id} className="px-4 py-2 hover:bg-gray-50">
                              <label className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedUsers.includes(user.id)}
                                  onChange={() => toggleUserSelection(user.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-gray-900">{user.nom_complet}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-6 text-center text-gray-500">
                          {userSearchQuery ? "Aucun utilisateur trouvé" : "Chargement des utilisateurs..."}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsAddingMembers(false)}
                        className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={selectedUsers.length === 0}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                      >
                        Ajouter à l'équipe
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Members List */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Membres de l'équipe</h3>
                {selectedTeam.members && selectedTeam.members.length > 0 ? (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {selectedTeam.members.map((member) => (
                        <li key={member.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <User className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.nom_complet}</div>
                                <div className="text-sm text-gray-500">{member.role}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveMember(selectedTeam.id, member.id)}
                              className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun membre</h3>
                    <p className="mt-1 text-sm text-gray-500">Commencez par ajouter des membres à votre équipe.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => {
                          setIsAddingMembers(true);
                          fetchAvailableUsers();
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <UserPlus className="mr-2 h-5 w-5" />
                        Ajouter des membres
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Search and filters - Only show when not viewing team details */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Rechercher une équipe..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Create Team Form */}
              {isCreating && (
                <div className="mb-8 border rounded-lg p-6 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Créer une nouvelle équipe</h3>
                  <form onSubmit={createTeam}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="team-name" className="block text-sm font-medium text-gray-700">
                          Nom de l'équipe
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="team-name"
                            value={libelle}
                            onChange={(e) => setName(e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            required
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="team-description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="team-description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isLoading}
                      >
                        {isLoading ? "Création..." : "Créer l'équipe"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Teams List */}
              {isLoading && !isCreating ? (
                <div className="flex justify-center py-12">
                  <div className="animate-pulse text-gray-400">Chargement des équipes...</div>
                </div>
              ) : filteredTeams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTeams.map((team) => (
                    <div 
                      key={team.id} 
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold text-gray-900">{team.libelle}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {team.members?.length || 0} {team.members?.length === 1 ? "membre" : "membres"}
                          </span>
                        </div>
                        
                        <p className="mt-2 text-gray-600 text-sm">
                          {team.description || <span className="text-gray-400 italic">Aucune description</span>}
                        </p>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h4 className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <Users className="h-4 w-4 mr-1" /> 
                            Membres de l'équipe
                          </h4>
                          
                          {team.members && team.members.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {team.members.map((member) => (
                                <div 
                                  key={member.id}
                                  className="flex items-center text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
                                >
                                  <User className="h-3 w-3 mr-1" />
                                  <span>{member.nom_complet}</span>
                                  <span className="ml-1 text-gray-500">({member.role})</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">Aucun membre dans cette équipe</p>
                          )}
                        </div>
                        {team.user_id === user?.id && (
                          <div className="mt-4 flex justify-end">
                            <button 
                              onClick={() => handleManageTeam(team)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Gérer l'équipe →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    {searchQuery ? "Aucune équipe ne correspond à votre recherche" : "Aucune équipe disponible"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery 
                      ? "Essayez de modifier votre recherche ou créez une nouvelle équipe."
                      : "Commencez par créer votre première équipe pour organiser vos collaborateurs."}
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setIsCreating(true);
                        setSearchQuery("");
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Créer une équipe
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}