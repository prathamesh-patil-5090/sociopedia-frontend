import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { 
  Box, 
  Card, 
  CardContent, 
  Avatar, 
  Typography, 
  CircularProgress 
} from "@mui/material";

const Auth0Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading profile...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Card sx={{ maxWidth: 400, margin: "auto", mt: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={user?.picture}
            alt={user?.name}
            sx={{ width: 64, height: 64, mr: 2 }}
          />
          <Box>
            <Typography variant="h6" component="h2">
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
        
        {user?.email_verified && (
          <Typography variant="caption" color="success.main">
            ✓ Email Verified
          </Typography>
        )}
        
        {/* Debug info - remove in production */}
        <Box mt={2} p={1} bgcolor="grey.100" borderRadius={1}>
          <Typography variant="caption" display="block">
            <strong>Auth0 ID:</strong> {user?.sub}
          </Typography>
          <Typography variant="caption" display="block">
            <strong>Last Updated:</strong> {user?.updated_at}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Auth0Profile;
