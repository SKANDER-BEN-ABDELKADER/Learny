// Utility to test token expiration functionality
// This file can be used for testing purposes

export const createTestToken = (expirationMinutes = 1) => {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (expirationMinutes * 60);
  
  const header = {
    alg: "HS256",
    typ: "JWT"
  };
  
  const payload = {
    sub: "test-user-id",
    email: "test@example.com",
    role: "student",
    exp: exp,
    iat: now
  };
  
  // Note: This creates a test token without proper signing
  // In real implementation, tokens are signed by the backend
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = "test-signature";
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration time:', error);
    return null;
  }
};
