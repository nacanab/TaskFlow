import axios from 'axios';

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const piecesJointesService = {
  getPiecesJointes: async (tacheId: number) => {
    try {
      const response = await apiClient.get(`/pieces_jointes/taches/${tacheId}`);
      return response.data.pieces_jointes;
    } catch (error) {
      console.error('Erreur lors de la récupération des pièces jointes:', error);
      throw error;
    }
  },

  uploadPieceJointe: async (tacheId: number, files: File[]) => {
    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('fichiers[]', file);
      });
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form',
        },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          const event = new CustomEvent('upload-progress', { 
            detail: { progress: percentCompleted } 
          });
          document.dispatchEvent(event);
        },
      };
      
      const response = await apiClient.post(`/pieces_jointes/${tacheId}`, formData, config);
      console.log('details:', response.data);
      return response.data.pieces_jointes;
    } catch (error) {
      console.error('Erreur lors du téléchargement de la pièce jointe:', error);
      throw error;
    }
  },

  // Supprimer une pièce jointe
  deletePieceJointe: async (pieceJointeId: number) => {
    try {
      const response = await apiClient.delete(`/pieces_jointes/${pieceJointeId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la pièce jointe:', error);
      throw error;
    }
  },

  // Télécharger une pièce jointe
  downloadPieceJointe: async (pieceJointeId: number) => {
    try {
      const response = await apiClient.get(`/pieces_jointes/download/${pieceJointeId}`, {
        responseType: 'blob',
      });
      
      // Créer un URL pour le blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Récupérer le nom du fichier depuis les headers si disponible
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'download';
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      
      // Créer un élément a pour déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Erreur lors du téléchargement de la pièce jointe:', error);
      throw error;
    }
  },
};

export default {
  piecesJointesService,
};