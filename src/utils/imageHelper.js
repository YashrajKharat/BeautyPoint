// Placeholder image as SVG data URI
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23f0f0f0" width="300" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';

// Image URL helper - handles both base64 images from DB and file paths
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return PLACEHOLDER_IMAGE;
  }
  
  // If it's already a base64 data URL, return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // If it's already a full HTTP URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // For file paths, extract filename and use API endpoint
  const filename = imagePath.split('/').pop();
  
  // Get the base server URL
  const baseUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/api', '') 
    : `${window.location.protocol}//${window.location.hostname}:5000`;
  
  // Return API endpoint for image serving
  return `${baseUrl}/api/image/${filename}`;
};

export const getPlaceholderImage = () => PLACEHOLDER_IMAGE;

export default getImageUrl;
