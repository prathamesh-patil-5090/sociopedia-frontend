import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { 
  Box, 
  Avatar, 
  Typography, 
  CircularProgress,
  Paper
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const theme = useTheme();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading ...
        </Typography>
      </Box>
    );
  }

  return (
    isAuthenticated && (
      <Paper 
        elevation={2}
        sx={{ 
          p: 3, 
          borderRadius: 2,
          backgroundColor: theme.palette.background.alt,
          textAlign: "center"
        }}
      >
        <Avatar
          src={user.picture}
          alt={user.name}
          sx={{ 
            width: 80, 
            height: 80, 
            mx: "auto", 
            mb: 2,
            border: `3px solid ${theme.palette.primary.main}`
          }}
        />
        <Typography variant="h6" fontWeight="600" mb={1}>
          {user.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {user.email}
        </Typography>
      </Paper>
    )
  );
};

export default Profile;
