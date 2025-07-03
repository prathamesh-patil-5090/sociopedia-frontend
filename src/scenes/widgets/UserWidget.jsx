import {
  ManageAccountsOutlined,
  PeopleOutlined,
  EditOutlined,
} from "@mui/icons-material";
import { Box, Typography, Divider, useTheme, useMediaQuery, IconButton, Chip } from "@mui/material";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileService from "../../services/ProfileService";

const UserWidget = ({ userId, picturePath, isProfilePage = false }) => {
  const [user, setUser] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user?._id || state.user?.id);
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const isOwnProfile = loggedInUserId === userId;

  const getUser = async () => {
    try {
      const userData = await ProfileService.getUser(userId, token);
      console.log("UserWidget - Fetched user data:", userData);
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return null;
  }

  const {
    firstName,
    lastName,
    viewedProfile,
    impressions,
    friends,
    picturePath: userPicturePath,
    picture_path: auth0PicturePath, // Auth0 profile picture
  } = user;

  // Use Auth0 picture if available, otherwise fallback to regular picturePath
  const displayPicture = auth0PicturePath || userPicturePath || picturePath;

  return (
    <WidgetWrapper>
      {/* FIRST ROW - User Header */}
      <FlexBetween
        gap="0.5rem"
        pb="1.1rem"
        onClick={() => !isOwnProfile && navigate(`/profile/${userId}`)}
        sx={{
          cursor: isOwnProfile ? "default" : "pointer",
          borderRadius: "8px",
          padding: "0.75rem",
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: isOwnProfile ? "transparent" : theme.palette.neutral.light,
            transform: isOwnProfile ? "none" : "translateY(-1px)",
            boxShadow: isOwnProfile ? "none" : `0 4px 12px ${theme.palette.neutral.dark}10`,
          }
        }}
      >
        <FlexBetween gap="1rem">
          <Box sx={{ position: "relative" }}>
            <UserImage image={displayPicture} size="60px" />
            {/* Online status indicator */}
            <Box
              sx={{
                position: "absolute",
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#4caf50",
                border: `2px solid ${theme.palette.background.alt}`,
                boxShadow: `0 0 8px rgba(76, 175, 80, 0.5)`,
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              fontWeight="600"
              sx={{
                fontSize: "1.25rem",
                color: theme.palette.neutral.dark,
                transition: "all 0.3s ease",
                cursor: !isOwnProfile ? "pointer" : "default",
                "&:hover": !isOwnProfile ? {
                  color: theme.palette.primary.main,
                  transform: "scale(1.02)",
                } : {},
              }}
            >
              {firstName && lastName ? `${firstName} ${lastName}` : 
               firstName ? firstName : 
               lastName ? lastName : 
               "Unknown User"}
            </Typography>
            <Box display="flex" alignItems="center" gap="0.5rem" mt="0.25rem">
              <PeopleOutlined sx={{ fontSize: "16px", color: theme.palette.neutral.medium }} />
              <Typography 
                color={theme.palette.neutral.medium} 
                fontSize="0.875rem"
                fontWeight="500"
              >
                {(friends?.length || 0)} friend{(friends?.length || 0) !== 1 ? 's' : ''}
              </Typography>
              {isOwnProfile && (
                <Chip
                  label="You"
                  size="small"
                  sx={{
                    height: "20px",
                    fontSize: "0.7rem",
                    backgroundColor: theme.palette.primary.main + "15",
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    border: `1px solid ${theme.palette.primary.main}40`,
                  }}
                />
              )}
            </Box>
          </Box>
        </FlexBetween>
        
        {isOwnProfile ? (
          <IconButton
            sx={{
              backgroundColor: theme.palette.neutral.light,
              color: theme.palette.neutral.dark,
              padding: "0.5rem",
              border: `1px solid ${theme.palette.divider}`,
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.alt,
                transform: "rotate(15deg) scale(1.1)",
                borderColor: theme.palette.primary.main,
              },
              transition: "all 0.3s ease",
            }}
          >
            <EditOutlined />
          </IconButton>
        ) : (
          <IconButton
            sx={{
              backgroundColor: theme.palette.neutral.light,
              color: theme.palette.neutral.dark,
              padding: "0.5rem",
              border: `1px solid ${theme.palette.divider}`,
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.alt,
                transform: "rotate(15deg) scale(1.1)",
                borderColor: theme.palette.primary.main,
              },
              transition: "all 0.3s ease",
            }}
          >
            <ManageAccountsOutlined />
          </IconButton>
        )}
      </FlexBetween>

      <Divider sx={{ backgroundColor: theme.palette.divider, height: "1px" }} />

      {/* Show details if it's either non-mobile or profile page */}
      {(isNonMobileScreens || isProfilePage) && (
        <>
          {/* THIRD ROW - Profile Stats */}
          <Box p="1rem 0">
            <FlexBetween mb="0.75rem">
              <Typography 
                color={theme.palette.neutral.medium}
                fontWeight="500"
                fontSize="0.9rem"
              >
                Who's viewed your profile
              </Typography>
              <Typography 
                color={theme.palette.neutral.main} 
                fontWeight="600"
                fontSize="1rem"
              >
                {viewedProfile?.toLocaleString() || 0}
              </Typography>
            </FlexBetween>
            
            <FlexBetween>
              <Typography 
                color={theme.palette.neutral.medium}
                fontWeight="500"
                fontSize="0.9rem"
              >
                Impressions of your posts
              </Typography>
              <Typography 
                color={theme.palette.neutral.main} 
                fontWeight="600"
                fontSize="1rem"
              >
                {impressions?.toLocaleString() || 0}
              </Typography>
            </FlexBetween>
          </Box>
        </>
      )}
    </WidgetWrapper>
  );
};

export default UserWidget;
