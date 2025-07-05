import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  InputBase,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import { 
  Message, 
  Send, 
  MoreVert,
  ArrowBack,
  Edit,
  Delete,
  Check,
  CheckCircle,
} from '@mui/icons-material';
import Navbar from 'scenes/navbar';
import FlexBetween from 'components/FlexBetween';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { MessagingService } from '../../services/MessagingService';
import { useMessagingWebSocket } from '../../hooks/useMessagingWebSocket';

const MessagesPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [conversationsState, setConversationsState] = useState([]);
  const [messagesState, setMessagesState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [refreshingMessages, setRefreshingMessages] = useState(false);
  
  // Ensure conversations is always an array
  const conversations = Array.isArray(conversationsState) ? conversationsState : [];
  const setConversations = (value) => {
    if (typeof value === 'function') {
      setConversationsState(prev => {
        const result = value(Array.isArray(prev) ? prev : []);
        return Array.isArray(result) ? result : [];
      });
    } else {
      setConversationsState(Array.isArray(value) ? value : []);
    }
  };
  
  // Ensure messages is always an array
  const messages = Array.isArray(messagesState) ? messagesState : [];
  const setMessages = (value) => {
    if (typeof value === 'function') {
      setMessagesState(prev => {
        const result = value(Array.isArray(prev) ? prev : []);
        return Array.isArray(result) ? result : [];
      });
    } else {
      setMessagesState(Array.isArray(value) ? value : []);
    }
  };
  
  // Debug logging
  useEffect(() => {
    // Removed debug logging for performance
  }, [messages]);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const theme = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const isAuth = Boolean(useSelector((state) => state.token));
  const user = useSelector((state) => state.user) || {};
  const userId = user._id;
  const navigate = useNavigate();
  const { chatId } = useParams();

  // WebSocket connection for real-time messaging
  const {
    isConnected,
    typingUsers,
    sendMessage: sendMessageWS,
    sendTypingIndicator,
    connectionError,
  } = useMessagingWebSocket(selectedChat?.id, handleWebSocketMessage);

  // Handle WebSocket messages
  function handleWebSocketMessage(data, type = 'message') {
    switch (type) {
      case 'message':
        if (data && data.id) {
          setMessages(prev => {
            const prevArray = Array.isArray(prev) ? prev : [];
            
            // Check if message already exists to prevent duplicates
            const messageExists = prevArray.some(msg => msg.id === data.id);
            if (messageExists) {
              return prevArray;
            }

            const isFromCurrentUser = data.sender?._id === userId || data.sender?.id === userId || 
                                     data.sender?._id === user?._id || data.sender?.id === user?.id ||
                                     data.sender?.username === user?.username;
            
            // If it's from current user, try to replace optimistic message
            if (isFromCurrentUser) {
              const optimisticIndex = prevArray.findIndex(msg => 
                msg.is_optimistic && 
                msg.content === data.content &&
                (msg.sender?._id === userId || msg.sender?.id === userId || 
                 msg.sender?._id === user?._id || msg.sender?.id === user?.id ||
                 msg.sender?.username === user?.username)
              );

              if (optimisticIndex !== -1) {
                // Replace optimistic message with real one
                const updated = [...prevArray];
                updated[optimisticIndex] = { ...data, is_optimistic: false };
                return updated;
              }
            }

            // Add new message (for both current user and other users)
            const newMessages = [...prevArray, data];
            
            // Only auto-scroll if user is at the bottom or it's their own message
            if (isFromCurrentUser) {
              // Always scroll for own messages
              setTimeout(() => scrollToBottom(), 50);
            } else {
              // For other users' messages, only scroll if already at bottom
              setTimeout(() => {
                const messagesContainer = messagesEndRef.current?.parentElement;
                if (messagesContainer) {
                  const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
                  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold
                  if (isAtBottom) {
                    scrollToBottom();
                  }
                }
              }, 50);
            }
            
            return newMessages;
          });
        }
        break;
      case 'edited':
        if (data && data.id) {
          setMessages(prev => {
            const prevArray = Array.isArray(prev) ? prev : [];
            return prevArray.map(msg => msg.id === data.id ? { ...msg, ...data } : msg);
          });
        }
        break;
      case 'deleted':
        setMessages(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return prevArray.filter(msg => msg.id !== data);
        });
        break;
      case 'read':
        break;
      default:
        break;
    }
  }

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const conversationsData = await MessagingService.getConversations();
      
      // Handle different response formats
      let conversationsArray = [];
      if (Array.isArray(conversationsData)) {
        conversationsArray = conversationsData;
      } else if (conversationsData && Array.isArray(conversationsData.results)) {
        // Handle paginated response
        conversationsArray = conversationsData.results;
      } else if (conversationsData && conversationsData.data && Array.isArray(conversationsData.data)) {
        // Handle wrapped response
        conversationsArray = conversationsData.data;
      } else {
        console.warn('Unexpected conversations response format:', conversationsData);
        conversationsArray = [];
      }
      
      setConversations(conversationsArray);
      
      // If we have a chatId from URL, find and select that conversation
      if (chatId && conversationsArray.length > 0) {
        const conversation = conversationsArray.find(conv => conv.id === parseInt(chatId));
        if (conversation) {
          setSelectedChat(conversation);
        }
      }
    } catch (error) {
      setError('Failed to load conversations');
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const loadMessages = useCallback(async (conversationId) => {
    try {
      const messagesData = await MessagingService.getMessages(conversationId);
      
      let messagesArray = [];
      if (Array.isArray(messagesData)) {
        messagesArray = messagesData;
      } else if (messagesData && Array.isArray(messagesData.results)) {
        messagesArray = messagesData.results;
      } else if (messagesData && messagesData.data && Array.isArray(messagesData.data)) {
        messagesArray = messagesData.data;
      } else {
        messagesArray = [];
      }
      
      messagesArray.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setMessages(messagesArray);
      scrollToBottom();
      
      await MessagingService.markMessagesAsRead(conversationId);
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  // Load conversations on mount
  useEffect(() => {
    if (isAuth) {
      loadConversations();
    }
  }, [isAuth, loadConversations]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedChat) {
      // Clear messages first to avoid stale data
      setMessages([]);
      loadMessages(selectedChat.id);
      
      // Set up periodic refresh if WebSocket is not connected
      const refreshInterval = setInterval(() => {
        if (!isConnected) {
          loadMessages(selectedChat.id);
        }
      }, 5000); // Refresh every 5 seconds when not connected
      
      return () => clearInterval(refreshInterval);
    }
  }, [selectedChat, loadMessages, isConnected]);

  const handleChatSelect = async (conversation) => {
    setSelectedChat(conversation);
    if (!isNonMobileScreens) {
      navigate(`/messages/${conversation.id}`);
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !imageFile) || !selectedChat || sendingMessage) return;

    const messageContent = message.trim();
    const tempId = Date.now();

    try {
      setSendingMessage(true);
      
      // Create optimistic message
      const optimisticMessage = {
        id: tempId,
        content: messageContent,
        sender: {
          id: user.id,
          _id: user._id,
          username: user.username || 'You',
          firstName: user.firstName,
          lastName: user.lastName,
          first_name: user.firstName,
          last_name: user.lastName,
          picturePath: user.picturePath || ""
        },
        created_at: new Date().toISOString(),
        is_optimistic: true,
        conversation: selectedChat.id,
        image_url: imageFile ? URL.createObjectURL(imageFile) : null
      };

      // Add optimistic message immediately
      if (messageContent || imageFile) {
        setMessages(prev => [...(Array.isArray(prev) ? prev : []), optimisticMessage]);
        scrollToBottom();
      }

      // Clear inputs
      setMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImageFile(null);
      setImagePreview(null);

      // Set timeout to mark failed messages
      setTimeout(() => {
        setMessages(prev => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return prevArray.map(msg => 
            msg.id === tempId && msg.is_optimistic 
              ? { ...msg, is_optimistic: false, is_failed: true } 
              : msg
          );
        });
      }, 10000);

      // Send via WebSocket or REST API
      if (isConnected && !imageFile) {
        const messageSent = sendMessageWS(messageContent);
        if (!messageSent) {
          await MessagingService.sendMessage(selectedChat.id, messageContent, null);
          // Force reload messages since WebSocket failed
          setTimeout(() => loadMessages(selectedChat.id), 500);
        }
      } else {
        await MessagingService.sendMessage(selectedChat.id, messageContent, imageFile);
        // If WebSocket not connected, reload to ensure we see all messages
        if (!isConnected) {
          setTimeout(() => loadMessages(selectedChat.id), 500);
        }
      }
      
    } catch (error) {
      setError(`Failed to send message: ${error.message || 'Unknown error'}`);
      setMessages(prev => {
        const prevArray = Array.isArray(prev) ? prev : [];
        return prevArray.map(msg => 
          msg.id === tempId ? { ...msg, is_optimistic: false, is_failed: true } : msg
        );
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (value) => {
    setMessage(value);
    
    if (selectedChat && isConnected) {
      sendTypingIndicator(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 2000);
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMessageMenuOpen = (event, messageId) => {
    setMessageMenuAnchor(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  const handleMessageMenuClose = () => {
    setMessageMenuAnchor(null);
    setSelectedMessageId(null);
  };

  const handleEditMessage = () => {
    const messageToEdit = messages.find(msg => msg.id === selectedMessageId);
    if (messageToEdit) {
      setEditingMessage(messageToEdit);
      setEditContent(messageToEdit.content);
    }
    handleMessageMenuClose();
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || !editingMessage) return;

    try {
      await MessagingService.editMessage(selectedChat.id, editingMessage.id, editContent.trim());
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      setError('Failed to edit message');
      console.error('Error editing message:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessageId) return;

    try {
      await MessagingService.deleteMessage(selectedChat.id, selectedMessageId);
    } catch (error) {
      setError('Failed to delete message');
      console.error('Error deleting message:', error);
    }
    handleMessageMenuClose();
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (message) => {
    if (!message || !message.sender) return false;
    
    // Temporary debug - remove after testing
    if (message.id && typeof message.id === 'number' && message.id > 0) {
      console.log('Message ownership check:', {
        messageId: message.id,
        senderId: message.sender?._id,
        senderIdAlt: message.sender?.id,
        senderUsername: message.sender?.username,
        currentUserId: userId,
        currentUserIdAlt: user?._id,
        currentUserIdAlt2: user?.id,
        currentUsername: user?.username,
      });
    }
    
    // Try multiple ID formats and convert to strings for comparison
    const senderId = String(message.sender?._id || message.sender?.id || '');
    const senderUsername = message.sender?.username;
    
    const currentUserId = String(userId || user?._id || user?.id || '');
    const currentUsername = user?.username;
    
    // Compare by ID first, then by username as fallback
    const matchById = senderId && currentUserId && senderId === currentUserId;
    const matchByUsername = senderUsername && currentUsername && senderUsername === currentUsername;
    
    return matchById || matchByUsername;
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
            Please log in to view your messages
          </Typography>
        </Box>
      </Box>
    );
  }

  if (loading) {
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
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // Mobile view - show either conversations or selected chat
  if (!isNonMobileScreens) {
    if (chatId && selectedChat) {
      return (
        <Box>
          <Navbar />
          <Box
            width="100%"
            padding="1rem"
            display="flex"
            flexDirection="column"
            height="calc(100vh - 80px - 60px)" // Account for navbar and mobile footer
          >
            {/* Chat Header */}
            <Paper
              sx={{
                backgroundColor: theme.palette.background.alt,
                borderRadius: "0.75rem",
                padding: "1rem",
                mb: "1rem",
              }}
            >
              <FlexBetween>
                <FlexBetween gap="1rem">
                  <IconButton onClick={() => navigate('/messages')}>
                    <ArrowBack />
                  </IconButton>
                  <Avatar src={selectedChat.other_participant?.picturePath}>
                    {selectedChat.other_participant?.firstName?.charAt(0)?.toUpperCase() || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="500">
                      {selectedChat.other_participant ? 
                        `${selectedChat.other_participant.firstName} ${selectedChat.other_participant.lastName}` : 
                        'Unknown User'
                      }
                    </Typography>
                    <Box display="flex" alignItems="center" gap="0.5rem">
                      <Typography 
                        variant="caption" 
                        color={
                          isConnected ? theme.palette.success.main : 
                          connectionError ? theme.palette.error.main : 
                          theme.palette.warning.main
                        }
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.25rem',
                          fontWeight: 500
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: isConnected ? theme.palette.success.main : 
                              connectionError ? theme.palette.error.main : 
                              theme.palette.warning.main,
                            animation: !isConnected && !connectionError ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': {
                              '0%': { opacity: 1 },
                              '50%': { opacity: 0.5 },
                              '100%': { opacity: 1 }
                            }
                          }}
                        />
                      </Typography>
                      {typingUsers.length > 0 && (
                        <Typography 
                          variant="caption" 
                          color={theme.palette.primary.main}
                          sx={{ fontStyle: 'italic' }}
                        >
                          {typingUsers.length === 1 
                            ? `${typingUsers[0].username} is typing...`
                            : `${typingUsers.length} people typing...`
                          }
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </FlexBetween>
              </FlexBetween>
            </Paper>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 2 }}
                  action={
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={() => {
                        setError(null);
                        if (selectedChat) {
                          loadMessages(selectedChat.id);
                        }
                      }}
                    >
                      Retry
                    </Button>
                  }
                >
                  {error}
                </Alert>
              )}

              {/* Messages */}
              <Box flexGrow={1} overflow="auto" mb="1rem">
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    display="flex"
                    justifyContent={isOwnMessage(msg) ? 'flex-end' : 'flex-start'}
                    mb="0.5rem"
                  >
                    <Paper
                      sx={{
                        backgroundColor: msg.is_failed 
                          ? theme.palette.error.light 
                          : isOwnMessage(msg) 
                            ? theme.palette.primary.main 
                            : theme.palette.neutral.light,
                        color: isOwnMessage(msg) 
                          ? theme.palette.primary.contrastText 
                          : theme.palette.neutral.dark,
                        padding: "0.75rem 1rem",
                        borderRadius: "1rem",
                        maxWidth: '70%',
                        position: 'relative',
                        opacity: msg.is_optimistic ? 0.7 : 1,
                        transition: 'opacity 0.3s ease-in-out',
                      }}
                      onContextMenu={(e) => {
                        if (isOwnMessage(msg)) {
                          e.preventDefault();
                          handleMessageMenuOpen(e, msg.id);
                        }
                      }}
                    >
                      {msg.image_url && (
                        <Box mb={msg.content ? 1 : 0}>
                          <img
                            src={msg.image_url}
                            alt="Message attachment"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              borderRadius: '8px',
                            }}
                          />
                        </Box>
                      )}
                      
                      {msg.content && (
                        <Typography variant="body2">
                          {msg.content}
                          {msg.is_edited && (
                            <Typography 
                              component="span" 
                              variant="caption" 
                              sx={{ opacity: 0.7, fontStyle: 'italic', ml: 1 }}
                            >
                              (edited)
                            </Typography>
                          )}
                        </Typography>
                      )}
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '0.25rem',
                          mt: '0.25rem',
                        }}
                      >
                        {formatMessageTime(msg.created_at)}
                        {isOwnMessage(msg) && (
                          <>
                            {msg.is_failed ? (
                              <Typography 
                                variant="caption" 
                                sx={{ color: theme.palette.error.main, fontSize: '10px' }}
                              >
                                Failed
                              </Typography>
                            ) : msg.is_optimistic ? (
                              <CircularProgress 
                                size={8} 
                                sx={{ 
                                  color: isOwnMessage(msg) ? 'inherit' : theme.palette.primary.main,
                                  opacity: 0.5 
                                }} 
                              />
                            ) : msg.read_by && msg.read_by.length > 0 ? (
                              <CheckCircle sx={{ fontSize: 12, verticalAlign: 'middle' }} />
                            ) : (
                              <Check sx={{ fontSize: 12, verticalAlign: 'middle' }} />
                            )}
                          </>
                        )}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                
                {/* Typing indicators */}
                {typingUsers.length > 0 && (
                  <Box display="flex" justifyContent="flex-start" mb="0.5rem">
                    <Paper
                      sx={{
                        backgroundColor: theme.palette.neutral.light,
                        padding: "0.5rem 1rem",
                        borderRadius: "1rem",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {typingUsers.map(user => user.username).join(', ')} typing...
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box>
                {imagePreview && (
                  <Box mb={1} position="relative" display="inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '150px',
                        borderRadius: '8px',
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: theme.palette.error.main,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.error.dark,
                        },
                        width: 24,
                        height: 24,
                      }}
                    >
                      ×
                    </IconButton>
                  </Box>
                )}
                
                <Paper
                  sx={{
                    backgroundColor: theme.palette.neutral.light,
                    borderRadius: "2rem",
                    padding: "0.5rem 1rem",
                  }}
                >
                  <FlexBetween>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    
                    <InputBase
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={handleKeyPress}
                      multiline
                      maxRows={3}
                      sx={{ width: "100%", mx: 1 }}
                      disabled={sendingMessage}
                    />
                    
                    <IconButton 
                      onClick={handleSendMessage} 
                      disabled={(!message.trim() && !imageFile) || sendingMessage}
                    >
                      {sendingMessage ? <CircularProgress size={24} /> : <Send />}
                    </IconButton>
                  </FlexBetween>
                </Paper>
              </Box>
          </Box>
        </Box>
      );
    }

    // Mobile conversations list
    return (
      <Box>
        <Navbar />
        <Box
          width="100%"
          padding="2rem 6%"
          paddingBottom="6rem" // Extra padding for mobile footer
        >
          <Typography
            variant="h4"
            color={theme.palette.neutral.dark}
            fontWeight="500"
            sx={{ mb: "1.5rem" }}
          >
            Messages
          </Typography>

          <Paper
            sx={{
              backgroundColor: theme.palette.background.alt,
              borderRadius: "0.75rem",
            }}
          >
            {error && (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            )}
            
            <List>
              {conversations.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body1" textAlign="center" sx={{ py: 2 }}>
                        No conversations yet. Start messaging your friends!
                      </Typography>
                    }
                  />
                </ListItem>
              ) : (
                conversations.map((conversation, index) => {
                  const otherParticipant = conversation.other_participant;
                  const lastMessage = conversation.last_message;
                  
                  return (
                    <React.Fragment key={conversation.id}>
                      <ListItem
                        onClick={() => handleChatSelect(conversation)}
                        sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme.palette.neutral.light } }}
                      >
                        <ListItemAvatar>
                          <Badge
                            variant="dot"
                            color="success"
                            invisible={!otherParticipant?.isOnline} // You can implement online status later
                            sx={{
                              '& .MuiBadge-badge': {
                                backgroundColor: '#44b700',
                                color: '#44b700',
                              },
                            }}
                          >
                            <Avatar src={otherParticipant?.picturePath}>
                              {otherParticipant?.firstName?.charAt(0)?.toUpperCase() || '?'}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <FlexBetween>
                              <Typography variant="h6" fontWeight="500">
                                {otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown User'}
                              </Typography>
                              <Typography variant="caption" color={theme.palette.neutral.medium}>
                                {lastMessage ? formatMessageTime(lastMessage.created_at) : ''}
                              </Typography>
                            </FlexBetween>
                          }
                          secondary={
                            <FlexBetween>
                              <Typography 
                                variant="body2" 
                                color={theme.palette.neutral.medium}
                                sx={{ 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '200px',
                                }}
                              >
                                {lastMessage ? (
                                  lastMessage.image_url && !lastMessage.content ? 
                                    '📷 Image' : 
                                    lastMessage.content || '📷 Image'
                                ) : 'No messages yet'}
                              </Typography>
                              {conversation.unread_count > 0 && (
                                <Badge 
                                  badgeContent={conversation.unread_count} 
                                  color="primary"
                                  sx={{ ml: '1rem' }}
                                />
                              )}
                            </FlexBetween>
                          }
                        />
                      </ListItem>
                      {index < conversations.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })
              )}
            </List>
          </Paper>
        </Box>
      </Box>
    );
  }

  // Desktop view - side by side layout
  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display="flex"
        gap="1.5rem"
        height="calc(100vh - 120px)"
      >
        {/* Conversations List */}
        <Paper
          sx={{
            backgroundColor: theme.palette.background.alt,
            borderRadius: "0.75rem",
            width: "350px",
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h5"
            fontWeight="500"
            sx={{ p: "1.5rem", pb: "1rem" }}
          >
            Messages
          </Typography>
          <Divider />
          <List sx={{ flexGrow: 1, overflow: 'auto' }}>
            {conversations.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body1" textAlign="center" sx={{ py: 2 }}>
                      No conversations yet. Start messaging your friends!
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              Array.isArray(conversations) && conversations.length > 0 ? conversations.map((conversation, index) => {
                const otherParticipant = conversation.other_participant;
                const lastMessage = conversation.last_message;
                
                return (
                  <React.Fragment key={conversation.id}>
                    <ListItem
                      onClick={() => handleChatSelect(conversation)}
                      sx={{ 
                        cursor: 'pointer',
                        backgroundColor: selectedChat?.id === conversation.id 
                          ? theme.palette.primary.light + '20' 
                          : 'transparent',
                        '&:hover': { backgroundColor: theme.palette.neutral.light },
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          variant="dot"
                          color="success"
                          invisible={!otherParticipant?.isOnline} // You can implement online status later
                        >
                          <Avatar src={otherParticipant?.picturePath}>
                            {otherParticipant?.firstName?.charAt(0)?.toUpperCase() || '?'}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <FlexBetween>
                            <Typography variant="subtitle1" fontWeight="500">
                              {otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color={theme.palette.neutral.medium}>
                              {lastMessage ? formatMessageTime(lastMessage.created_at) : ''}
                            </Typography>
                          </FlexBetween>
                        }
                        secondary={
                          <FlexBetween>
                            <Typography 
                              variant="body2" 
                              color={theme.palette.neutral.medium}
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {lastMessage ? (
                                lastMessage.image_url && !lastMessage.content ? 
                                  '📷 Image' : 
                                  lastMessage.content || '📷 Image'
                              ) : 'No messages yet'}
                            </Typography>
                            {conversation.unread_count > 0 && (
                              <Badge badgeContent={conversation.unread_count} color="primary" />
                            )}
                          </FlexBetween>
                        }
                      />
                    </ListItem>
                    {index < conversations.length - 1 && <Divider />}
                  </React.Fragment>
                );
              }) : null
            )}
          </List>
        </Paper>

        {/* Chat Area */}
        <Paper
          sx={{
            backgroundColor: theme.palette.background.alt,
            borderRadius: "0.75rem",
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <FlexBetween sx={{ p: "1.5rem", pb: "1rem" }}>
                <FlexBetween gap="1rem">
                  <Avatar src={selectedChat.other_participant?.picturePath}>
                    {selectedChat.other_participant?.firstName?.charAt(0)?.toUpperCase() || '?'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="500">
                      {selectedChat.other_participant ? 
                        `${selectedChat.other_participant.firstName} ${selectedChat.other_participant.lastName}` : 
                        'Unknown User'
                      }
                    </Typography>
                  </Box>
                </FlexBetween>
                <Box display="flex" alignItems="center" gap="0.5rem">
                </Box>
              </FlexBetween>
              <Divider />

              {/* Messages */}
              <Box flexGrow={1} overflow="auto" p="1rem">
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                
                {messages.map((msg) => (
                  <Box
                    key={msg.id}
                    display="flex"
                    justifyContent={isOwnMessage(msg) ? 'flex-end' : 'flex-start'}
                    mb="1rem"
                  >
                    <Paper
                      sx={{
                        backgroundColor: msg.is_failed 
                          ? theme.palette.error.light 
                          : isOwnMessage(msg) 
                            ? theme.palette.primary.main 
                            : theme.palette.neutral.light,
                        color: isOwnMessage(msg) 
                          ? theme.palette.primary.contrastText 
                          : theme.palette.neutral.dark,
                        padding: "0.75rem 1rem",
                        borderRadius: "1rem",
                        maxWidth: '60%',
                        position: 'relative',
                        opacity: msg.is_optimistic ? 0.7 : 1,
                        transition: 'opacity 0.3s ease-in-out',
                      }}
                      onContextMenu={(e) => {
                        if (isOwnMessage(msg)) {
                          e.preventDefault();
                          handleMessageMenuOpen(e, msg.id);
                        }
                      }}
                    >
                      {msg.image_url && (
                        <Box mb={msg.content ? 1 : 0}>
                          <img
                            src={msg.image_url}
                            alt="Message attachment"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '200px',
                              borderRadius: '8px',
                            }}
                          />
                        </Box>
                      )}
                      
                      {msg.content && (
                        <Typography variant="body1">
                          {msg.content}
                          {msg.is_edited && (
                            <Typography 
                              component="span" 
                              variant="caption" 
                              sx={{ opacity: 0.7, fontStyle: 'italic', ml: 1 }}
                            >
                              (edited)
                            </Typography>
                          )}
                        </Typography>
                      )}
                      
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.7,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '0.25rem',
                          mt: '0.25rem',
                        }}
                      >
                        {formatMessageTime(msg.created_at)}
                        {isOwnMessage(msg) && (
                          <>
                            {msg.is_failed ? (
                              <Typography 
                                variant="caption" 
                                sx={{ color: theme.palette.error.main, fontSize: '10px' }}
                              >
                                Failed
                              </Typography>
                            ) : msg.is_optimistic ? (
                              <CircularProgress 
                                size={8} 
                                sx={{ 
                                  color: isOwnMessage(msg) ? 'inherit' : theme.palette.primary.main,
                                  opacity: 0.5 
                                }} 
                              />
                            ) : msg.read_by && msg.read_by.length > 0 ? (
                              <CheckCircle sx={{ fontSize: 12, verticalAlign: 'middle' }} />
                            ) : (
                              <Check sx={{ fontSize: 12, verticalAlign: 'middle' }} />
                            )}
                          </>
                        )}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                
                {/* Typing indicators */}
                {typingUsers.length > 0 && (
                  <Box display="flex" justifyContent="flex-start" mb="1rem">
                    <Paper
                      sx={{
                        backgroundColor: theme.palette.neutral.light,
                        padding: "0.5rem 1rem",
                        borderRadius: "1rem",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {typingUsers.map(user => user.username).join(', ')} typing...
                      </Typography>
                    </Paper>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box p="1rem">
                {imagePreview && (
                  <Box mb={1} position="relative" display="inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '150px',
                        borderRadius: '8px',
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: theme.palette.error.main,
                        color: 'white',
                        '&:hover': {
                          backgroundColor: theme.palette.error.dark,
                        },
                        width: 24,
                        height: 24,
                      }}
                    >
                      ×
                    </IconButton>
                  </Box>
                )}
                
                <Paper
                  sx={{
                    backgroundColor: theme.palette.neutral.light,
                    borderRadius: "2rem",
                    padding: "0.5rem 1rem",
                  }}
                >
                  <FlexBetween>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    
                    <InputBase
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyPress={handleKeyPress}
                      multiline
                      maxRows={3}
                      sx={{ width: "100%", mx: 1 }}
                      disabled={sendingMessage}
                    />
                    
                    <IconButton 
                      onClick={handleSendMessage} 
                      disabled={(!message.trim() && !imageFile) || sendingMessage}
                    >
                      {sendingMessage ? <CircularProgress size={24} /> : <Send />}
                    </IconButton>
                  </FlexBetween>
                </Paper>
              </Box>
            </>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <Message
                sx={{
                  fontSize: "4rem",
                  color: theme.palette.neutral.medium,
                  mb: "1rem",
                }}
              />
              <Typography
                variant="h6"
                color={theme.palette.neutral.medium}
                textAlign="center"
              >
                Select a conversation to start messaging
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Message Context Menu */}
      <Menu
        anchorEl={messageMenuAnchor}
        open={Boolean(messageMenuAnchor)}
        onClose={handleMessageMenuClose}
      >
        <MenuItem onClick={handleEditMessage}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteMessage} sx={{ color: theme.palette.error.main }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Message Dialog */}
      <Dialog open={Boolean(editingMessage)} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Message</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Edit your message..."
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained"
            disabled={!editContent.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MessagesPage;
