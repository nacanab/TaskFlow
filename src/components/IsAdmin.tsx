import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../api/auth";
import {isAdmin} from "../api/auth";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
  }

function IsAdmin( { children }: Props ) {
    console.log("Utilisateur authentifié ?", isAuthenticated());
    Error("Connectez-vous pour accéder à cette page.");
    return isAdmin() ? children : <Navigate to="/login" />;
}

export default IsAdmin;