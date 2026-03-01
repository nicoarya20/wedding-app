export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

// Cloudinary configuration
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'wedding_app_preset';

/**
 * Upload image to Cloudinary using unsigned upload
 * @param file - The file to upload
 * @param folder - Optional folder within Cloudinary
 */
export async function uploadImage(
  file: File,
  folder?: string
): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    if (folder) {
      formData.append('folder', folder);
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadMultipleImages(
  files: File[],
  folder?: string
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map(file => uploadImage(file, folder))
  );
  return results;
}

/**
 * Delete image from Cloudinary
 * Note: Requires signed upload with signature for deletion
 * Since we're in a client-side app, we'll use the Cloudinary API directly
 * WARNING: This exposes your API_SECRET - use only in development
 * For production, create a serverless function to handle deletion
 */
export async function deleteImage(
  publicId: string
): Promise<boolean> {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.warn('Cloudinary credentials not configured. Skipping Cloudinary deletion.');
      return true; // Return true to allow database deletion anyway
    }

    // Create base64 encoded auth header
    const credentials = btoa(`${apiKey}:${apiSecret}`);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;

    const formData = new FormData();
    formData.append('public_id', publicId);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary delete error:', errorData);
      throw new Error(errorData.error?.message || 'Delete failed');
    }

    const data = await response.json();
    
    if (data.result !== 'ok') {
      console.warn('Cloudinary delete result:', data.result);
    }

    return true;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    // Return true anyway to allow database deletion
    return true;
  }
}

/**
 * Get Cloudinary image URL with transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: string;
    crop?: string;
  }
): string {
  const transformations = [];
  
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.quality) transformations.push(`q_${options.quality}`);
  if (options?.crop) transformations.push(`c_${options.crop}`);
  
  const transformation = transformations.length > 0 
    ? transformations.join(',') + '/' 
    : '';

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformation}${publicId}`;
}

/**
 * Create a React ref for file input
 */
export function createFileInputRef() {
  let resolvePromise: ((value: File | null) => void) | null = null;

  const promise = new Promise<File | null>((resolve) => {
    resolvePromise = resolve;
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (resolvePromise) {
      resolvePromise(file);
    }
    // Reset the input
    event.target.value = '';
  };

  return { promise, handleChange };
}
