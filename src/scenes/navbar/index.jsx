import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Button,
  Tooltip,
  Divider,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Search,
  Menu,
  Close,
  DarkMode,
  LightMode,
  Person,
  Logout,
  Home,
  Notifications,
  NotificationsNone,
  Check, // For accept
  Clear, // For decline
  DeleteSweep, // For clear all notifications
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout, setLogin, setFriends } from "state";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import LogoutButton from "components/LogoutButton";
import Profile from "components/Profile";
import useWebSocket from "../../hooks/useWebSocket";

const AuthButtons = ({ theme, navigate, isMobile = false }) => {
  return (
    <Box 
      display="flex" 
      gap={isMobile ? "1.5rem" : "1rem"}
      flexDirection={isMobile ? "column" : "row"}
      width={isMobile ? "100%" : "auto"}
      alignItems="center"
    >
      <Button
        variant="outlined"
        startIcon={<Person />}
        onClick={() => navigate("/login")}
        sx={{
          borderColor: theme.palette.mode === "dark" ? "#66b3ff" : theme.palette.primary.main,
          color: theme.palette.mode === "dark" ? "#66b3ff" : theme.palette.primary.main,
          padding: isMobile ? "0.75rem 1.5rem" : "0.5rem 1.5rem",
          borderRadius: "25px",
          width: isMobile ? "85%" : "auto",
          fontSize: isMobile ? "1rem" : "0.9rem",
          fontWeight: 500,
          textTransform: "none",
          border: `2px solid ${theme.palette.mode === "dark" ? "#66b3ff" : theme.palette.primary.main}`,
          "&:hover": {
            backgroundColor: theme.palette.mode === "dark" ? "#66b3ff" : theme.palette.primary.main,
            color: theme.palette.background.alt,
            transform: "translateY(-1px)",
            boxShadow: theme.palette.mode === "dark" 
              ? "0 4px 12px rgba(102, 179, 255, 0.4)" 
              : `0 4px 12px ${theme.palette.primary.main}40`,
            borderColor: theme.palette.mode === "dark" ? "#66b3ff" : theme.palette.primary.main,
          },
          transition: "all 0.3s ease",
        }}
      >
        Login
      </Button>
    </Box>
  );
};

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Prevent re-sync on logout
  const [searchQuery, setSearchQuery] = useState(""); // Add search state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user) || {};
  const token = useSelector((state) => state.token);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const isAuth = Boolean(useSelector((state) => state.token));
  
  // Get the correct profile picture (Auth0 or regular)
  const userProfilePicture = user.picture_path || user.picturePath;
  
  // Auth0 integration
  const { user: auth0User, isAuthenticated: isAuth0Authenticated, isLoading: auth0Loading, logout: auth0Logout } = useAuth0();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [notificationIds, setNotificationIds] = useState(new Set()); // Track notification IDs to prevent duplicates

  // WebSocket connection for real-time notifications
  const handleNewNotification = (notification) => {
    // Prevent duplicate notifications
    if (notificationIds.has(notification.id)) {
      return;
    }
    
    setNotificationIds(prev => new Set([...prev, notification.id]));
    setNotifications(prev => [notification, ...prev]);
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const handleFriendRequestInvalid = (notificationId, message) => {
    // Update the notification to show it's invalid
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_invalid: true, invalid_message: message }
          : notif
      )
    );
    
    // Decrease unread count if it was unread
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.is_read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      return prev;
    });
  };

  const { markAsRead } = useWebSocket(user?._id, handleNewNotification, handleFriendRequestInvalid);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
        // Populate the notification IDs set
        setNotificationIds(new Set(data.notifications.map(n => n.id)));
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    // Initial fetch of notifications
    fetchNotifications();
    // Remove polling since we now use WebSocket
  }, [token]);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (unreadCount > 0) {
      // Optimistically set to 0, or refetch
      setUnreadCount(0);
    }
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      // Send WebSocket message to mark as read
      markAsRead(notificationId);
      
      // Also call the API endpoint
      await fetch(`${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleFriendRequestResponse = async (requestId, action) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/friend-request/respond/${requestId}/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      
      if (response.ok) {
        fetchNotifications(); // Refresh notifications after responding
        
        // If friend request was accepted, update Redux store with new friends list
        if (action === 'accept') {
          try {
            const friendsResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/${user._id}/friends/`, {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (friendsResponse.ok) {
              const friendsData = await friendsResponse.json();
              dispatch(setFriends({ friends: friendsData }));
              console.log("Updated friends list after accepting request:", friendsData);
            }
          } catch (error) {
            console.error("Failed to update friends list after accepting request:", error);
          }
        }
      } else {
        const errorData = await response.json();
        if (response.status === 400 && errorData.error === 'Friend request already processed') {
          // Friend request already processed, just refresh notifications
          console.log('Friend request already processed:', errorData.message);
          fetchNotifications();
        } else if (response.status === 404 && errorData.error === 'Friend request not found or already deleted') {
          // Friend request was deleted/cancelled, mark as invalid
          setNotifications(prev => 
            prev.map(notif => 
              notif.friend_request?.id === requestId || notif.friend_request === requestId
                ? { ...notif, is_invalid: true, invalid_message: 'Friend request is no longer available' }
                : notif
            )
          );
          console.log('Friend request not found or already deleted');
        } else {
          console.error("Failed to respond to friend request:", errorData);
        }
      }
    } catch (error) {
      console.error("Failed to respond to friend request:", error);
      // If there's a network error or the request fails, mark as invalid
      setNotifications(prev => 
        prev.map(notif => 
          notif.friend_request?.id === requestId || notif.friend_request === requestId
            ? { ...notif, is_invalid: true, invalid_message: 'Friend request is no longer available' }
            : notif
        )
      );
    }
  };

  const handleClearAllNotifications = () => {
    setClearDialogOpen(true);
  };

  const handleConfirmClearAll = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/clear/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
        setNotificationIds(new Set()); // Clear the IDs set
        setClearDialogOpen(false);
        console.log("All notifications cleared successfully");
      } else {
        console.error("Failed to clear notifications");
        setClearDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
      setClearDialogOpen(false);
    }
  };

  const handleCancelClearAll = () => {
    setClearDialogOpen(false);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  useEffect(() => {
    const syncAuth0User = async () => {
      // Only sync if Auth0 is authenticated, not logging out, and the Django session isn't yet established
      if (isAuth0Authenticated && auth0User && !isAuth && !isLoggingOut) {
        try {
          console.log('Auth0 user authenticated, syncing with Django backend...');
          
          const apiUrl = `${import.meta.env.VITE_API_URL}/auth/auth0/sync/`;
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user: auth0User }),
          });

          const result = await response.json();

          if (response.ok && result.user && result.tokens) {
            // Store Django JWT tokens
            localStorage.setItem('token', result.tokens.access);
            localStorage.setItem('refreshToken', result.tokens.refresh);

            // Set user in Redux store with Django user data
            dispatch(setLogin({
              user: result.user,
              token: result.tokens.access
            }));

            console.log('Auth0 user successfully synced with Django.');
          } else {
            console.error('Auth0 user sync failed:', result);
          }
        } catch (error) {
          console.error('Error syncing Auth0 user:', error);
        }
      }
    };

    syncAuth0User();
  }, [isAuth0Authenticated, auth0User, isAuth, isLoggingOut, dispatch]);

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const alt = theme.palette.background.alt;

  // Use Redux state as the primary source of truth
  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const isUserAuthenticated = isAuth;

  // Combined logout function
  const handleLogout = () => {
    setIsLoggingOut(true); // Prevent the sync effect from running

    // Clear local storage first
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Redux logout
    dispatch(setLogout());
    
    // Auth0 logout (this will redirect, so no need to wait)
    if (isAuth0Authenticated) {
      auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear search after navigation
      setIsMobileMenuToggled(false); // Close mobile menu if open
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <FlexBetween 
      padding={isNonMobileScreens ? "1rem 6%" : "0.75rem 4%"} 
      backgroundColor={alt}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: theme.palette.mode === "dark" 
          ? "0 2px 10px rgba(0,0,0,0.3)" 
          : "0 2px 10px rgba(0,0,0,0.1)",
        minHeight: isNonMobileScreens ? "auto" : "60px",
      }}
    >
      <FlexBetween gap={isNonMobileScreens ? "1.75rem" : "0.75rem"}>
        <Box display="flex" alignItems="center" gap={isNonMobileScreens ? "0.5rem" : "0.25rem"}>
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              padding: isNonMobileScreens ? "0.5rem" : "0.4rem",
              borderRadius: "12px",
              backgroundColor: theme.palette.mode === "dark" 
                ? "rgba(255,255,255,0.1)" 
                : theme.palette.primary.main,
              color: theme.palette.mode === "dark" 
                ? "#ffffff" 
                : theme.palette.background.alt,
              border: theme.palette.mode === "dark" 
                ? "1px solid rgba(255,255,255,0.2)" 
                : "none",
              "&:hover": {
                backgroundColor: theme.palette.mode === "dark" 
                  ? "rgba(255,255,255,0.2)" 
                  : theme.palette.primary.dark,
                transform: "scale(1.05)",
                boxShadow: theme.palette.mode === "dark" 
                  ? "0 0 15px rgba(255,255,255,0.3)" 
                  : "none",
              },
              transition: "all 0.2s ease",
            }}
          >
            <Home sx={{ fontSize: isNonMobileScreens ? "24px" : "20px" }} />
          </IconButton>
          <Typography
            fontWeight="bold"
            fontSize={isNonMobileScreens ? "clamp(1.2rem, 2rem, 2.25rem)" : "1.4rem"}
            onClick={() => navigate("/")}
            sx={{
              cursor: "pointer",
              color: theme.palette.mode === "dark" 
                ? "#ffffff" 
                : theme.palette.primary.main,
              textShadow: theme.palette.mode === "dark" 
                ? "0 0 15px rgba(255,255,255,0.3)"
                : `0 2px 4px ${theme.palette.primary.main}20`,
              "&:hover": {
                transform: "scale(1.02)",
                color: theme.palette.mode === "dark" 
                  ? theme.palette.primary.light 
                  : theme.palette.primary.dark,
                textShadow: theme.palette.mode === "dark" 
                  ? `0 0 20px ${theme.palette.primary.light}60`
                  : `0 3px 6px ${theme.palette.primary.main}30`,
              },
              transition: "all 0.3s ease",
            }}
          >
            Sociopedia
          </Typography>
        </Box>
        {isNonMobileScreens && (
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <FlexBetween
              backgroundColor={neutralLight}
              borderRadius="25px"
              gap="1rem"
              padding="0.5rem 1.5rem"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                },
                transition: "all 0.2s ease",
                minWidth: "250px",
              }}
            >
              <InputBase 
                placeholder="Search posts, people..." 
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleSearchKeyPress}
                sx={{
                  flex: 1,
                  "& input::placeholder": {
                    color: theme.palette.neutral.medium,
                    opacity: 0.8,
                  },
                }}
              />
              <IconButton
                type="submit"
                sx={{
                  padding: "0.3rem",
                  color: theme.palette.neutral.medium,
                  "&:hover": {
                    color: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.main + "20",
                  },
                }}
              >
                <Search />
              </IconButton>
            </FlexBetween>
          </Box>
        )}
      </FlexBetween>

      {/* DESKTOP NAV */}
      {isNonMobileScreens ? (
        <FlexBetween gap="1.5rem">
          {/* Theme Toggle */}
          <Tooltip title={theme.palette.mode === "dark" ? "Light Mode" : "Dark Mode"}>
            <IconButton onClick={() => dispatch(setMode())}>
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error">
                <Notifications sx={{ fontSize: "25px" }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {isUserAuthenticated ? (
            <FlexBetween gap="1rem">
              {/* User Profile Section */}
              <Box display="flex" alignItems="center" gap="0.5rem">
                <Box
                  onClick={() => navigate(`/profile/${user._id}`)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                    transition: "transform 0.2s ease",
                  }}
                >
                  <UserImage image={userProfilePicture} size="35px" />
                </Box>
                <FormControl variant="standard" value={fullName}>
                  <Select
                    value={fullName}
                    sx={{
                      backgroundColor: neutralLight,
                      minWidth: "120px",
                      borderRadius: "20px",
                      padding: "0.25rem 1rem",
                      border: `1px solid ${theme.palette.divider}`,
                      "& .MuiSvgIcon-root": {
                        color: theme.palette.neutral.medium,
                      },
                      "& .MuiSelect-select:focus": {
                        backgroundColor: neutralLight,
                      },
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                      },
                      transition: "all 0.2s ease",
                    }}
                    input={<InputBase />}
                  >
                    <MenuItem 
                      value={fullName}
                      onClick={() => {
                        if (auth0User) {
                          navigate('/auth0-profile');
                        } else {
                          navigate(`/profile/${user._id}`);
                        }
                      }}
                      sx={{
                        "&:hover": {
                          backgroundColor: theme.palette.primary.main + "20",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap="0.5rem">
                        <Person fontSize="small" />
                        <Typography variant="body2">{fullName}</Typography>
                      </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{
                        color: theme.palette.error.main,
                        "&:hover": {
                          backgroundColor: theme.palette.error.main + "20",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap="0.5rem">
                        <Logout fontSize="small" />
                        <Typography variant="body2">Log Out</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </FlexBetween>
          ) : (
            <AuthButtons theme={theme} navigate={navigate} />
          )}
        </FlexBetween>
      ) : (
        <Box display="flex" alignItems="center" gap="0.25rem">
          {/* Theme Toggle for Mobile */}
          <IconButton
            onClick={() => dispatch(setMode())}
            sx={{
              backgroundColor: theme.palette.neutral.light,
              color: theme.palette.neutral.dark,
              padding: "0.6rem",
              minWidth: "44px",
              minHeight: "44px",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.alt,
              },
            }}
          >
            {theme.palette.mode === "dark" ? <LightMode sx={{ fontSize: "20px" }} /> : <DarkMode sx={{ fontSize: "20px" }} />}
          </IconButton>
          
          {/* Notification Bell for Mobile - Always visible */}
          {isUserAuthenticated && (
            <IconButton
              onClick={handleNotificationClick}
              sx={{
                backgroundColor: theme.palette.neutral.light,
                color: theme.palette.neutral.dark,
                padding: "0.6rem",
                minWidth: "44px",
                minHeight: "44px",
                "&:hover": {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.background.alt,
                },
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <Notifications sx={{ fontSize: "20px" }} />
              </Badge>
            </IconButton>
          )}
          
          <IconButton
            onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            sx={{
              backgroundColor: theme.palette.neutral.light,
              color: theme.palette.neutral.dark,
              padding: "0.6rem",
              minWidth: "44px",
              minHeight: "44px",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.alt,
              },
            }}
          >
            <Menu sx={{ fontSize: "20px" }} />
          </IconButton>
        </Box>
      )}

      {/* MOBILE NAV */}
      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          top="0"
          height="100vh"
          zIndex="1000"
          width="100vw"
          maxWidth="350px"
          backgroundColor={background}
          sx={{
            backdropFilter: "blur(10px)",
            borderLeft: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === "dark" 
              ? "0 0 30px rgba(0,0,0,0.5)" 
              : "0 0 30px rgba(0,0,0,0.15)",
            overflowY: "auto",
          }}
        >
          {/* CLOSE ICON */}
          <Box 
            display="flex" 
            justifyContent="flex-end" 
            p="1rem"
            borderBottom={`1px solid ${theme.palette.divider}`}
          >
            <IconButton
              onClick={() => setIsMobileMenuToggled(false)}
              sx={{
                backgroundColor: theme.palette.neutral.light,
                padding: "0.75rem",
                minWidth: "44px",
                minHeight: "44px",
                "&:hover": {
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.background.alt,
                },
              }}
            >
              <Close sx={{ fontSize: "20px" }} />
            </IconButton>
          </Box>

          {/* MENU ITEMS */}
          <Box
            display="flex"
            flexDirection="column"
            gap="1.5rem"
            padding="2rem 1.5rem"
            height="calc(100vh - 100px)"
          >
            {/* Search Bar for Mobile */}
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FlexBetween
                backgroundColor={neutralLight}
                borderRadius="25px"
                gap="1rem"
                padding="0.75rem 1.5rem"
                width="100%"
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  minHeight: "50px",
                }}
              >
                <InputBase 
                  placeholder="Search posts, people..." 
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyPress={handleSearchKeyPress}
                  sx={{ 
                    flex: 1,
                    fontSize: "1rem",
                    "& input::placeholder": {
                      color: theme.palette.neutral.medium,
                      opacity: 0.8,
                    },
                  }}
                />
                <IconButton 
                  type="submit"
                  size="small"
                  sx={{
                    padding: "0.5rem",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main + "20",
                    },
                  }}
                >
                  <Search sx={{ fontSize: "18px" }} />
                </IconButton>
              </FlexBetween>
            </Box>

            {isUserAuthenticated ? (
              <Box display="flex" flexDirection="column" gap="2rem" alignItems="center" mt="1rem">
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  gap="1rem"
                  onClick={() => {
                    navigate(`/profile/${user._id}`);
                    setIsMobileMenuToggled(false);
                  }}
                  sx={{
                    cursor: "pointer",
                    padding: "1rem",
                    borderRadius: "16px",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main + "10",
                      transform: "scale(1.02)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <UserImage image={userProfilePicture} size="60px" />
                  <Typography variant="h6" fontWeight="500" textAlign="center">
                    {fullName}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Logout />}
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuToggled(false);
                  }}
                  sx={{
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main,
                    padding: "1rem",
                    borderRadius: "25px",
                    fontSize: "1rem",
                    fontWeight: 500,
                    minHeight: "50px",
                    "&:hover": {
                      backgroundColor: theme.palette.error.main,
                      color: theme.palette.background.alt,
                    },
                  }}
                >
                  Log Out
                </Button>
              </Box>
            ) : (
              <Box mt="2rem">
                <AuthButtons theme={theme} navigate={navigate} isMobile={true} />
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Notifications Popover - Shared for both Desktop and Mobile */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          mt: 1,
          '& .MuiPopover-paper': {
            borderRadius: '12px',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.4)' 
              : '0 8px 32px rgba(0,0,0,0.15)',
            border: `1px solid ${theme.palette.divider}`,
            minWidth: isNonMobileScreens ? '350px' : '300px',
            maxWidth: isNonMobileScreens ? '400px' : '350px',
            maxHeight: '500px',
          }
        }}
      >
        <Box p={2}>
          <FlexBetween mb={1}>
            <Typography variant="h6">Notifications</Typography>
            {notifications.length > 0 && (
              <Tooltip title="Clear All Notifications">
                <IconButton 
                  onClick={handleClearAllNotifications}
                  size="small"
                  sx={{
                    color: theme.palette.error.main,
                    "&:hover": {
                      backgroundColor: theme.palette.error.light + "20",
                    },
                  }}
                >
                  <DeleteSweep />
                </IconButton>
              </Tooltip>
            )}
          </FlexBetween>
          <List>
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <ListItem key={`${notif.id}-${index}`} divider sx={{ 
                  backgroundColor: notif.is_read ? 'transparent' : theme.palette.action.hover,
                  opacity: notif.is_invalid ? 0.6 : 1
                }}>
                  <ListItemText 
                    primary={notif.is_invalid ? `${notif.invalid_message || 'Request no longer available'}` : notif.message}
                    secondary={new Date(notif.created_at).toLocaleString()}
                    primaryTypographyProps={{
                      color: notif.is_invalid ? theme.palette.error.main : 'inherit',
                      fontStyle: notif.is_invalid ? 'italic' : 'normal'
                    }}
                  />
                  <ListItemSecondaryAction>
                    {notif.type === 'friend_request' && !notif.is_read && !notif.is_invalid && (
                      <Box>
                        <Tooltip title="Accept">
                          <IconButton edge="end" aria-label="accept" onClick={() => handleFriendRequestResponse(notif.friend_request?.id || notif.friend_request, 'accept')}>
                            <Check color="success" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Decline">
                          <IconButton edge="end" aria-label="decline" onClick={() => handleFriendRequestResponse(notif.friend_request?.id || notif.friend_request, 'decline')}>
                            <Clear color="error" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                    {notif.is_invalid && (
                      <Typography variant="caption" color="error" sx={{ mr: 1 }}>
                        Failed
                      </Typography>
                    )}
                    {!notif.is_read && notif.type !== 'friend_request' && (
                      <Tooltip title="Mark as read">
                        <IconButton edge="end" aria-label="read" onClick={() => handleMarkAsRead(notif.id)}>
                          <Check />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No new notifications." />
              </ListItem>
            )}
          </List>
        </Box>
      </Popover>

      {/* Clear All Notifications Confirmation Dialog */}
      <Dialog
        open={clearDialogOpen}
        onClose={handleCancelClearAll}
        aria-labelledby="clear-notifications-dialog-title"
        aria-describedby="clear-notifications-dialog-description"
      >
        <DialogTitle id="clear-notifications-dialog-title">
          Clear All Notifications
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-notifications-dialog-description">
            Are you sure you want to clear all notifications? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClearAll} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmClearAll} color="error" variant="contained">
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </FlexBetween>
  );
};

export default Navbar;
