import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLogin } from 'state';
import { Box, CircularProgress, Typography } from '@mui/material';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Step 6: Validate the state parameter and send code to backend
      
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        console.error('Google OAuth error:', error);
        localStorage.removeItem("latestCSRFToken");
        navigate('/login?error=google_oauth_failed');
        return;
      }

      if (!code) {
        console.error('No code parameter in Google callback');
        localStorage.removeItem("latestCSRFToken");
        navigate('/login?error=no_code');
        return;
      }

      // Validate the state parameter
      const storedState = localStorage.getItem("latestCSRFToken");
      if (state !== storedState) {
        console.error('State parameter mismatch - possible CSRF attack');
        localStorage.removeItem("latestCSRFToken");
        navigate('/login?error=csrf_validation_failed');
        return;
      }

      // Clear the CSRF token
      localStorage.removeItem("latestCSRFToken");

      try {
        console.log('Google OAuth code received:', code);
        
        // Step 6: Send the code to the backend for token exchange
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/callback/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code: code,
            state: state 
          }),
        });

        const result = await response.json();

        if (response.ok && result.user && result.tokens) {
          // Store tokens
          localStorage.setItem('token', result.tokens.access);
          localStorage.setItem('refreshToken', result.tokens.refresh);

          // Set user in Redux store
          dispatch(setLogin({
            user: result.user,
            token: result.tokens.access
          }));

          console.log('Google OAuth successful:', result.message);
          
          // Redirect to home page
          navigate('/');
        } else {
          console.error('Google OAuth exchange failed:', result);
          navigate('/login?error=token_exchange_failed');
        }
      } catch (error) {
        console.error('Error handling Google callback:', error);
        navigate('/login?error=callback_failed');
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={50} />
      <Typography variant="h6">
        Completing Google Sign-In...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we process your authentication.
      </Typography>
    </Box>
  );
};

export default GoogleCallback;
