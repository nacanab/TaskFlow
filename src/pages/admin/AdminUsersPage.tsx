import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Search, Loader2 } from "lucide-react";

// Interface pour les utilisateurs
interface User {
  id: number;
  nom_complet: string;
  email: string;
}

const ITEMS_PER_PAGE = 5;
const API_URL = "http://127.0.0.1:8000/api/v1";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // État pour l'édition
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    nom_complet: "",
    email: ""
  });

  // Récupération des utilisateurs
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Suppression d'un utilisateur
  const deleteUser = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/users/delete/${userId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setIsLoading(false);
    }
  };

  // Mise à jour d'un utilisateur
  const updateUser = async () => {
    if (!editingUser) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/users/update/${editingUser.id}/`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
      });
      setEditingUser(null);
      await fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setIsLoading(false);
    }
  };

  // Initialisation de l'édition
  const startEditing = (user: User) => {
    setEditingUser(user);
    setEditForm({
      nom_complet: user.nom_complet,
      email: user.email
    });
  };

  // Annulation de l'édition
  const cancelEditing = () => {
    setEditingUser(null);
  };

  // Changement dans le formulaire d'édition
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  // Chargement initial des données
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrage des utilisateurs selon la recherche
  const filteredUsers = users.filter(user => 
    user.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des utilisateurs</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Retour à la première page lors d'une recherche
            }}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-6 py-3 font-semibold text-gray-700">Nom</th>
              <th className="px-6 py-3 font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center">
                  <div className="flex justify-center items-center text-gray-500">
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Chargement des données...
                  </div>
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {editingUser?.id === user.id ? (
                      <input
                        type="text"
                        name="nom_complet"
                        value={editForm.nom_complet}
                        onChange={handleEditFormChange}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      user.nom_complet
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingUser?.id === user.id ? (
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditFormChange}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingUser?.id === user.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={updateUser}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors rounded-full hover:bg-green-100"
                          title="Enregistrer"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
                          title="Annuler"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => startEditing(user)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-100"
                          title="Modifier"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors rounded-full hover:bg-red-100"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination améliorée */}
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
        Affichage de {paginatedUsers.length} sur {filteredUsers.length} utilisateurs
      </div>
    </div>
  );
}