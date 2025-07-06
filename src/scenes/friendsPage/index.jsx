import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { People, PersonAdd, Group } from '@mui/icons-material';
import Navbar from 'scenes/navbar';
import FriendListWidget from 'scenes/widgets/FriendListWidget';
import FriendRequestWidget from 'scenes/widgets/FriendRequestWidget';
import { useSelector, useDispatch } from 'react-redux';
import FriendRequestService from '../../services/FriendRequestService';
import { setFriends } from 'state';

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [friendRequests, setFriendRequests] = useState({ received_requests: [], sent_requests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const theme = useTheme();
  const dispatch = useDispatch();
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const isAuth = Boolean(useSelector((state) => state.token));
  const user = useSelector((state) => state.user) || {};
  const userId = user._id;

  // Fetch friend requests from API
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!isAuth || !userId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await FriendRequestService.getFriendRequests();
        setFriendRequests(data);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
        setError('Failed to load friend requests');
      } finally {
        setLoading(false);
      }
    };

    fetchFriendRequests();
  }, [isAuth, userId, refreshKey]);

  // Function to refresh friend requests
  const refreshFriendRequests = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Handle friend request response
  const handleFriendRequestResponse = async (requestId, action) => {
    try {
      const response = await FriendRequestService.respondToFriendRequest(requestId, action);
      
      if (action === 'accept' && response.friends) {
        // Update friends list in Redux store
        dispatch(setFriends({ friends: response.friends }));
      }
      
      // Refresh friend requests list
      refreshFriendRequests();
      
      return response;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!isAuth) {
    return (
      <Box>
        <Navbar />
        <Box
          width="100%"
          padding="2rem 6%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="50vh"
        >
          <Typography variant="h5" color={theme.palette.neutral.medium}>
            Please log in to view your friends
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display="flex"
        flexDirection="column"
        gap="1.5rem"
        paddingBottom={isNonMobileScreens ? "2rem" : "6rem"} // Extra padding for mobile footer
      >
        {/* Page Header */}
        <Typography
          variant="h4"
          color={theme.palette.neutral.dark}
          fontWeight="500"
          sx={{ mb: "1rem" }}
        >
          Friends
        </Typography>

        {/* Tabs */}
        <Paper
          sx={{
            backgroundColor: theme.palette.background.alt,
            borderRadius: "0.75rem",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.mode === "dark" ? "#66b3ff" : theme.palette.primary.main,
              },
              '& .MuiTab-root': {
                color: theme.palette.neutral.medium,
                '&.Mui-selected': {
                  color: theme.palette.mode === "dark" ? "#66b3ff" : theme.palette.primary.main,
                },
              },
            }}
          >
            <Tab
              icon={<Group />}
              label={`My Friends (${user.friends?.length || 0})`}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            />
            <Tab
              icon={<PersonAdd />}
              label={`Friend Requests (${friendRequests.received_requests?.length || 0})`}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            />
          </Tabs>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ borderRadius: "0.75rem" }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {/* Tab Content */}
        {!loading && (
          <Box>
            {activeTab === 0 && (
              <Box>
                <FriendListWidget 
                  userId={userId} 
                  isProfile={false}
                  showTitle={false}
                  onFriendRemoved={refreshFriendRequests}
                />
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box>
                <FriendRequestWidget 
                  userId={userId}
                  showTitle={false}
                  friendRequests={friendRequests}
                  onRequestResponse={handleFriendRequestResponse}
                  onRefresh={refreshFriendRequests}
                  loading={loading}
                />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FriendsPage;
