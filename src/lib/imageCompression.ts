import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File | Blob> {
  const options = {
    maxSizeMB: 0.3, // 300KB
    maxWidthOrHeight: 1024, // 1024px (altura proporcional)
    useWebWorker: false, // Desativado para evitar problemas de caminho em alguns ambientes
    initialQuality: 0.7,
    fileType: 'image/webp'
  };

  try {
    // Se o arquivo já for muito pequeno e webp, ignora (opcional)
    if (file.size < 100 * 1024 && file.type === 'image/webp') {
      return file;
    }

    const compressedBlob = await imageCompression(file, options);
    
    // browser-image-compression pode retornar Blob ou File. 
    // Se for Blob, vamos tentar transformá-lo num novo File para manter o nome original se possível.
    if (compressedBlob instanceof Blob && !(compressedBlob instanceof File)) {
      return new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
        type: 'image/webp',
        lastModified: Date.now(),
      });
    }

    return compressedBlob;
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    return file; // Fallback para o original
  }
}
