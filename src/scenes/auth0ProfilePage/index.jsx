import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";
import Profile from "components/Profile";
import LogoutButton from "components/LogoutButton";
import Navbar from "scenes/navbar";

const Auth0ProfilePage = () => {
  const theme = useTheme();
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Box>
        <Navbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Typography>Loading...</Typography>
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box>
        <Navbar />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" flexDirection="column" gap={2}>
          <Typography variant="h5">Please log in to view your profile</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
        flexDirection="column"
        gap={3}
        p={3}
      >
        <Typography variant="h4" mb={2} textAlign="center">
          Auth0 Profile
        </Typography>
        
        <Profile />
        
        <LogoutButton />
      </Box>
    </Box>
  );
};

export default Auth0ProfilePage;
