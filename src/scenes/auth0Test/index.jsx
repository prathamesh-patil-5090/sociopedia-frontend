import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Container, Typography, Paper } from "@mui/material";
import Auth0Profile from "../../components/Auth0Profile";
import Auth0LogoutButton from "../../components/Auth0LogoutButton";

const Auth0TestPage = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" align="center">
          Loading Auth0...
        </Typography>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Auth0 Test Page
          </Typography>
          <Typography variant="body1">
            You need to be logged in to view this page.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Auth0 Integration Test
        </Typography>
        
        <Typography variant="h6" gutterBottom color="success.main" align="center">
          ✅ Successfully Authenticated with Auth0!
        </Typography>
        
        <Auth0Profile />
        
        <Box display="flex" justifyContent="center" mt={3}>
          <Auth0LogoutButton />
        </Box>
      </Paper>
    </Container>
  );
};

export default Auth0TestPage;
