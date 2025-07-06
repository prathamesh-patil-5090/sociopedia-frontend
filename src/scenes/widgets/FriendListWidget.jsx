import { Box, Typography, useTheme } from "@mui/material";
import Friend from "../../components/Friend";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "state";
import FriendsListService from "../../services/FriendsListService";

const FriendListWidget = ({ userId, isProfile = true, showTitle = true, onFriendRemoved }) => {
  const dispatch = useDispatch();
  const { palette } = useTheme();
  const token = useSelector((state) => state.token);
  const loggedInUserFriends = useSelector((state) => state.user?.friends || []);
  const loggedInUserId = useSelector((state) => state.user?._id);
  const [friends, setWidgetFriends] = useState([]);
  const [lastFriendsCount, setLastFriendsCount] = useState(0);

  const isMyProfile = userId === loggedInUserId;

  useEffect(() => {
    const getFriends = async () => {
      if (!userId || !token) {
        console.log("No userId or token, skipping friend fetch");
        setWidgetFriends([]);
        return;
      }
      
      console.log("Fetching friends for userId:", userId, "isMyProfile:", isMyProfile);
      
      try {
        const friendsData = await FriendsListService.getFriends(userId, token);
        setWidgetFriends(friendsData);

        if (isMyProfile) {
          dispatch(setFriends({ friends: friendsData }));
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
        setWidgetFriends([]);
      }
    };

    getFriends();
  }, [userId, token, dispatch, isMyProfile]);

  // Separate effect to handle friend count changes (friend request accepted)
  useEffect(() => {
    if (isMyProfile && loggedInUserFriends.length > lastFriendsCount) {
      console.log("Friend count increased, refetching friends list");
      setLastFriendsCount(loggedInUserFriends.length);
      
      // Refetch friends to get the latest data
      const refetchFriends = async () => {
        if (!userId || !token) return;
        
        try {
          const friendsData = await FriendsListService.getFriends(userId, token);
          setWidgetFriends(friendsData);
        } catch (error) {
          console.error("Error refetching friends:", error);
        }
      };
      
      refetchFriends();
    } else if (isMyProfile) {
      setLastFriendsCount(loggedInUserFriends.length);
    }
  }, [loggedInUserFriends.length, isMyProfile, userId, token, lastFriendsCount]);

  // Force re-render when Redux friends change
  const friendsToDisplay = isMyProfile ? loggedInUserFriends : friends;

  // Debug logging
  console.log("FriendListWidget render:", {
    isMyProfile,
    loggedInUserFriendsCount: loggedInUserFriends.length,
    localFriendsCount: friends.length,
    friendsToDisplayCount: friendsToDisplay.length
  });

  return (
    <WidgetWrapper>
      <Typography
        color={palette.neutral.dark}
        variant="h5"
        fontWeight="500"
        sx={{ mb: "1.5rem" }}
      >
        Friend List
      </Typography>
      <Box display="flex" flexDirection="column" gap="1.5rem">
        {friendsToDisplay.length > 0 ? (
          friendsToDisplay.map((friend) => (
              <Friend
                key={friend._id}
                friendId={friend._id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.occupation}
                userPicturePath={friend.picture || friend.picture_path || friend.picturePath || null}
                isAuth={true}
              />
            ))
        ) : (
          <Typography>No friends yet</Typography>
        )}
      </Box>
    </WidgetWrapper>
  );
};

export default FriendListWidget;