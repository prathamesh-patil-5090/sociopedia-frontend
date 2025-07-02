import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Google } from '@mui/icons-material';

const GoogleOAuthTest = () => {
  const CLIENT_ID = "414505287097-s3l5sc2lsfmllqusgc420egsg0u0f9mh.apps.googleusercontent.com";
  
  const handleGoogleLogin = () => {
    const currentOrigin = window.location.origin;
    const redirectUri = `${currentOrigin}/auth/google/callback`;
    
    console.log('Current origin:', currentOrigin);
    console.log('Redirect URI:', redirectUri);
    
    // Create the OAuth URL manually
    const authUrl = new URL('https://accounts.google.com/oauth/authorize');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', 'openid profile email');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');
    
    console.log('OAuth URL:', authUrl.toString());
    
    // Redirect to Google
    window.location.href = authUrl.toString();
  };

  return (
    <Box p={4}>
      <Paper sx={{ p: 4, maxWidth: 500, margin: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Google OAuth Test
        </Typography>
        
        <Typography variant="body2" gutterBottom>
          Current Origin: {window.location.origin}
        </Typography>
        
        <Typography variant="body2" gutterBottom>
          Expected Redirect: {window.location.origin}/auth/google/callback
        </Typography>
        
        <Typography variant="body2" gutterBottom>
          Client ID: {CLIENT_ID}
        </Typography>
        
        <Box mt={3}>
          <Button
            variant="contained"
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            fullWidth
            sx={{
              backgroundColor: "#db4437",
              "&:hover": { backgroundColor: "#c23321" }
            }}
          >
            Test Google OAuth
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default GoogleOAuthTest;
