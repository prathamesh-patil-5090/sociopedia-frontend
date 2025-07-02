import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { GoogleLogin } from 'react-google-login';
import { gapi } from 'gapi-script';
import { useDispatch } from 'react-redux';
import { setLogin } from 'state';
import { useNavigate } from 'react-router-dom';
import googleConfig from '../config/googleConfig';

const GoogleLoginButton = ({ onSuccess, onError, disabled }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeGapi = async () => {
      await gapi.load('auth2', () => {
        gapi.auth2.init({
          client_id: googleConfig.clientId,
        });
      });
    };
    initializeGapi();
  }, []);

  const handleGoogleSuccess = async (response) => {
    console.log('Google Login Success:', response);
    
    try {
      const { tokenId, profileObj } = response;
      
      // Send the token to your backend
      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/callback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token: tokenId,
          profile: profileObj
        }),
      });

      const result = await backendResponse.json();

      if (backendResponse.ok && result.user && result.tokens) {
        // Store tokens
        localStorage.setItem('token', result.tokens.access);
        localStorage.setItem('refreshToken', result.tokens.refresh);

        // Set user in Redux store
        dispatch(setLogin({
          user: result.user,
          token: result.tokens.access
        }));

        console.log('Google OAuth successful:', result.message);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
        
        // Redirect to home page
        navigate('/');
      } else {
        console.error('Google OAuth exchange failed:', result);
        if (onError) {
          onError(new Error(result.error || 'Authentication failed'));
        }
      }
    } catch (error) {
      console.error('Error handling Google login:', error);
      if (onError) {
        onError(error);
      }
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google Login Error:', error);
    if (onError) {
      onError(error);
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <GoogleLogin
        clientId={googleConfig.clientId}
        onSuccess={handleGoogleSuccess}
        onFailure={handleGoogleFailure}
        disabled={disabled}
        buttonText="Continue with Google"
        cookiePolicy={'single_host_origin'}
        className="google-login-button"
        style={{
          width: '100%',
          height: '44px'
        }}
      />
    </Box>
  );
};

export default GoogleLoginButton;
