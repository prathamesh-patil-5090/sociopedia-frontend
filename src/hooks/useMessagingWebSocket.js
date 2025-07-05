import { useState, useEffect, useRef, useCallback } from 'react';
import { MessagingService } from '../services/MessagingService';

export const useMessagingWebSocket = (conversationId, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef(null);
  const connectionIdRef = useRef(Math.random().toString(36).substr(2, 9)); // Unique connection ID for debugging

  console.log(`[WebSocketHook-${connectionIdRef.current}] Hook initialized for conversation:`, conversationId);

  const handleTypingIndicator = useCallback((data) => {
    console.log(`[WebSocketHook-${connectionIdRef.current}] Typing indicator:`, data);
    
    const { user_id, username, is_typing } = data;
    
    if (is_typing) {
      setTypingUsers(prev => {
        const existing = prev.find(user => user.id === user_id);
        if (!existing) {
          return [...prev, { id: user_id, username }];
        }
        return prev;
      });
      
      // Clear typing after 3 seconds
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTypingUsers(prev => prev.filter(user => user.id !== user_id));
      }, 3000);
    } else {
      setTypingUsers(prev => prev.filter(user => user.id !== user_id));
    }
  }, []);

  const connect = useCallback(async () => {
    if (!conversationId || isConnecting) {
      console.log(`[WebSocketHook-${connectionIdRef.current}] Cannot connect: no conversationId or already connecting`);
      return;
    }

    // Close existing connection if any
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      console.log(`[WebSocketHook-${connectionIdRef.current}] Closing existing WebSocket connection`);
      ws.current.close();
      ws.current = null;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Get fresh token
      const token = await MessagingService.getCurrentUserToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      console.log(`[WebSocketHook-${connectionIdRef.current}] Creating WebSocket connection for conversation:`, conversationId);
      ws.current = MessagingService.createWebSocketConnection(conversationId, token);

      // Add debugging info to WebSocket
      ws.current._hookId = connectionIdRef.current;
      ws.current._startTime = Date.now();

      ws.current.onopen = () => {
        console.log(`[WebSocketHook-${connectionIdRef.current}] WebSocket connected to conversation ${conversationId}`);
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;

        // Start heartbeat to keep connection alive - increased frequency for multiple connections
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ 
              type: 'ping',
              hookId: connectionIdRef.current,
              timestamp: Date.now()
            }));
          }
        }, 20000); // Send ping every 20 seconds (more frequent for multiple connections)
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`[WebSocketHook-${connectionIdRef.current}] Message received:`, data);

          switch (data.type) {
            case 'connection_established':
              console.log(`[WebSocketHook-${connectionIdRef.current}] Connection confirmed by server`);
              break;
            case 'message':
              if (data.message && onMessage) {
                console.log(`[WebSocketHook-${connectionIdRef.current}] New message received:`, data.message);
                console.log(`[WebSocketHook-${connectionIdRef.current}] Message sender ID:`, data.message.sender?.id);
                onMessage(data.message, 'message');
              }
              break;
            case 'message_edited':
              if (data.message && onMessage) {
                console.log(`[WebSocketHook-${connectionIdRef.current}] Message edited:`, data.message);
                onMessage(data.message, 'edited');
              }
              break;
            case 'message_deleted':
              if (data.message_id && onMessage) {
                console.log(`[WebSocketHook-${connectionIdRef.current}] Message deleted:`, data.message_id);
                onMessage(data.message_id, 'deleted');
              }
              break;
            case 'typing':
              handleTypingIndicator(data);
              break;
            case 'pong':
              // Heartbeat response
              console.log(`[WebSocketHook-${connectionIdRef.current}] Received pong from server`);
              break;
            default:
              console.log(`[WebSocketHook-${connectionIdRef.current}] Unknown message type:`, data.type);
          }
        } catch (error) {
          console.error(`[WebSocketHook-${connectionIdRef.current}] Error parsing WebSocket message:`, error);
        }
      };

      ws.current.onclose = (event) => {
        console.log(`[WebSocketHook-${connectionIdRef.current}] WebSocket closed for conversation ${conversationId}`, {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
          hookId: connectionIdRef.current,
          connectionDuration: ws.current?._startTime ? Date.now() - ws.current._startTime : 'unknown'
        });
        setIsConnected(false);
        setIsConnecting(false);

        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Only attempt to reconnect for non-auth related closures and if we haven't exceeded max attempts
        if (event.code !== 1000 && event.code !== 1008 && event.code !== 1006 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 10000);
          console.log(`[WebSocketHook-${connectionIdRef.current}] Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          const errorMsg = event.code === 1008 ? 'Authentication failed' : 
                          event.code === 1006 ? 'Connection lost unexpectedly' :
                          reconnectAttemptsRef.current >= maxReconnectAttempts ? 'Max reconnection attempts reached' :
                          'Connection closed normally';
          console.log(`[WebSocketHook-${connectionIdRef.current}] Not reconnecting: ${errorMsg}`);
          setConnectionError(errorMsg);
        }
      };

      ws.current.onerror = (error) => {
        console.error(`[WebSocketHook-${connectionIdRef.current}] WebSocket error:`, error);
        setConnectionError('Connection error');
        setIsConnecting(false);
      };

    } catch (error) {
      console.error(`[WebSocketHook-${connectionIdRef.current}] Error creating WebSocket connection:`, error);
      setConnectionError(error.message);
      setIsConnecting(false);
    }
  }, [conversationId, handleTypingIndicator, onMessage]);

  const disconnect = useCallback(() => {
    console.log(`[WebSocketHook-${connectionIdRef.current}] Manually disconnecting WebSocket`);
    
    // Clear timers
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Close WebSocket
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      ws.current.close(1000, 'Manual disconnect'); // Normal closure
      ws.current = null;
    }

    // Reset state
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
    setTypingUsers([]);
    reconnectAttemptsRef.current = 0;
  }, []);

  const sendMessage = useCallback((content) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'message',
        message: { content },
        hookId: connectionIdRef.current
      };
      console.log(`[WebSocketHook-${connectionIdRef.current}] Sending message via WebSocket:`, message);
      ws.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn(`[WebSocketHook-${connectionIdRef.current}] Cannot send message: WebSocket not connected`);
      return false;
    }
  }, []);

  const sendTypingIndicator = useCallback((isTyping) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'typing',
        is_typing: isTyping,
        hookId: connectionIdRef.current
      };
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  // Effect to handle connection/disconnection
  useEffect(() => {
    if (conversationId) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup on unmount or conversation change
    return () => {
      disconnect();
    };
  }, [conversationId, connect, disconnect]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  // Handle network connectivity changes
  useEffect(() => {
    const handleOnline = () => {
      console.log(`[WebSocketHook-${connectionIdRef.current}] Network back online, attempting to reconnect`);
      if (!isConnected && conversationId) {
        connect();
      }
    };

    const handleOffline = () => {
      console.log(`[WebSocketHook-${connectionIdRef.current}] Network went offline`);
      setConnectionError('Network disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, conversationId, connect]);

  return {
    isConnected,
    isConnecting,
    connectionError,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
    reconnect: connect,
    disconnect
  };
};
