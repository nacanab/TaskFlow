import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof schema>;

export default function Login() {
  const { register: r, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      const user = response.data.user;
      console.log("Token:", response.data.token);
      if (user.est_admin == true) {
        navigate("/admin/dashbord");
      } else {
        navigate("/profil");
      }
    } catch (error) {
      setError("Identifiants incorrects.");
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
      
      {/* Panneau de droite avec le formulaire */}
      <div className="w-full md:w-96 bg-gradient-to-b from-purple-800 to-purple-600 p-8 flex flex-col justify-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white text-center mb-1">Connexion</h1>
        <p className="text-purple-200 text-center text-sm mb-8">Accédez à votre gestionnaire de tâches</p>
        {error && <p className="error-message text-center text-red-500">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-4">
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
              placeholder="••••••" 
              {...r("password")} 
              className="w-full p-3 rounded-md bg-purple-700/50 text-white placeholder-purple-300 border border-purple-500/30 focus:outline-none focus:border-purple-300" 
            />
            {errors.password && <span className="text-pink-300 text-sm mt-1">{errors.password.message}</span>}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input 
                id="remember-me" 
                type="checkbox" 
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="h-4 w-4 text-purple-600 rounded" 
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-purple-200">
                Se souvenir de moi
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm text-purple-200 hover:text-white">
              Mot de passe oublié?
            </Link>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-purple-500 hover:bg-purple-400 text-white font-medium py-3 px-4 rounded-md transition duration-200"
          >
            {isLoading ? "Chargement..." : "Se connecter"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-purple-200 text-sm">
            Pas encore de compte? <Link to="/register" className="text-white hover:underline">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}