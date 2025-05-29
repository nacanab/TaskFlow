import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Equipes from "./pages/Equipes";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminSkillsPage from "./pages/admin/AdminSkillsPage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminTasksPage from "./pages/admin/AdminTasksPage";
import IsAdmin from "./components/IsAdmin";
import AdminTeamsPage from "./pages/admin/AdminTeamManagement";
import ProjectsPage from "./pages/ProjectsPage";
import CalendarPage from "./pages/CalendarPage";
import TasksPage from "./pages/TasksPage";


function App() {
  return (
    <Router>
      <div className="flex">
        <Sidebar /> {/* La Sidebar s'affiche sauf sur Login et Register */}
        <main className="flex-1 p-6">
          <Routes>
              <Route path="/admin/dashbord" element={<IsAdmin><AdminDashboardPage /></IsAdmin>} />
              <Route path="/admin/utilisateurs" element={<IsAdmin><AdminUsersPage /> </IsAdmin>} />
              <Route path="/admin/equipes" element={<IsAdmin><AdminTeamsPage /> </IsAdmin>} />
              <Route path="/admin/competences" element={<IsAdmin> <AdminSkillsPage /></IsAdmin> } />
              <Route path="/admin/projets" element={<IsAdmin> <AdminProjectsPage /> </IsAdmin>} />
              <Route path="/admin/taches" element={<IsAdmin> <AdminTasksPage /> </IsAdmin>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/projets" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute><Equipes /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            {/* Autres routes protégées */}
            {/* Autres routes */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;