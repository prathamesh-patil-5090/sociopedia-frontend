import { Box, useMediaQuery, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const isAuth = Boolean(useSelector((state) => state.token));
  const user = useSelector((state) => state.user) || {};
  const { _id, picturePath } = user;

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        flexDirection={isNonMobileScreens ? "row" : "column"}
        gap="2rem"
        justifyContent="flex-start"
        alignItems="flex-start"
        flexGrow={1}
      >
        {/* Left Column - UserWidget (only for authenticated users) */}
        {isAuth && isNonMobileScreens && (
          <Box 
            flexBasis="26%" 
            sx={{
              position: "sticky",
              top: "100px",
              height: "fit-content",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
            }}
          >
            <UserWidget userId={_id} picturePath={picturePath} />
          </Box>
        )}

        {/* Middle Column - Posts */}
        <Box
          flexBasis={isNonMobileScreens ? (isAuth ? "46%" : "74%") : "100%"}
          sx={{
            width: "100%",
          }}
        >
          {!isAuth && (
            <Typography 
              variant="h5" 
              textAlign="center" 
              mb={2}
              color="text.secondary"
              sx={{ fontWeight: 300 }}
            >
              Welcome to Socipedia! Browse posts or{" "}
              <Typography 
                component="span" 
                sx={{ 
                  cursor: "pointer", 
                  textDecoration: "underline",
                  fontWeight: 500,
                  color: "#00d5ff", // Bright blue that works in both modes
                  "&:hover": {
                    color: "#0099cc",
                  }
                }}
                onClick={() => window.location.href = "/login"}
              >
                login
              </Typography>
              {" "}to interact
            </Typography>
          )}
          
          {/* Mobile UserWidget (only for authenticated users) */}
          {isAuth && !isNonMobileScreens && (
            <Box mb="2rem">
              <UserWidget userId={_id} picturePath={picturePath} />
            </Box>
          )}
          
          {/* MyPostWidget (only for authenticated users) */}
          {isAuth && <MyPostWidget picturePath={picturePath} />}
          
          {/* Posts are shown to everyone */}
          <PostsWidget userId={_id} isAuth={isAuth} />
        </Box>

        {/* Right Column - FriendListWidget (only for authenticated users) */}
        {isAuth && isNonMobileScreens && (
          <Box 
            flexBasis="26%" 
            sx={{
              position: "sticky",
              top: "100px",
              height: "fit-content",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
              marginLeft: "auto"
            }}
          >
            <FriendListWidget userId={_id} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HomePage;
