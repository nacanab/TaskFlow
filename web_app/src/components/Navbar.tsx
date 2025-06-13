import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { logout } from "../api/auth";
import {getUser} from "../api/auth";

interface NavItem {
  path: string;
  icon: string;
  label: string;
}
export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const user = getUser();
  // Ne pas afficher la Sidebar sur les pages Login et Register
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }
  
  const handleLogout = () => {
    // Logique pour la déconnexion
    logout();
    window.location.href = "/login";
  };
  let navItems:NavItem[];
  if (user.est_admin === true) {
    
    navItems = [
      { path: "/profil", icon: "👤", label: "Profil" },              // Profil utilisateur
      { path: "/admin/dashbord", icon: "📊", label: "Tableau de bord" }, // Dashboard avec des stats
      { path: "/admin/utilisateurs", icon: "🧑‍💼", label: "Utilisateurs" }, // Groupe d'utilisateurs
      { path: "/admin/equipes", icon: "👥", label: "Equipes" },         // Equipes (groupe)
      { path: "/admin/competences", icon: "🧠", label: "Compétences" },  // Compétences = cerveau
      { path: "/admin/projets", icon: "📁", label: "Projets" },         // Projets = dossier
      { path: "/admin/taches", icon: "✅", label: "Tâches" },           // Tâche accomplie
    ];
    
    }
  else {
    navItems = [
      { path: "/profil", icon: "user-circle", label: "Profil" },
      { path: "/teams", icon: "users", label: "Équipes" },
      { path: "/projets", icon: "folder", label: "Projets" },
      { path: "/tasks", icon: "check-circle", label: "Mes tâches" },
      { path: "/calendar", icon: "calendar", label: "Calendrier" },
      { path: "/reports", icon: "document-report", label: "Rapports" },
    ];
  }

  return (
    <div className={`flex flex-col ${isOpen ? "w-64" : "w-20"} transition-all duration-300 bg-gradient-to-b from-indigo-900 to-gray-900 text-white min-h-screen shadow-xl`}>
      {/* Header avec logo et toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {isOpen ? (
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">TaskFlow</h1>
        ) : (
          <h1 className="text-2xl font-bold mx-auto">TF</h1>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1 rounded-full hover:bg-gray-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </div>

      {/* Section profil */}
      <div className="flex items-center p-4 border-b border-gray-700">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full h-12 w-12 flex items-center justify-center">
          <img src={`http://localhost:8000/${user.photo_profil}`} alt="Profil" className="rounded-full h-12 w-12" />
        </div>
        {isOpen && (
          <div className="ml-3">
            {user.est_admin === true ?( <p className="font-medium">Administrateur</p>) : (<p className="font-medium">Utilisateur</p>)}
          </div>
        )}
      </div>

      {/* Menu de navigation */}
      <div className="flex flex-col space-y-1 p-3 flex-grow">
        {navItems.map((item, index) => (
          <Link 
            key={index}
            to={item.path} 
            className={`flex items-center rounded-lg p-3 transition-colors duration-200 ${
              location.pathname === item.path 
                ? "bg-indigo-800 text-white" 
                : "hover:bg-gray-700"
            }`}
          >
            <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {item.icon === "user-circle" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              {item.icon === "chart-bar" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
              {item.icon === "folder" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />}
              {item.icon === "check-circle" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
              {item.icon === "users" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
              {item.icon === "calendar" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
              {item.icon === "document-report" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
            </svg>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </div>

      {/* Section déconnexion */}
      <div className="mt-auto p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
}