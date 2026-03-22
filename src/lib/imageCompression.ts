import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.3, // 300KB
    maxWidthOrHeight: 1200, // Largura máxima 1200px (altura é proporcional)
    useWebWorker: true, // Performance: usar Web Worker para não travar a UI
    initialQuality: 0.7, // Qualidade entre 0.6 e 0.75
    fileType: 'image/webp' // Converter para formato WebP moderno
  };

  try {
    // Check if it's already a lightweight webp, though usually we can just run compression anyway.
    const compressedFile = await imageCompression(file, options);
    
    // Fallback if the compressed file is magically larger than original?
    // imageCompression handles this internally, but we can return the smallest
    if (compressedFile.size > file.size && file.type === 'image/webp') {
      return file;
    }
    
    return compressedFile;
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    // Fallback: Se falhar, retorna o arquivo original sem bloquear o upload
    return file;
  }
}
