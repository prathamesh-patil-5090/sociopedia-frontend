// Auth0 configuration following official Auth0 React SDK pattern
export const auth0Config = {
  domain: "dev-adyzfstootqoalc2.us.auth0.com",
  clientId: "MDUa36K7uRg6iFxg1TkDZGqd7nsg48aI",
  authorizationParams: {
    redirect_uri: window.location.origin + "/callback",
    scope: "openid profile email"
  }
};

// Debug logging
console.log('Auth0 Config:', {
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  redirectUri: auth0Config.authorizationParams.redirect_uri,
  currentOrigin: window.location.origin
});

export default auth0Config;
