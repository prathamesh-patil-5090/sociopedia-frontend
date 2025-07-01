// Auth0 configuration
export const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || "dev-ky61d7o57d3oues7.uk.auth0.com",
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || "XXWujHgpKJcxdsf5YaFXYpOkoPKCOAec",
  redirectUri: window.location.origin + "/callback",
  audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN || "dev-ky61d7o57d3oues7.uk.auth0.com"}/api/v2/`,
  scope: "openid profile email read:current_user update:current_user_metadata"
};

// Debug logging
console.log('Auth0 Config:', {
  domain: auth0Config.domain,
  clientId: auth0Config.clientId,
  redirectUri: auth0Config.redirectUri,
  currentOrigin: window.location.origin
});

export default auth0Config;
