import { Box, Typography, useTheme, IconButton } from "@mui/material";
import { PersonAdd, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";

const UserCard = ({ user, showAddFriend = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user);
  
  const handleProfileClick = () => {
    navigate(`/profile/${user._id}`);
  };

  const handleAddFriend = (e) => {
    e.stopPropagation();
    // Add friend functionality can be implemented here
    console.log("Add friend:", user._id);
  };

  return (
    <WidgetWrapper>
      <FlexBetween>
        <Box
          display="flex"
          alignItems="center"
          gap="1rem"
          onClick={handleProfileClick}
          sx={{
            cursor: "pointer",
            "&:hover": {
              "& .user-name": {
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <UserImage image={user.picture_path || user.picturePath} size="50px" />
          <Box>
            <Typography
              variant="h6"
              fontWeight="500"
              className="user-name"
              sx={{
                transition: "color 0.2s ease",
              }}
            >
              {`${user.firstName} ${user.lastName}`}
            </Typography>
            {user.location && (
              <Typography variant="body2" color="text.secondary">
                {user.location}
              </Typography>
            )}
            {user.occupation && (
              <Typography variant="body2" color="text.secondary">
                {user.occupation}
              </Typography>
            )}
          </Box>
        </Box>
        
        {showAddFriend && currentUser._id !== user._id && (
          <IconButton
            onClick={handleAddFriend}
            sx={{
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: theme.palette.primary.main + "20",
              },
            }}
          >
            <PersonAdd />
          </IconButton>
        )}
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default UserCard;
