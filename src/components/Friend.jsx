import { PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material";
import { Box, IconButton, Typography, useTheme, Tooltip, SvgIcon } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFriends } from "state";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";
import { useMemo } from "react"; // Add this import

// Create custom PersonFriendIcon component
const PersonFriendIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-1-6c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm1 8c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2 2.7 0 5.8 1.29 6 2H9zm6-10c-.37 0-.72.08-1.05.21.39.54.63 1.18.63 1.87 0 1.27-.74 2.36-1.8 2.88.59.26 1.35.46 2.22.46 2.21 0 4-1.79 4-4s-1.79-4-4-4zm-4.19 0c-.37.55-.59 1.21-.59 1.92 0 1.27.74 2.36 1.8 2.88-.59.26-1.35.46-2.22.46-2.21 0-4-1.79-4-4s1.79-4 4-4c.37 0 .72.08 1.05.21-.39.54-.63 1.18-.63 1.87z" />
    <path d="M19 13l-3 3l-1.5-1.5l-1.5 1.5l3 3l4.5-4.5z" fill={props.checkColor || "#4CAF50"} />
  </SvgIcon>
);

// Create custom DeleteFriendIcon component with a person and minus symbol
const DeleteFriendIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M15 8c0-2.21-1.79-4-4-4S7 5.79 7 8s1.79 4 4 4 4-1.79 4-4zm-7 0c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm7 13v-2c0-2.66-5.33-4-8-4s-8 1.34-8 4v2h16zm-2-2c-.22-.72-3.31-2-6-2-2.7 0-5.8 1.29-6 2h12z"/>
    {/* Add minus circle overlay */}
    <circle cx="18" cy="18" r="6" fill="#ff4d4d"/>
    <rect x="15" y="17.25" width="6" height="1.5" fill="white"/>
  </SvgIcon>
);

const Friend = ({ friendId, name, subtitle, userPicturePath, isAuth = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { _id: loggedInUserId = null, friends = [] } = useSelector((state) => state.user) || {};
  
  // Improve isSelf check to handle all ID formats
  const isSelf = useMemo(() => {
    if (!loggedInUserId || !friendId) return false;
    const currentUserId = String(loggedInUserId);
    const targetId = String(typeof friendId === 'object' ? friendId._id || friendId.userId : friendId);
    console.log("Self check:", { currentUserId, targetId, isSame: currentUserId === targetId });
    return currentUserId === targetId;
  }, [loggedInUserId, friendId]);

  const token = useSelector((state) => state.token);
  const isDummyUser = loggedInUserId === "67b1d55da90d9304b1f869d5";

  const { palette } = useTheme();
  const primaryLight = palette.primary.light;
  const primaryDark = palette.primary.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  // Fix the isFriend check logic
  const isFriend = useMemo(() => {
    if (!Array.isArray(friends) || !friendId) return false;

    // Get the actual ID whether friendId is an object or string
    const targetId = typeof friendId === 'object' ? friendId._id || friendId.userId : friendId;

    // Debug log
    console.log("Checking friend status:", {
      targetId,
      friends: friends.map(f => ({ id: f._id, name: `${f.firstName} ${f.lastName}` })),
      match: friends.some(friend => friend._id === targetId)
    });

    return friends.some(friend => friend._id === targetId);
  }, [friends, friendId]);

  const patchFriend = async () => {
    if (!isAuth || isDummyUser || !friendId || !loggedInUserId) return;
    
    try {
      // Get the actual ID whether friendId is an object or string
      const actualFriendId = typeof friendId === 'object' ? friendId._id || friendId.userId : friendId;
      
      console.log("Attempting friend operation:", {
        loggedInUserId,
        friendId: actualFriendId,
        currentFriends: friends,
        isFriend
      });

      const response = await fetch(
        `${process.env.VITE_API_URL}/users/${loggedInUserId}/${actualFriendId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update friend status");
      }

      console.log("Friend operation successful:", { friendCount: data.length });
      dispatch(setFriends({ friends: data }));
    } catch (error) {
      console.error("Friend operation failed:", error, {
        friendId,
        currentFriends: friends
      });
    }
  };

  // Stricter conditions for showing friend button
  const showFriendButton = useMemo(() => {
    const shouldShow = isAuth && !isDummyUser && !isSelf && loggedInUserId && friendId;
    console.log("Friend button visibility:", { isAuth, isDummyUser, isSelf, shouldShow });
    return shouldShow;
  }, [isAuth, isDummyUser, isSelf, loggedInUserId, friendId]);

  // Ensure we have a clean ID for navigation
  const navigateToProfile = () => {
    if (isAuth && !isDummyUser && friendId) {
      const actualId = typeof friendId === 'object' ? friendId._id || friendId.userId : friendId;
      if (!token) {
        navigate("/login");
        return;
      }
      navigate(`/profile/${actualId}`);
    } else if (!isAuth) {
      navigate("/login");
    }
  };

  return (
    <FlexBetween>
      <FlexBetween gap="1rem">
        <UserImage image={userPicturePath} size="55px" />
        <Box onClick={navigateToProfile}>
          <Typography
            color={main}
            variant="h5"
            fontWeight="500"
            sx={{
              "&:hover": {
                color: isAuth && !isDummyUser ? palette.primary.light : "inherit",
                cursor: isAuth && !isDummyUser ? "pointer" : "default",
              },
            }}
          >
            {name}
          </Typography>
          <Typography color={medium} fontSize="0.75rem">
            {subtitle}
          </Typography>
        </Box>
      </FlexBetween>
      {/* Only show friend button if not viewing own profile */}
      {showFriendButton && !isSelf && (
        <Tooltip title={isFriend ? "Remove friend" : "Add friend"}>
          <IconButton
            onClick={patchFriend}
            sx={{ 
              backgroundColor: primaryLight, 
              p: "0.6rem",
              "&:hover": {
                backgroundColor: isFriend ? "#ff4d4d" : primaryDark,
                "& .MuiSvgIcon-root": {
                  color: "white",
                  transform: "scale(1.1)",
                  transition: "all 0.2s ease-in-out"
                }
              },
              transition: "all 0.3s ease-in-out"
            }}
          >
            {isFriend ? (
              <DeleteFriendIcon 
                sx={{ 
                  color: primaryDark,
                  "&:hover": { color: "white" }
                }}
              />
            ) : (
              <PersonAddOutlined 
                sx={{ 
                  color: primaryDark,
                  "&:hover": { color: "white" }
                }}
              />
            )}
          </IconButton>
        </Tooltip>
      )}
    </FlexBetween>
  );
};

export default Friend;
