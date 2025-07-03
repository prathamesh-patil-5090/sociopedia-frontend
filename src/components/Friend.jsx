import { Box, IconButton, Typography, useTheme, Tooltip, SvgIcon } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFriends } from "state";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";
import { useMemo, useState, useEffect } from "react";

// Create custom AddFriendIcon component
const AddFriendIcon = (props) => {
  const theme = useTheme();
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path 
        d="M15 8c0-2.21-1.79-4-4-4S7 5.79 7 8s1.79 4 4 4 4-1.79 4-4zm-7 0c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm7 13v-2c0-2.66-5.33-4-8-4s-8 1.34-8 4v2h16zm-2-2c-.22-.72-3.31-2-6-2-2.7 0-5.8 1.29-6 2h12z"
        fill="currentColor"
      />
      <circle 
        cx="18" 
        cy="18" 
        r="5" 
        fill={theme.palette.mode === "dark" ? "#66E6FC" : "#000"}
        stroke={theme.palette.background.alt || "#fff"}
        strokeWidth="1"
      />
      <rect x="17.25" y="15.5" width="1.5" height="5" fill={theme.palette.background.alt || "#fff"}/>
      <rect x="15.5" y="17.25" width="5" height="1.5" fill={theme.palette.background.alt || "#fff"}/>
    </SvgIcon>
  );
};

// Create custom DeleteFriendIcon component with a person and minus symbol
const DeleteFriendIcon = (props) => {
  const theme = useTheme();
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path 
        d="M15 8c0-2.21-1.79-4-4-4S7 5.79 7 8s1.79 4 4 4 4-1.79 4-4zm-7 0c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm7 13v-2c0-2.66-5.33-4-8-4s-8 1.34-8 4v2h16zm-2-2c-.22-.72-3.31-2-6-2-2.7 0-5.8 1.29-6 2h12z"
        fill="currentColor"
      />
      <circle 
        cx="18" 
        cy="18" 
        r="5" 
        fill={theme.palette.mode === "dark" ? "#ff6b6b" : "#666666"}
        stroke={theme.palette.background.alt || "#fff"}
        strokeWidth="1"
      />
      <rect x="15.5" y="17.25" width="5" height="1.5" fill={theme.palette.background.alt || "#fff"}/>
    </SvgIcon>
  );
};

const Friend = ({ friendId, name, subtitle, userPicturePath, isAuth = false, hideRequestActions = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { _id: loggedInUserId = null, friends = [] } = useSelector((state) => state.user) || {};
  const token = useSelector((state) => state.token);

  const [friendStatus, setFriendStatus] = useState("loading"); // loading, not_friends, request_sent, request_received, friends
  const [friendRequestId, setFriendRequestId] = useState(null);
  
  // Improve isSelf check to handle all ID formats
  const isSelf = useMemo(() => {
    if (!loggedInUserId || !friendId) return false;
    const currentUserId = String(loggedInUserId);
    const targetId = String(typeof friendId === 'object' ? friendId._id || friendId.userId : friendId);
    console.log("Self check:", { currentUserId, targetId, isSame: currentUserId === targetId });
    return currentUserId === targetId;
  }, [loggedInUserId, friendId]);

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

    return friends.some(friend => friend._id === targetId);
  }, [friends, friendId]);

  useEffect(() => {
    const fetchFriendStatus = async () => {
      if (isSelf || !friendId || !token) return;

      const targetId = typeof friendId === 'object' ? friendId._id || friendId.userId : friendId;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/friend-status/${targetId}/`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setFriendStatus(data.status);
          if (data.status === "request_received") {
            setFriendRequestId(data.friend_request_id);
          }
        } else {
          setFriendStatus("not_friends");
        }
      } catch (error) {
        console.error("Error fetching friend status:", error);
        setFriendStatus("not_friends"); // Set a default state on error
      }
    };

    fetchFriendStatus();
  }, [friendId, token, isSelf, loggedInUserId]);


  const navigateToProfile = () => {
    if (!friendId) return;
    const targetId = typeof friendId === 'object' ? friendId._id || friendId.userId : friendId;
    navigate(`/profile/${targetId}`);
  };

  const handleSendRequest = async () => {
    const targetId = typeof friendId === 'object' ? friendId._id || friendId.userId : friendId;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/friend-request/send/${targetId}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      setFriendStatus("request_sent");
    }
  };

  const handleRemoveFriend = async () => {
    const targetId = typeof friendId === 'object' ? friendId._id || friendId.userId : friendId;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/friend/remove/${targetId}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setFriendStatus("not_friends");
      const data = await response.json();
      dispatch(setFriends({ friends: data.friends }));
    }
  };

  const handleRespondToRequest = async (action) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/friend-request/respond/${friendRequestId}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action }),
    });

    if (response.ok) {
      if (action === "accept") {
        setFriendStatus("friends");
        const data = await response.json();
        dispatch(setFriends({ friends: data.friends }));
      } else {
        setFriendStatus("not_friends");
      }
    }
  };

  const patchFriend = async () => {
    if (isDummyUser) {
      alert('Logged in as a dummy user. Friend requests are disabled.');
      return;
    }
    if (isFriend) {
      await handleRemoveFriend();
    } else {
      await handleSendRequest();
    }
  };

  return (
    <FlexBetween>
      <FlexBetween gap="1rem">
        <UserImage image={userPicturePath} size="55px" />
        <Box onClick={navigateToProfile} sx={{ cursor: 'pointer' }}>
          <Typography
            color={main}
            variant="h5"
            fontWeight="500"
            sx={{
              "&:hover": {
                color: palette.primary.light,
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
      {!isSelf && (
        <Box>
          {friendStatus === 'friends' && (
            <Tooltip title="Remove Friend">
              <IconButton onClick={handleRemoveFriend} sx={{ backgroundColor: primaryLight, p: "0.6rem" }}>
                <DeleteFriendIcon sx={{ color: primaryDark }} />
              </IconButton>
            </Tooltip>
          )}
          {friendStatus === 'not_friends' && (
            <Tooltip title="Add Friend">
              <IconButton onClick={handleSendRequest} sx={{ backgroundColor: primaryLight, p: "0.6rem" }}>
                <AddFriendIcon sx={{ color: primaryDark }} />
              </IconButton>
            </Tooltip>
          )}
          {friendStatus === 'request_sent' && (
            <Tooltip title="Request Sent">
              <IconButton disabled sx={{ backgroundColor: primaryLight, p: "0.6rem" }}>
                <SvgIcon>
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </SvgIcon>
              </IconButton>
            </Tooltip>
          )}
          {friendStatus === 'request_received' && !hideRequestActions && (
            <Box>
              <Tooltip title="Accept Request">
                <IconButton onClick={() => handleRespondToRequest('accept')} sx={{ backgroundColor: 'lightgreen', p: "0.6rem", mr: 1 }}>
                  <SvgIcon>
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
              <Tooltip title="Decline Request">
                <IconButton onClick={() => handleRespondToRequest('decline')} sx={{ backgroundColor: 'salmon', p: "0.6rem" }}>
                  <SvgIcon>
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </SvgIcon>
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      )}
    </FlexBetween>
  );
};

export default Friend;
