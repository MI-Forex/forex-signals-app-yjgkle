import { Alert } from 'react-native';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
}

// Cloudinary configuration using the provided credentials
const CLOUDINARY_CONFIG = {
  cloudName: 'dnoc2vnqb',
  apiKey: '358947224699173',
  apiSecret: 'kzv7yRhX2vueOP_lw-uvyztM7zo',
  uploadPreset: 'cncapp', // Using the provided upload preset
  uploadUrl: 'https://api.cloudinary.com/v1_1/dnoc2vnqb/image/upload'
};

export const uploadImageToCloudinary = async (
  imageUri: string,
  folder: string = 'analysis'
): Promise<string | null> => {
  try {
    console.log('Cloudinary: Starting image upload to folder:', folder);
    console.log('Cloudinary: Using upload preset:', CLOUDINARY_CONFIG.uploadPreset);
    
    // Create form data
    const formData = new FormData();
    
    // Add the image file
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `analysis_${Date.now()}.jpg`,
    } as any);
    
    // Add upload parameters for unsigned upload
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', folder);
    
    // Add quality and format optimizations
    formData.append('quality', 'auto:good');
    formData.append('fetch_format', 'auto');
    
    console.log('Cloudinary: Uploading to URL:', CLOUDINARY_CONFIG.uploadUrl);
    
    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Cloudinary: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary: Upload failed with status:', response.status, errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result: CloudinaryUploadResult = await response.json();
    console.log('Cloudinary: Upload successful, URL:', result.secure_url);
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary: Upload error:', error);
    Alert.alert(
      'Upload Error',
      `Failed to upload image. Please check your internet connection and try again.`
    );
    return null;
  }
};

export const deleteImageFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    console.log('Cloudinary: Deleting image with public ID:', publicId);
    
    // For deletion, you would typically need to use your backend
    // as it requires the API secret which shouldn't be exposed in the frontend
    // For now, we'll just log this action
    console.log('Cloudinary: Image deletion would be handled by backend');
    
    return true;
  } catch (error) {
    console.error('Cloudinary: Delete error:', error);
    return false;
  }
};

export const getOptimizedImageUrl = (
  originalUrl: string,
  width?: number,
  height?: number,
  quality: number = 80
): string => {
  if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
    return originalUrl;
  }

  try {
    // Extract the public ID and other parts from the URL
    const urlParts = originalUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return originalUrl;
    }

    // Build transformation parameters for faster loading
    const transformations = [];
    
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push('f_auto'); // Auto format (WebP, AVIF when supported)
    transformations.push('c_fill'); // Fill mode for consistent sizing
    transformations.push('g_auto'); // Auto gravity for smart cropping
    
    const transformationString = transformations.join(',');
    
    // Insert transformations into URL
    const beforeUpload = urlParts.slice(0, uploadIndex + 1);
    const afterUpload = urlParts.slice(uploadIndex + 1);
    
    const optimizedUrl = [
      ...beforeUpload,
      transformationString,
      ...afterUpload
    ].join('/');
    
    console.log('Cloudinary: Generated optimized URL:', optimizedUrl);
    return optimizedUrl;
  } catch (error) {
    console.error('Cloudinary: Error generating optimized URL:', error);
    return originalUrl;
  }
};

// Preload images for faster display
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

// Get thumbnail URL for faster loading in lists
export const getThumbnailUrl = (originalUrl: string): string => {
  return getOptimizedImageUrl(originalUrl, 300, 200, 70);
};

// Get full-size optimized URL for detail views
export const getFullSizeUrl = (originalUrl: string): string => {
  return getOptimizedImageUrl(originalUrl, 800, 600, 85);
};