import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { Box, Typography, useTheme, useMediaQuery, Paper } from "@mui/material";
import Form from "./Form";

const LoginPage = () => {
  const theme = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Box
        width="100%"
        backgroundColor={theme.palette.background.alt}
        p="1rem 6%"
        textAlign="center"
        boxShadow="0 2px 10px rgba(0,0,0,0.1)"
      >
        <Typography
          fontWeight="bold"
          fontSize="32px"
          color="primary"
          sx={{
            "&:hover": { color: theme.palette.primary.light },
            transition: "color 0.3s ease",
          }}
        >
          Socipedia
        </Typography>
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexGrow={1}
        p="2rem"
      >
        <Paper
          elevation={3}
          sx={{
            width: isNonMobileScreens ? "50%" : "100%",
            maxWidth: "500px",
            p: "2rem",
            borderRadius: "1.5rem",
            backgroundColor: theme.palette.background.alt,
          }}
        >
          <Typography
            fontWeight="500"
            variant="h5"
            sx={{ mb: "1rem", textAlign: "center" }}
          >
            Welcome to Socipedia!
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mb: "1.5rem", textAlign: "center" }}
          >
            Connect, Share, and Engage with your community
          </Typography>
          <Form />
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;
