import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as registerUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const schema = z.object({
  nom_complet: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  password_confirmation: z.string().min(6),
});

type RegisterForm = z.infer<typeof schema>;

export default function Register() {
  const { register: r, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      alert("Inscription réussie !");
      navigate("/login");
    } catch (error) {
      alert("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      
      {/* Panneau de gauche avec l'image (visible uniquement sur les écrans plus grands) */}
      <div className="hidden md:flex flex-1 bg-gray-900 items-center justify-center relative">
        <div className="absolute inset-0 bg-purple-900/30 z-10"></div>
        <img 
          src="/Task-Management-Advantages-scaled.jpg" 
          alt="Login background" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute z-20 text-center text-white p-8">
          <h2 className="text-4xl font-bold mb-4">Bienvenue !</h2>
          <p className="text-lg text-gray-100">Gérez vos tâches facilement et efficacement avec notre plateforme.</p>
        </div>
      </div>

      {/* Panneau de gauche avec le formulaire */}
      <div className="w-full md:w-96 bg-gradient-to-b from-purple-800 to-purple-600 p-8 flex flex-col">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-1">Inscription</h1>
        <p className="text-purple-200 text-center text-sm mb-8">Créez votre compte gestionnaire de tâches</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
          <div>
            <label className="block text-purple-100 text-sm mb-2">Nom complet</label>
            <input 
              type="text" 
              placeholder="NACANABO Abdel Latif" 
              {...r("nom_complet")} 
              className="w-full p-3 rounded-md bg-purple-700/50 text-white placeholder-purple-300 border border-purple-500/30 focus:outline-none focus:border-purple-300" 
            />
            {errors.nom_complet && <span className="text-pink-300 text-sm mt-1">{errors.nom_complet.message}</span>}
          </div>
          
          <div>
            <label className="block text-purple-100 text-sm mb-2">Email</label>
            <input 
              type="email" 
              placeholder="vous@exemple.com" 
              {...r("email")} 
              className="w-full p-3 rounded-md bg-purple-700/50 text-white placeholder-purple-300 border border-purple-500/30 focus:outline-none focus:border-purple-300" 
            />
            {errors.email && <span className="text-pink-300 text-sm mt-1">{errors.email.message}</span>}
          </div>
          
          <div>
            <label className="block text-purple-100 text-sm mb-2">Mot de passe</label>
            <input 
              type="password" 
              placeholder="Minimum 6 caractères" 
              {...r("password")} 
              className="w-full p-3 rounded-md bg-purple-700/50 text-white placeholder-purple-300 border border-purple-500/30 focus:outline-none focus:border-purple-300" 
            />
            {errors.password && <span className="text-pink-300 text-sm mt-1">{errors.password.message}</span>}
          </div>

          <div>
            <label className="block text-purple-100 text-sm mb-2">Confirmation de mot de passe</label>
            <input 
              type="password" 
              placeholder="Minimum 6 caractères" 
              {...r("password_confirmation")} 
              className="w-full p-3 rounded-md bg-purple-700/50 text-white placeholder-purple-300 border border-purple-500/30 focus:outline-none focus:border-purple-300" 
            />
            {errors.password && <span className="text-pink-300 text-sm mt-1">{errors.password.message}</span>}
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-purple-500 hover:bg-purple-400 text-white font-medium py-3 px-4 rounded-md transition duration-200 mt-2"
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-purple-200 text-sm">
            Déjà un compte? <Link to="/login" className="text-white hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}