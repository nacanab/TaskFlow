import { useState, useEffect } from 'react';
import { Paperclip, X, FileText, Download, Image, File } from 'lucide-react';
import { piecesJointesService } from '../api/apiService';

// Utilisation des interfaces existantes
interface PieceJointe {
  id: number;
  nom: string;
  type: string;
  url: string;
  tache_id: number;
}

interface Tache {
  id: number;
  titre: string;
  description: string;
  priorite: string;
  statut: string;
  date_debut: string;
  date_fin: string;
  projet_id: number;
  user_id: number | null;
  jalon_id: number | null;
  tags_id: number | null;
  pieces_jointes?: PieceJointe[];
}

// Composant pour gérer les pièces jointes d'une tâche
export function TaskAttachments({ tache, onUpdate }: { tache: Tache, onUpdate?: () => void }) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [attachments, setAttachments] = useState<PieceJointe[]>(tache.pieces_jointes ?? []);

  // Écouter les événements de progression d'upload
  useEffect(() => {
    const handleUploadProgress = (event: CustomEvent) => {
      setUploadProgress(event.detail.progress);
    };

    // Ajouter l'écouteur d'événement
    document.addEventListener('upload-progress', handleUploadProgress as EventListener);

    // Nettoyer l'écouteur d'événement
    return () => {
      document.removeEventListener('upload-progress', handleUploadProgress as EventListener);
    };
  }, []);

  // Mettre à jour les pièces jointes si la tâche change
  useEffect(() => {
    if (tache.pieces_jointes) {
      setAttachments(tache.pieces_jointes);
    } else {
      // Si la tâche n'a pas de pièces jointes, les récupérer depuis l'API
      fetchAttachments(tache.id);
    }
  }, [tache]);

  // Récupérer les pièces jointes depuis l'API
  const fetchAttachments = async (tacheId: number) => {
    try {
      const pieces = await piecesJointesService.getPiecesJointes(tacheId);
      setAttachments(pieces);
    } catch (error) {
      console.error('Erreur lors de la récupération des pièces jointes:', error);
    }
  };

  // Gérer la sélection de fichiers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    uploadFiles(Array.from(files), tache.id);
  };

  // Télécharger les fichiers
  const uploadFiles = async (files: File[], tacheId: number) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Appel API réel pour uploader les fichiers
      const newAttachments = await piecesJointesService.uploadPieceJointe(tacheId, files);
      
      // Mettre à jour la liste des pièces jointes
      setAttachments(prev => {
        console.log('prev:', prev);
        console.log('new:', newAttachments);
        return [...prev, ...newAttachments];
      });
      
      // Appeler le callback de mise à jour si fourni
      if (onUpdate) {
        onUpdate();
      }
      
      // Réinitialiser l'état
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        
        // Réinitialiser le champ de fichier
        if (document.getElementById('file-upload')) {
          (document.getElementById('file-upload') as HTMLInputElement).value = '';
        }
      }, 500);
    } catch (error) {
      console.error('Erreur lors du téléchargement des pièces jointes:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Supprimer une pièce jointe
  const supprimerPieceJointe = async (pieceJointeId: number) => {
    try {
      // Appel API réel pour supprimer la pièce jointe
      await piecesJointesService.deletePieceJointe(pieceJointeId);
      
      // Mettre à jour la liste locale
      setAttachments(prev => prev.filter(piece => piece.id !== pieceJointeId));
      
      // Appeler le callback de mise à jour si fourni
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la pièce jointe:', error);
    }
  };

  // Télécharger une pièce jointe
  const downloadPieceJointe = async (pieceJointeId: number) => {
    try {
      await piecesJointesService.downloadPieceJointe(pieceJointeId);
    } catch (error) {
      console.error('Erreur lors du téléchargement de la pièce jointe:', error);
    }
  };

  // Obtenir l'icône appropriée pour le type de fichier
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (fileType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mt-4">
      <div className="flex items-center mb-3">
        <Paperclip className="w-5 h-5 text-gray-500 mr-2" />
        <h4 className="text-sm font-medium">Pièces jointes</h4>
      </div>

      {/* Liste des pièces jointes existantes */}
      {attachments.length > 0 ? (
        <ul className="space-y-2 mb-4">
          {attachments.map((piece) => (
            <li key={piece.id} className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm">
              <div className="flex items-center overflow-hidden">
                {getFileIcon(piece.fichier_url.split('.').pop())}
                <span className="ml-2 truncate max-w-xs">{piece.fichier_url.split('/').pop()}</span>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button 
                  onClick={() => downloadPieceJointe(piece.id)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => supprimerPieceJointe(piece.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Supprimer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 mb-3">Aucune pièce jointe</p>
      )}

      {/* Zone d'upload */}
      <div className="mt-2">
        <label htmlFor={`file-upload-${tache.id}`} className="cursor-pointer bg-white border border-gray-300 rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Paperclip className="w-5 h-5 mr-2 text-gray-500" />
          <span>Ajouter une pièce jointe</span>
          <input
            id={`file-upload-${tache.id}`}
            name={`file-upload-${tache.id}`}
            type="file"
            className="sr-only"
            multiple
            onChange={handleFileSelect}
            disabled={isUploading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt,.zip,.rar"
          />
        </label>
        <p className="text-xs text-gray-500 mt-1">
          PDF, Word, Excel, images, texte, ZIP (max. 10 MB)
        </p>
      </div>

      {/* Barre de progression */}
      {isUploading && (
        <div className="mt-2">
          <div className="bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {uploadProgress < 100 ? `Téléchargement en cours... ${uploadProgress}%` : 'Téléchargement terminé'}
          </p>
        </div>
      )}
    </div>
  );
}