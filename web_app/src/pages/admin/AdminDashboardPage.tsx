import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";

// Interfaces pour les données de l'API
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Competence {
  id: number;
  libelle: string;
  description?: string;
  createdAt: string;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: string;
  teamId?: number;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  projectId: number;
  assigneeId?: number;
}

interface Team {
  id: number;
  libelle: string;
  description?: string;
  createdAt: string;
  members?: TeamMember[];
}

interface TeamMember {
  id: number;
  userId: number;
  teamId: number;
  role?: string;
  user?: User;
}

// Interfaces pour les réponses API
interface UsersResponse {
  users: User[];
  total: number;
}

interface CompetencesResponse {
  competences: Competence[];
  total: number;
}

interface ProjectsResponse {
  projects: Project[];
  total: number;
}

interface TasksResponse {
  tasks: Task[];
  total: number;
}

interface TeamsResponse {
  equipes: Team[];
  total: number;
}

// Interfaces pour les données des graphiques
interface TeamChartData {
  name: string;
  members: number;
}

interface UserTrendData {
  name: string;
  users: number;
  pv: number;
}

interface TeamTrendData {
  name: string;
  equipes: number;
  projects: number;
}

// Props pour les composants
interface StatBoxProps {
  label: string;
  count: number;
  icon: string;
  color: string;
  textColor: string;
}

const API_URL = "http://127.0.0.1:8000/api/v1";

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState<number>(0);
  const [skillsCount, setSkillsCount] = useState<number>(0);
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [tasksCount, setTasksCount] = useState<number>(0);
  const [teamsCount, setTeamsCount] = useState<number>(0);
  const [teamsData, setTeamsData] = useState<TeamChartData[]>([]);
  const [usersTrend, setUsersTrend] = useState<UserTrendData[]>([]);
  const [teamsTrend, setTeamsTrend] = useState<TeamTrendData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats();
    fetchTeams();
    generateTrendData();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, skillsRes] = await Promise.all([
        axios.get<UsersResponse>(`${API_URL}/users/`, { headers }),
        axios.get<CompetencesResponse>(`${API_URL}/competences/`, { headers }),
      ]);
      
      setUsersCount(usersRes.data.users?.length || 0);
      setSkillsCount(skillsRes.data.competences?.length || 0);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<TeamsResponse>(`${API_URL}/equipes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setTeamsCount(res.data.equipes?.length || 0);
      
      // Formater les données pour les graphiques
      const formattedTeams = res.data.equipes.map((team) => ({
        name: team.libelle,
        members: team.members?.length || 0,
      }));
        
      setTeamsData(formattedTeams);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes:", error);
      setIsLoading(false);
    }
  };

  // Générer des données de tendance fictives pour la démonstration
  const generateTrendData = () => {
    // Données de tendance pour les utilisateurs sur les 6 derniers mois
    const userMonths: UserTrendData[] = [];
    const teamMonths: TeamTrendData[] = [];
    
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate);
      month.setMonth(currentDate.getMonth() - i);
      const monthName = monthNames[month.getMonth()];
      
      // Simuler une croissance pour les utilisateurs
      userMonths.push({
        name: monthName,
        users: Math.floor(Math.random() * 20) + 10 + (i * 8),
        pv: 2400,
      });
      
      // Simuler une croissance pour les équipes
      teamMonths.push({
        name: monthName,
        equipes: Math.floor(Math.random() * 5) + 2 + Math.floor(i/2),
        projects: Math.floor(Math.random() * 8) + 5 + i,
      });
    }
    
    setUsersTrend(userMonths);
    setTeamsTrend(teamMonths);
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-gray-600">Chargement des données...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de bord administrateur</h1>
        <p className="text-gray-500 mb-4">Vue d'ensemble des statistiques système</p>

        {/* Statistiques principales */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <StatBox label="Utilisateurs" count={usersCount} icon="👥" color="bg-blue-100" textColor="text-blue-600" />
          <StatBox label="Compétences" count={skillsCount} icon="🧠" color="bg-green-100" textColor="text-green-600" />
          <StatBox label="Projets" count={projectsCount} icon="📊" color="bg-yellow-100" textColor="text-yellow-600" />
          <StatBox label="Tâches" count={tasksCount} icon="✓" color="bg-red-100" textColor="text-red-600" />
          <StatBox label="Équipes" count={teamsCount} icon="👪" color="bg-purple-100" textColor="text-purple-600" />
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Évolution des utilisateurs</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={usersTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} 
              />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Croissance des équipes et projets</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={teamsTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} 
              />
              <Legend />
              <Line type="monotone" dataKey="equipes" stroke="#10b981" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="projects" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Membres par équipe</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} 
              />
              <Legend />
              <Bar dataKey="members" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Répartition des membres</h2>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={teamsData}
                  dataKey="members"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  label
                >
                  {teamsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} 
                  formatter={(value, name, props) => [`${value} membres`, props.payload.name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatBox = ({ label, count, icon, color, textColor }: StatBoxProps) => (
  <div className={`${color} border border-gray-100 rounded-xl p-4 text-center shadow-sm transition-all hover:shadow-md`}>
    <div className="flex justify-center mb-2">
      <span className="text-2xl">{icon}</span>
    </div>
    <p className={`text-3xl font-bold ${textColor}`}>{count}</p>
    <p className="text-sm text-gray-600 mt-1">{label}</p>
  </div>
);