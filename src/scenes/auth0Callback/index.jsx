import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLogin } from 'state';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth0Integration } from '../../services/Auth0Service';

const Auth0Callback = () => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const { exchangeTokenAndLogin } = useAuth0Integration();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      if (isAuthenticated && user && !isLoading) {
        try {
          // Exchange Auth0 token for backend JWT
          const backendResponse = await exchangeTokenAndLogin();
          
          if (backendResponse && backendResponse.user && backendResponse.token) {
            // Set user in Redux store
            dispatch(setLogin({
              user: backendResponse.user,
              token: backendResponse.token
            }));
            
            // Store tokens in localStorage
            localStorage.setItem("token", backendResponse.token);
            if (backendResponse.refresh_token) {
              localStorage.setItem("refreshToken", backendResponse.refresh_token);
            }
            
            // Redirect to home page
            navigate("/");
          } else {
            console.error("Invalid response from backend");
            navigate("/");
          }
        } catch (error) {
          console.error("Error during Auth0 callback:", error);
          navigate("/");
        }
      } else if (!isLoading && !isAuthenticated) {
        // If not authenticated, redirect to home
        navigate("/");
      }
    };

    handleCallback();
  }, [isAuthenticated, isLoading, user, navigate, dispatch, exchangeTokenAndLogin]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">
          Processing authentication...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">
        Redirecting...
      </Typography>
    </Box>
  );
};

export default Auth0Callback;
