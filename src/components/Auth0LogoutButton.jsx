import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";
import { Logout } from "@mui/icons-material";

const Auth0LogoutButton = () => {
  const { logout, isLoading } = useAuth0();

  return (
    <Button
      variant="outlined"
      color="error"
      startIcon={<Logout />}
      onClick={() => logout({ 
        logoutParams: { 
          returnTo: window.location.origin 
        } 
      })}
      disabled={isLoading}
      sx={{
        borderColor: "#EB5424",
        color: "#EB5424",
        "&:hover": {
          borderColor: "#d4491f",
          backgroundColor: "rgba(235, 84, 36, 0.04)",
        }
      }}
    >
      {isLoading ? "Loading..." : "Log Out"}
    </Button>
  );
};

export default Auth0LogoutButton;
