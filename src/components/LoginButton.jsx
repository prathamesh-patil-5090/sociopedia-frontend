import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";
import { Button } from "@mui/material";
import { Login } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import { useNavigate } from "react-router-dom";

const LoginButton = () => {
  const { loginWithRedirect, user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sync Auth0 user with Django when authenticated
  useEffect(() => {
    const syncAuth0User = async () => {
      if (isAuthenticated && user) {
        try {
          console.log('Auth0 user authenticated, syncing with Django:', user);
          
          // Send user data to Django backend
          const apiUrl = `${import.meta.env.VITE_API_URL}/auth/auth0/sync/`;
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user }),
          });

          const result = await response.json();

          if (response.ok && result.user && result.tokens) {
            // Store Django JWT tokens
            localStorage.setItem('token', result.tokens.access);
            localStorage.setItem('refreshToken', result.tokens.refresh);

            // Set user in Redux store with Django user data
            dispatch(setLogin({
              user: result.user,
              token: result.tokens.access
            }));

            console.log('Auth0 user successfully synced with Django.');
            
            // Redirect to home page
            navigate('/');
          } else {
            console.error('Auth0 user sync failed:', result);
            alert('Login failed: ' + (result.error || 'Unknown error'));
          }
        } catch (error) {
          console.error('Error syncing Auth0 user:', error);
          alert('Login error: ' + error.message);
        }
      }
    };

    syncAuth0User();
  }, [isAuthenticated, user, dispatch, navigate]);

  return (
    <Button
      variant="contained"
      startIcon={<Login />}
      onClick={() => loginWithRedirect()}
      fullWidth
      sx={{
        backgroundColor: "#6f42c1",
        "&:hover": {
          backgroundColor: "#5a2d91",
        },
        padding: "12px",
        fontSize: "1rem",
        color: "white",
        mb: 2
      }}
    >
      Log In with Auth0
    </Button>
  );
};

export default LoginButton;
