import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';

const useWebSocket = (userId, onNotification, onFriendRequestInvalid) => {
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000); // Start with 1 second
  const isConnected = useRef(false);
  const token = useSelector((state) => state.token);
  
  // Store callbacks in refs to prevent unnecessary reconnections
  const onNotificationRef = useRef(onNotification);
  const onFriendRequestInvalidRef = useRef(onFriendRequestInvalid);
  
  // Update refs when callbacks change
  useEffect(() => {
    onNotificationRef.current = onNotification;
    onFriendRequestInvalidRef.current = onFriendRequestInvalid;
  }, [onNotification, onFriendRequestInvalid]);

  const connect = useCallback(() => {
    if (!userId || !token) return;
    
    // Prevent multiple connections
    if (ws.current && (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connected or connecting, skipping...');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Remove /api from the URL and any trailing slashes for WebSocket connection
    let host = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000';
    host = host.replace(/\/api\/?$/, ''); // Remove /api suffix if present
    const wsUrl = `${protocol}//${host}/ws/notifications/${userId}/?token=${encodeURIComponent(token)}`;

    console.log('Connecting to WebSocket:', wsUrl);

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      isConnected.current = true;
      reconnectAttempts.current = 0;
      reconnectDelay.current = 1000; // Reset delay
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        if (data.type === 'notification' && onNotificationRef.current) {
          onNotificationRef.current(data.notification);
        } else if (data.type === 'unread_notifications') {
          // Handle initial unread notifications - these are existing notifications, not new ones
          // We should not add them as new notifications to prevent duplicates
          // The initial fetch via REST API already handles getting all notifications
          console.log('Received unread notifications batch, skipping to prevent duplicates');
        } else if (data.type === 'friend_request_invalid' && onFriendRequestInvalidRef.current) {
          onFriendRequestInvalidRef.current(data.notification_id, data.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      isConnected.current = false;

      // Attempt to reconnect if not a normal closure
      if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
        
        setTimeout(() => {
          connect();
        }, reconnectDelay.current);
        
        // Exponential backoff
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
      } else if (event.code !== 1000) {
        console.warn('WebSocket failed to reconnect after maximum attempts. Real-time notifications will be unavailable.');
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      console.warn('WebSocket connection failed - real-time notifications will be unavailable, but the app will continue to work');
    };
  }, [userId, token]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, 'Component unmounting');
      ws.current = null;
      isConnected.current = false;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current && isConnected.current) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const markAsRead = useCallback((notificationId) => {
    sendMessage({
      type: 'mark_as_read',
      notification_id: notificationId
    });
  }, [sendMessage]);

  useEffect(() => {
    if (userId && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, token]); // Remove connect and disconnect from dependencies

  return {
    isConnected: isConnected.current,
    sendMessage,
    markAsRead,
    reconnect: connect
  };
};

export default useWebSocket;
