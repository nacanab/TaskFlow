import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { getUser } from "../api/auth";
import {useNotifications} from "../components/useNotification";

interface Skill {
  id: number;
  libelle: string;
}

interface UserSkill {
  id: number;
  libelle: string;
  skill?: Skill;
}

interface User {
  id: number;
  nom_complet: string;
  email: string;
  photo_profil: string | null;
  created_at: string;
  [key: string]: any;
}

const API_URL = "http://127.0.0.1:8000/api/v1";

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newSkillId, setNewSkillId] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [newSkillLibelle, setNewSkillLibelle] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  

  const {
    notifications,
    loadinge,
    unreadCount,
    hasUnreadNotifications,
    markAsRead,
    markAllAsRead,
    formatNotificationTime
  } = useNotifications();
 
  // Récupération des données utilisateur et des compétences
  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Récupération du token d'authentification
      const token = localStorage.getItem("token");
     
      if (!token) {
        window.location.href = "/login";
        return;
      }
     
      // Récupération des données utilisateur
      const userData = await getUser();
      console.log("Données utilisateur récupérées:", userData);
      
      if (userData) {
        setUser(userData);
        if (userData.photo_profil) {
          setPreviewUrl(`http://localhost:8000/${userData.photo_profil}`);
        }
      }
     
      // Récupération de toutes les compétences disponibles
      const skillsRes = await axios.get(`${API_URL}/competences/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Toutes les compétences:", skillsRes.data);
      
      if (skillsRes.data && skillsRes.data.competences) {
        setAllSkills(skillsRes.data.competences);
      }
     
      // Récupération des compétences de l'utilisateur
      const userSkillsRes = await axios.get(`${API_URL}/competences/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Compétences de l'utilisateur:", userSkillsRes.data);
      
      if (userSkillsRes.data && userSkillsRes.data.competences) {
        setUserSkills(userSkillsRes.data.competences);
      }
     
      setError("");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Impossible de récupérer les données. Veuillez réessayer.";
      setError(errorMsg);
      console.error("Erreur lors de la récupération des données:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Gestion du changement de photo de profil
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPhoto(selectedFile);
      
      // Créer un URL pour la prévisualisation
      const fileUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(fileUrl);
    }
  };

  // Mise à jour du profil utilisateur
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setError("");
      
      // Préparation des données à envoyer
      const formData = new FormData();
      
      // S'assurer que tous les champs requis sont inclus
      formData.append("nom_complet", user.nom_complet);
      formData.append("email", user.email);
      
      // Ajouter la photo si elle existe
      if (photo) {
        formData.append("photo_profil", photo);
      }
      
      // Déboguer le contenu de formData
      console.log("Données envoyées:", {
        nom_complet: user.nom_complet,
        email: user.email,
        photo: photo ? "Photo présente" : "Pas de photo"
      });
     
      // Utiliser axios pour mettre à jour
      const response = await axios.post(`${API_URL}/users/update/${user.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PUT',
          'Authorization': `Bearer ${token}`
        },
      });
      
      console.log("Réponse API:", response.data);
      
      // Vérifier si la réponse contient les données utilisateur mises à jour
      if (response.data && response.data.user) {
        // Utiliser les données renvoyées par l'API
        setUser(response.data.user);
        
        // Mettre à jour la photo de profil si nécessaire
        if (response.data.user.photo_profil) {
          // Ajouter un timestamp pour éviter le cache du navigateur
          setPreviewUrl(`${response.data.user.photo_profil}?t=${new Date().getTime()}`);
        }
      } else if (response.data) {
        // Si l'API renvoie un objet directement
        setUser(response.data);
        
        if (response.data.photo_profil) {
          // Ajouter un timestamp pour éviter le cache du navigateur
          setPreviewUrl(`${response.data.photo_profil}?t=${new Date().getTime()}`);
        }
      } else {
        // Si l'API ne renvoie pas les données mises à jour, recharger les données
        await fetchUserData();
      }
     
      setSuccess("Profil mis à jour avec succès!");
      setEditing(false);
     
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess("");
      }, 3000);

      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erreur lors de la mise à jour du profil. Veuillez réessayer.";
      setError(errorMsg);
      console.error("Erreur lors de la mise à jour du profil:", err.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  // Gestion des champs du formulaire
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (user) {
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [name]: value
        };
      });
      
      // Log pour déboguer
      console.log(`Champ modifié: ${name} = ${value}`);
    }
  };

  // Ajout d'une compétence à l'utilisateur
  const addSkill = async () => {
    if (!newSkillId && !newSkillLibelle.trim()) return;
   
    try {
      setSaving(true);
      setError("");
      
      let competencesToSend = [];
     
      if (newSkillId) {
        // Trouver la compétence sélectionnée dans la liste
        const foundSkill = allSkills.find(skill => skill.id.toString() === newSkillId);
        if (foundSkill) {
          competencesToSend.push(foundSkill.libelle);
        } else {
          throw new Error("Compétence non trouvée");
        }
      } else {
        // Utiliser la nouvelle compétence saisie
        competencesToSend.push(newSkillLibelle.trim());
      }
      
      console.log("Ajout des compétences:", competencesToSend);
     
      // Format adapté pour l'API: {competences:["php","python"]}
      const response = await axios.post(
        `${API_URL}/competences/create`,
        { competences: competencesToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Réponse de l'API:", response.data);
     
      // Mettre à jour la liste des compétences utilisateur après l'ajout
      const userSkillsRes = await axios.get(`${API_URL}/competences/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Nouvelles compétences utilisateur:", userSkillsRes.data);
      
      if (userSkillsRes.data && userSkillsRes.data.competences) {
        setUserSkills(userSkillsRes.data.competences);
      }
     
      // Si une nouvelle compétence a été créée, rafraîchir la liste de toutes les compétences
      if (newSkillLibelle.trim()) {
        const skillsRes = await axios.get(`${API_URL}/competences/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (skillsRes.data && skillsRes.data.competences) {
          setAllSkills(skillsRes.data.competences);
        }
      }
     
      // Réinitialiser les champs
      setNewSkillId("");
      setNewSkillLibelle("");
     
      setSuccess("Compétence ajoutée avec succès!");
     
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erreur lors de l'ajout de la compétence. Veuillez réessayer.";
      setError(errorMsg);
      console.error("Erreur lors de l'ajout de la compétence:", err.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  // Suppression d'une compétence de l'utilisateur
  const removeSkill = async (userSkillId: number) => {
    try {
      setSaving(true);
      setError("");
     
      // Trouver la compétence à supprimer
      const skillToRemove = userSkills.find(skill => skill.id === userSkillId);
      if (!skillToRemove) {
        throw new Error("Compétence non trouvée");
      }
     
      // Format adapté pour l'API: {competences:["php","python"]}
      await axios.delete(
        `${API_URL}/competences/delete/${userSkillId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
     
      // Mettre à jour la liste des compétences de l'utilisateur
      setUserSkills(prev => prev.filter(userSkill => userSkill.id !== userSkillId));
      setSuccess("Compétence supprimée avec succès!");
     
      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError("Erreur lors de la suppression de la compétence. Veuillez réessayer.");
      console.error("Erreur lors de la suppression de la compétence:", err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle de l'état d'édition
  const toggleEdit = () => {
    setEditing(!editing);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center">
        <p className="text-red-500">Impossible de charger le profil. Veuillez vous reconnecter.</p>
      </div>
    );
  }
  
  
  const formatDurationSince = (dateString: string) => {
    const createdDate = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
    const days = Math.floor(diff / (3600 * 24));
    const hours = Math.floor((diff % (3600 * 24)) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    if (days > 0) return `${days} jour(s), ${hours}h`;
    if (hours > 0) return `${hours}h, ${minutes}min`;
    return `${minutes}min`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Profil utilisateur</h1>
        {editing ? (
          <div className="flex space-x-3">
            <button
              onClick={handleUpdateProfile}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 flex items-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </button>
            <button
              onClick={toggleEdit}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition duration-200"
            >
              Annuler
            </button>
          </div>
        ) : (
          <button
            onClick={toggleEdit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
          >
            Modifier le profil
          </button>
        )}
      </div>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{success}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne gauche : Photo et infos rapides */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 text-center">
              {editing ? (
                <div className="mb-4">
                  <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden mb-3">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Photo de profil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition duration-200">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoChange} 
                      className="hidden" 
                    />
                    Changer la photo
                  </label>
                </div>
              ) : (
                <div className="mx-auto w-32 h-32 rounded-full overflow-hidden mb-4">
                  {user.photo_profil ? (
                    <img 
                      src={`http://localhost:8000/${user.photo_profil}`} 
                      alt="Photo de profil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <svg className="h-16 w-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
              <h2 className="text-xl font-bold text-gray-800">{user.nom_complet}</h2>
              <p className="text-gray-500">{user.email}</p>
              <div className="mt-4 flex justify-center space-x-2">
                <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                  <svg className="inline-block h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Message
                </button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  <svg className="inline-block h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Favoris
                </button>
              </div>
            </div>
            <div className="border-t border-gray-200">
                <div className="px-6 py-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Durée sur la plateforme
                  </h3>
                  <div className="mt-2 text-sm text-gray-700 text-center">
                    {user.created_at ? formatDurationSince(user.created_at) : "Chargement..."}
                  </div>
                </div>
              </div>
          </div>
        </div>
        {/* Colonne droite : Informations détaillées */}
        <div className="md:col-span-2 space-y-6">
          {/* Infos personnelles */}
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations personnelles</h2>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    name="nom_complet"
                    value={user.nom_complet}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-700 space-y-3">
                <div className="flex border-b border-gray-100 pb-2">
                  <span className="font-medium w-1/4">Nom :</span>
                  <span>{user.nom_complet}</span>
                </div>
                <div className="flex border-b border-gray-100 pb-2">
                  <span className="font-medium w-1/4">Email :</span>
                  <span>{user.email}</span>
                </div>
              </div>
            )}
          </section>
          {/* Compétences */}
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Compétences</h2>
           
            {/* Affichage des compétences de l'utilisateur */}
            {userSkills && userSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {userSkills.map((userSkill) => (
                  <span
                    key={userSkill.id}
                    className={`${
                      editing ? "pr-1" : "px-3"
                    } py-1 rounded-full text-sm flex items-center ${
                      userSkill.libelle === "React"
                        ? "bg-blue-100 text-blue-800"
                        : userSkill.libelle === "Django"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {userSkill.libelle}
                    {editing && (
                      <button
                        onClick={() => removeSkill(userSkill.id)}
                        className="ml-1 h-4 w-4 rounded-full bg-gray-400 text-white flex items-center justify-center hover:bg-red-500"
                        aria-label={`Supprimer ${userSkill.libelle}`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">
                {editing ? "Ajoutez votre première compétence" : "Aucune compétence renseignée"}
              </p>
            )}
            {/* Champ d'ajout (visible uniquement en mode édition) */}
            {editing && (
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-700">Sélectionner une compétence existante</h3>
                <div className="flex">
                  <select
                    value={newSkillId}
                    onChange={(e) => {
                      setNewSkillId(e.target.value);
                      // Réinitialiser le champ de nouvelle compétence si une existante est sélectionnée
                      if (e.target.value) {
                        setNewSkillLibelle("");
                      }
                    }}
                    className="flex-grow border border-gray-300 p-2 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    aria-label="Sélectionnez une compétence à ajouter"
                  >
                    <option value="">Sélectionnez une compétence</option>
                    {allSkills.map((skill) => {
                      // Ne montrer que les compétences qui ne sont pas déjà associées à l'utilisateur
                      const isAlreadyAdded = userSkills.some(userSkill => 
                        userSkill.skill ? userSkill.skill.id === skill.id : userSkill.libelle === skill.libelle
                      );
                      if (!isAlreadyAdded) {
                        return (
                          <option key={skill.id} value={skill.id}>
                            {skill.libelle}
                          </option>
                        );
                      }
                      return null;
                    })}
                  </select>
                  <button
                    onClick={addSkill}
                    disabled={!newSkillId || saving}
                    className={`bg-blue-600 text-white px-4 rounded-r-lg hover:bg-blue-700 ${
                      !newSkillId || saving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label="Ajouter compétence existante"
                  >
                    {saving ? "..." : "+"}
                  </button>
                </div>
               
                <h3 className="text-md font-medium text-gray-700 mt-4">Ou ajouter une nouvelle compétence</h3>
                <div className="flex">
                  <input
                    type="text"
                    value={newSkillLibelle}
                    onChange={(e) => {
                      setNewSkillLibelle(e.target.value);
                      // Réinitialiser la sélection si on commence à créer une nouvelle compétence
                      if (e.target.value) setNewSkillId("");
                    }}
                    placeholder="Nom de la compétence"
                    className="flex-grow border border-gray-300 p-2 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    disabled={!!newSkillId || saving}
                  />
                  <button
                    onClick={addSkill}
                    disabled={!newSkillLibelle.trim() || saving || !!newSkillId}
                    className={`bg-green-600 text-white px-4 rounded-r-lg hover:bg-green-700 ${
                      !newSkillLibelle.trim() || saving || !!newSkillId ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? "..." : "+"}
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="bg-white p-6 rounded-xl shadow-md mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
                {hasUnreadNotifications && (
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                    {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {loadinge ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : notifications && notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((notification) => (
                    <div 
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`flex items-start p-3 border-b border-gray-100 ${!notification.est_lu ? 'bg-blue-50 rounded-lg' : ''} cursor-pointer hover:bg-gray-50 transition duration-150`}
                    >
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-gray-500">{formatNotificationTime(notification.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.contenu}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-2">
                    <button 
                      onClick={markAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800 transition duration-200 flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Marquer tout comme lu
                    </button>
                    <a 
                      href="/notifications" 
                      className="text-sm text-blue-600 hover:text-blue-800 transition duration-200 flex items-center"
                    >
                      Voir tout
                      <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="mt-4 text-gray-500">Vous n'avez pas de notifications</p>
                </div>
              )}
            </section>
        </div>
      </div>
    </div>
  );
}