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
  const isDummyUser = user?._id === "67b1d55da90d9304b1f869d5";

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
        {/* Left Column - UserWidget */}
        {isAuth && !isDummyUser && isNonMobileScreens && (
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
          flexBasis={isNonMobileScreens ? (isAuth && !isDummyUser ? "46%" : "74%") : "100%"}
          sx={{
            width: "100%",
          }}
        >
          {isDummyUser && (
            <Typography 
              variant="h5" 
              textAlign="center" 
              mb={2}
              color="primary"
            >
              Please login or register to interact with posts
            </Typography>
          )}
          
          {/* Mobile UserWidget */}
          {isAuth && !isDummyUser && !isNonMobileScreens && (
            <Box mb="2rem">
              <UserWidget userId={_id} picturePath={picturePath} />
            </Box>
          )}
          
          {isAuth && !isDummyUser && <MyPostWidget picturePath={picturePath} />}
          <PostsWidget userId={_id} isAuth={isAuth && !isDummyUser} />
        </Box>

        {/* Right Column - FriendListWidget */}
        {isAuth && !isDummyUser && isNonMobileScreens && (
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
