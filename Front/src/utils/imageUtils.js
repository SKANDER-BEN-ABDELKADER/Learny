// Utility function to construct full image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it starts with /uploads, prepend the API base URL
  if (imagePath.startsWith('/uploads')) {
    return `http://localhost:3000${imagePath}`;
  }
  
  // If it's just a filename, assume it's in uploads
  return `http://localhost:3000/uploads/${imagePath}`;
};

// Utility function to get profile picture URL with fallback
export const getProfilePicUrl = (profilePicUrl, fallback = '/placeholder.svg') => {
  const fullUrl = getImageUrl(profilePicUrl);
  return fullUrl || fallback;
};
