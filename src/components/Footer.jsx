import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        textAlign: "center",
        py: 2,
        mt: "auto",
        backgroundColor: (theme) => theme.palette.background.alt,
      }}
    >
      <Typography>
        Made with Love 💝 by{" "}
        <Link
          href="https://github.com/prathamesh-patil-5090"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
        >
          Socipedia
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;
