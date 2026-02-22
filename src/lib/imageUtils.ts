/**
 * Utilitaires pour le traitement d'images côté client
 * Gère la compression, le redimensionnement et la correction d'orientation
 */

export interface ProcessedImage {
  file: File;
  preview: string; // base64 data URL
  originalSize: number;
  processedSize: number;
}

/**
 * Compresse et redimensionne une image pour l'upload
 * @param file - Fichier image original
 * @param maxWidth - Largeur maximale (défaut: 1920px)
 * @param maxHeight - Hauteur maximale (défaut: 1920px)
 * @param quality - Qualité JPEG (0-1, défaut: 0.85)
 * @param maxSizeMB - Taille maximale en MB (défaut: 5MB)
 */
export async function processImageForUpload(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.85,
  maxSizeMB: number = 5
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        
        img.onload = async () => {
          try {
            // Créer un canvas pour redimensionner et compresser
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Calculer les nouvelles dimensions en gardant le ratio
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Dessiner l'image sur le canvas
            // Le canvas corrige automatiquement l'orientation EXIF dans la plupart des navigateurs
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              throw new Error('Impossible de créer le contexte canvas');
            }
            
            // Utiliser imageOrientation pour forcer la correction si nécessaire
            // Par défaut, le navigateur corrige automatiquement, mais on peut forcer avec CSS
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convertir en blob JPEG avec compression
            canvas.toBlob(
              async (blob) => {
                if (!blob) {
                  reject(new Error('Échec de la conversion en blob'));
                  return;
                }
                
                // Vérifier la taille finale
                const sizeMB = blob.size / (1024 * 1024);
                if (sizeMB > maxSizeMB) {
                  // Réessayer avec une qualité plus faible
                  const lowerQuality = Math.max(0.5, quality - 0.1);
                  canvas.toBlob(
                    async (finalBlob) => {
                      if (!finalBlob) {
                        reject(new Error('Échec de la compression'));
                        return;
                      }
                      
                      const finalFile = new File([finalBlob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                      });
                      
                      // Créer la preview
                      const previewReader = new FileReader();
                      previewReader.onload = (e) => {
                        resolve({
                          file: finalFile,
                          preview: e.target?.result as string,
                          originalSize: file.size,
                          processedSize: finalFile.size,
                        });
                      };
                      previewReader.onerror = () => reject(new Error('Erreur lors de la création de la preview'));
                      previewReader.readAsDataURL(finalFile);
                    },
                    'image/jpeg',
                    lowerQuality
                  );
                } else {
                  const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  
                  // Créer la preview
                  const previewReader = new FileReader();
                  previewReader.onload = (e) => {
                    resolve({
                      file: processedFile,
                      preview: e.target?.result as string,
                      originalSize: file.size,
                      processedSize: processedFile.size,
                    });
                  };
                  previewReader.onerror = () => reject(new Error('Erreur lors de la création de la preview'));
                  previewReader.readAsDataURL(processedFile);
                }
              },
              'image/jpeg',
              quality
            );
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => {
          reject(new Error('Impossible de charger l\'image'));
        };
        
        // Charger l'image
        img.src = dataUrl;
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Vérifie si un fichier est un format d'image supporté
 */
export function isImageFile(file: File): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
  ];
  
  return supportedTypes.some(type => file.type.toLowerCase().includes(type.split('/')[1]));
}

/**
 * Vérifie si le fichier est trop volumineux
 */
export function isFileTooLarge(file: File, maxSizeMB: number = 10): boolean {
  return file.size > maxSizeMB * 1024 * 1024;
}
