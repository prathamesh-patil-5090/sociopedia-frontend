import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Button } from "@mui/material";
import { Logout } from "@mui/icons-material";

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <Button
      variant="outlined"
      startIcon={<Logout />}
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      sx={{
        color: "#6f42c1",
        borderColor: "#6f42c1",
        "&:hover": {
          backgroundColor: "#6f42c1",
          color: "white",
        },
        padding: "8px 16px",
        fontSize: "0.9rem",
      }}
    >
      Log Out
    </Button>
  );
};

export default LogoutButton;
