import { Box, useMediaQuery } from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import Navbar from "scenes/navbar";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import UserWidget from "scenes/widgets/UserWidget";
import { useSelector } from "react-redux";
import ProfileService from "../../services/ProfileService";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const { userId } = useParams();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user?._id);
  const isAuth = Boolean(token);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  // Improve the isOwnProfile check to handle type coercion
  const isOwnProfile = useMemo(() => {
    if (!userId || !loggedInUserId || !isAuth) return false;
    return String(userId) === String(loggedInUserId);
  }, [userId, loggedInUserId, isAuth]);

  const getUser = async () => {
    try {
      const userData = await ProfileService.getUser(userId, token);
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    getUser();
  }, [userId]); // Re-fetch when userId changes

  if (!user) return null;

  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="2rem"
        justifyContent="center"
      >
        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget 
            userId={userId} 
            picturePath={user.picturePath || null}
            isProfilePage={true}
          />
          <Box m="2rem 0" />
          {/* Only show FriendListWidget if user is authenticated */}
          {isAuth && (
            <FriendListWidget 
              userId={userId}
              isProfile={true}
            />
          )}
        </Box>
        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        >
          {/* Only show MyPostWidget if it's the user's own profile and they're authenticated */}
          {isOwnProfile && isAuth && (
            <MyPostWidget picturePath={user.picturePath || null} />
          )}
          <Box m="2rem 0" />
          <PostsWidget 
            userId={userId}
            isProfile={true}
            isAuth={isAuth}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;