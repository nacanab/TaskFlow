import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Search, Loader2, Users, Info } from "lucide-react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

interface Team {
  id: number;
  libelle: string;
  description: string;
  members?: any[];
}

export default function AdminTeamManagement() {
  // États principaux
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // États pour le formulaire d'ajout/modification
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    libelle: "",
    description: ""
  });

  // État pour afficher les détails d'une équipe
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

  // Token d'authentification
  const token = localStorage.getItem("token");

  // Récupération des équipes
  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/equipes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTeams(data.equipes);
    } catch (error) {
      console.error("Erreur lors du chargement des équipes :", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Création d'une équipe
  const createTeam = async () => {
    if (!formData.libelle.trim()) {
      alert("Le libellé est obligatoire");
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/equipes/create/`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      resetForm();
      await fetchTeams();
    } catch (error) {
      console.error("Erreur lors de la création :", error);
      setIsLoading(false);
    }
  };

  // Mise à jour d'une équipe
  const updateTeam = async () => {
    if (!currentTeam || !formData.libelle.trim()) return;
    
    setIsLoading(true);
    try {
      await axios.put(`${API_URL}/equipes/update/${currentTeam.id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      resetForm();
      await fetchTeams();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      setIsLoading(false);
    }
  };

  // Suppression d'une équipe
  const deleteTeam = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette équipe ?")) return;
    
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/equipes/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchTeams();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setIsLoading(false);
    }
  };

  // Démarrer l'édition d'une équipe
  const startEditing = (team: Team) => {
    setFormMode("edit");
    setCurrentTeam(team);
    setFormData({
      libelle: team.libelle,
      description: team.description
    });
    setShowForm(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({ libelle: "", description: "" });
    setCurrentTeam(null);
    setFormMode("create");
    setShowForm(false);
  };

  // Gestion des changements dans le formulaire
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Soumission du formulaire
  const handleSubmit = () => {
    if (formMode === "create") {
      createTeam();
    } else {
      updateTeam();
    }
  };

  // Basculer l'affichage des détails d'une équipe
  const toggleExpandTeam = (teamId: number) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  // Filtrage des équipes
  const filteredTeams = teams.filter(team =>
    team.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Chargement initial
  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des équipes</h2>
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button
            onClick={() => {
              setFormMode("create");
              setShowForm(!showForm);
            }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} className="mr-1" />
            Nouvelle équipe
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            {formMode === "create" ? "Ajouter une nouvelle équipe" : "Modifier l'équipe"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Libellé *
              </label>
              <input
                type="text"
                name="libelle"
                value={formData.libelle}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {formMode === "create" ? "Ajouter" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      {/* Liste des équipes */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Chargement des équipes...</span>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <Users size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune équipe trouvée</h3>
          <p className="text-gray-500">
            {searchTerm ? "Aucun résultat pour cette recherche." : "Commencez par créer une nouvelle équipe."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {paginatedTeams.map((team) => (
            <div key={team.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h3 className="font-semibold text-lg">{team.libelle}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleExpandTeam(team.id)}
                    className="p-1 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-200"
                    title="Détails"
                  >
                    <Info size={18} />
                  </button>
                  <button
                    onClick={() => startEditing(team)}
                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-100"
                    title="Modifier"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => deleteTeam(team.id)}
                    className="p-1 text-red-600 hover:text-red-800 transition-colors rounded-full hover:bg-red-100"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              {expandedTeam === team.id && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                    <p className="text-gray-700">{team.description || "Aucune description disponible"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Membres</h4>
                    {team.members && team.members.length > 0 ? (
                      <div className="bg-white rounded border p-2">
                        <ul className="divide-y">
                          {team.members.map((member, idx) => (
                            <li key={idx} className="py-2 px-1 flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                <span className="text-blue-700 font-medium">
                                  {member.nom_complet ? member.nom_complet.charAt(0).toUpperCase() : "?"}
                                </span>
                              </div>
                              <span>{member.nom_complet || "Utilisateur inconnu"}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Aucun membre dans cette équipe</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Précédent
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Suivant
            </button>
          </nav>
        </div>
      )}
      
      {/* Indicateur de total */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        Affichage de {paginatedTeams.length} sur {filteredTeams.length} équipes
      </div>
    </div>
  );
}