import { Auth0Provider } from '@auth0/auth0-react';

const Auth0ProviderWithHistory = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN || process.env.VITE_AUTH0_DOMAIN || 'dev-ky61d7o57d3oues7.uk.auth0.com';
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || process.env.VITE_AUTH0_CLIENT_ID || 'XXWujHgpKJcxdsf5YaFXYpOkoPKCOAec';
  const redirectUri = window.location.origin;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: "openid profile email"
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
