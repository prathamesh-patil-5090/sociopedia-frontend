import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";
import { Login } from "@mui/icons-material";

const Auth0LoginButton = () => {
  const { loginWithRedirect, isLoading } = useAuth0();

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<Login />}
      onClick={() => loginWithRedirect()}
      disabled={isLoading}
      fullWidth
      sx={{
        backgroundColor: "#EB5424",
        "&:hover": {
          backgroundColor: "#d4491f",
        },
        padding: "12px",
        fontSize: "1rem"
      }}
    >
      {isLoading ? "Loading..." : "Log In with Auth0"}
    </Button>
  );
};

export default Auth0LoginButton;
