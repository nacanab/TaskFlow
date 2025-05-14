import { useEffect, useState } from "react";
import axios from "axios";

interface Skill {
  id: number;
  libelle: string;
  description: string;
}

const ITEMS_PER_PAGE = 5;
const API_URL = "http://127.0.0.1:8000/api/v1";

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSkills = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/competences/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSkills(res.data.competences);
  };

  const deleteSkill = async (skillId: number) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/competences/delete/${skillId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchSkills();
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const paginatedSkills = skills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(skills.length / ITEMS_PER_PAGE);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Gestion des compétences</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Libelle</th>
            <th className="p-2">Description</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSkills.map((skill) => (
            <tr key={skill.id} className="border-t">
              <td className="p-2">{skill.libelle}</td>
              <td className="p-2">{skill.description}</td>
              <td className="p-2">
                <button
                  className="text-blue-500 mr-2"
                  onClick={() => alert("Rediriger vers le formulaire de modification")}
                >
                  Modifier
                </button>
                <button
                  className="text-red-500"
                  onClick={() => deleteSkill(skill.id)}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`mx-1 px-3 py-1 rounded ${
              page === currentPage ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
