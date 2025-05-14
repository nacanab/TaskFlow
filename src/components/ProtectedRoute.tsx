import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../api/auth";
import { JSX } from "react";

interface Props {
    children: JSX.Element;
  }

function ProtectedRoute( { children }: Props ) {
    console.log("Utilisateur authentifié ?", isAuthenticated());
    Error("Connectez-vous pour accéder à cette page.");
    return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;