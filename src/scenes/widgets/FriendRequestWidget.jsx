import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Button,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Check, Clear, PersonAdd } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import FlexBetween from 'components/FlexBetween';
import FriendRequestService from '../../services/FriendRequestService';

const FriendRequestWidget = ({ 
  userId, 
  showTitle = true, 
  friendRequests: propFriendRequests,
  onRequestResponse,
  onRefresh,
  loading: propLoading 
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const theme = useTheme();
  const token = useSelector((state) => state.token);
  
  // Use prop data if provided, otherwise empty array
  const friendRequests = propFriendRequests?.received_requests || [];
  const loading = propLoading || localLoading;

  // Handle accept friend request
  const handleAcceptRequest = async (requestId) => {
    try {
      setLocalLoading(true);
      setError(null);
      
      if (onRequestResponse) {
        await onRequestResponse(requestId, 'accept');
      } else {
        await FriendRequestService.respondToFriendRequest(requestId, 'accept');
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError('Failed to accept friend request');
    } finally {
      setLocalLoading(false);
    }
  };

  // Handle decline friend request
  const handleDeclineRequest = async (requestId) => {
    try {
      setLocalLoading(true);
      setError(null);
      
      if (onRequestResponse) {
        await onRequestResponse(requestId, 'decline');
      } else {
        await FriendRequestService.respondToFriendRequest(requestId, 'decline');
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      setError('Failed to decline friend request');
    } finally {
      setLocalLoading(false);
    }
  };

  if (!token || !userId) {
    return null;
  }

  return (
    <Paper
      sx={{
        backgroundColor: theme.palette.background.alt,
        borderRadius: "0.75rem",
        padding: showTitle ? "1.5rem" : "0",
      }}
    >
      {showTitle && (
        <>
          <Typography
            variant="h5"
            color={theme.palette.neutral.dark}
            fontWeight="500"
            sx={{ mb: "1rem" }}
          >
            Friend Requests
          </Typography>
          <Divider sx={{ mb: "1rem" }} />
        </>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      )}

      {!loading && friendRequests.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          padding="2rem"
        >
          <PersonAdd
            sx={{
              fontSize: "3rem",
              color: theme.palette.neutral.medium,
              mb: "1rem",
            }}
          />
          <Typography
            variant="h6"
            color={theme.palette.neutral.medium}
            textAlign="center"
          >
            No friend requests
          </Typography>
          <Typography
            variant="body2"
            color={theme.palette.neutral.medium}
            textAlign="center"
            sx={{ mt: "0.5rem" }}
          >
            When people send you friend requests, they'll appear here
          </Typography>
        </Box>
      ) : (
        <List>
          {friendRequests.map((request, index) => {
            const sender = request.sender;
            const requestDate = new Date(request.created_at).toLocaleDateString();
            
            return (
            <React.Fragment key={request.id}>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar 
                    src={sender.picturePath || sender.picture} 
                    alt={`${sender.firstName} ${sender.lastName}`}
                  >
                    {sender.firstName.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="h6" fontWeight="500">
                      {sender.firstName} {sender.lastName}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color={theme.palette.neutral.medium}>
                        @{sender.username || 'user'}
                      </Typography>
                      <Typography variant="caption" color={theme.palette.neutral.medium}>
                        Sent {requestDate}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <FlexBetween gap="0.5rem">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Check />}
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={loading}
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: "3rem",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Clear />}
                      onClick={() => handleDeclineRequest(request.id)}
                      disabled={loading}
                      sx={{
                        borderRadius: "3rem",
                        textTransform: "none",
                        borderColor: theme.palette.neutral.medium,
                        color: theme.palette.neutral.medium,
                        "&:hover": {
                          borderColor: theme.palette.neutral.dark,
                          color: theme.palette.neutral.dark,
                        },
                      }}
                    >
                      Decline
                    </Button>
                  </FlexBetween>
                </ListItemSecondaryAction>
              </ListItem>
              {index < friendRequests.length - 1 && <Divider />}
            </React.Fragment>
            );
          })}
        </List>
      )}
    </Paper>
  );
};

export default FriendRequestWidget;
