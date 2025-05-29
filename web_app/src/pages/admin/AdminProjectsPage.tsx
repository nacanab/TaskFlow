import { useEffect, useState } from "react";
import axios from "axios";
import { Trash, Pencil, Info } from "lucide-react";

interface Project {
  id: number;
  titre: string;
  description: string;
  user_id: number;
}

const API_URL = "http://127.0.0.1:8000/api/v1";
const ITEMS_PER_PAGE = 5;

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/projets/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data.projets);
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/projets/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchProjects();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const paginatedProjects = projects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseDetails = () => {
    setSelectedProject(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Projets</h2>
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 flex items-center"
            onClick={() => alert("Ajouter un nouveau projet")}
          >
            <span className="mr-1">+</span> Nouveau Projet
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucun projet trouvé</h3>
            <p className="mt-2 text-gray-500">Commencez par créer votre premier projet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Créateur</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.titre}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{project.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{project.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-800 mr-3"
                          onClick={() => handleViewDetails(project)}
                        >
                          <Info className="h-5 w-5 inline" />
                        </button>
                        <button
                          className="text-indigo-600 hover:text-indigo-800 mr-3"
                          onClick={() => alert("Redirection vers formulaire de modification")}
                        >
                          <Pencil className="h-5 w-5 inline" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => deleteProject(project.id)}
                        >
                          <Trash className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> à{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * ITEMS_PER_PAGE, projects.length)}
                      </span>{" "}
                      sur <span className="font-medium">{projects.length}</span> projets
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        &laquo; Précédent
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Suivant &raquo;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de détails */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Détails du projet</h3>
                <button 
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Titre</p>
                <p className="text-base text-gray-900">{selectedProject.titre}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-base text-gray-900">{selectedProject.description}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Créé par</p>
                <p className="text-base text-gray-900">{selectedProject.user_id}</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => alert("Redirection vers formulaire de modification")}
                className="mr-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
              >
                <Pencil className="h-4 w-4 mr-1" /> Modifier
              </button>
              <button
                onClick={() => {
                  deleteProject(selectedProject.id);
                  handleCloseDetails();
                }}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                <Trash className="h-4 w-4 mr-1" /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}