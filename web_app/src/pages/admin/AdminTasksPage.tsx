import { useEffect, useState } from "react";
import axios from "axios";

interface Task {
  id: number;
  title: string;
  description: string;
  project: string;
  assigned_to: string;
}

const API_URL = "http://127.0.0.1:8000/api/v1";
const ITEMS_PER_PAGE = 5;

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/tasks/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(res.data);
  };

  const deleteTask = async (taskId: number) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_URL}/tasks/${taskId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const paginatedTasks = tasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Gestion des tâches</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Titre</th>
            <th className="p-2">Description</th>
            <th className="p-2">Projet</th>
            <th className="p-2">Assignée à</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTasks.map((task) => (
            <tr key={task.id} className="border-t">
              <td className="p-2">{task.title}</td>
              <td className="p-2">{task.description}</td>
              <td className="p-2">{task.project}</td>
              <td className="p-2">{task.assigned_to}</td>
              <td className="p-2">
                <button
                  className="text-blue-500 mr-2"
                  onClick={() => alert("Redirection vers formulaire de modification")}
                >
                  Modifier
                </button>
                <button
                  className="text-red-500"
                  onClick={() => deleteTask(task.id)}
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
