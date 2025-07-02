// Google OAuth configuration
export const googleConfig = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || "414505287097-s3l5sc2lsfmllqusgc420egsg0u0f9mh.apps.googleusercontent.com",
  redirectUri: window.location.origin + "/auth/google/callback",
  scope: "openid profile email"
};

// Debug logging
console.log('Google OAuth Config:', {
  clientId: googleConfig.clientId,
  redirectUri: googleConfig.redirectUri,
  currentOrigin: window.location.origin,
  environment: process.env.NODE_ENV
});

console.log('Environment variables:', {
  REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  NODE_ENV: process.env.NODE_ENV
});

export default googleConfig;
