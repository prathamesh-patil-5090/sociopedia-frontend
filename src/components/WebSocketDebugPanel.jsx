import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, Alert, useTheme } from '@mui/material';

const WebSocketDebugPanel = ({ isConnected, connectionError, hookId }) => {
  const [connectionHistory, setConnectionHistory] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    const status = isConnected ? 'connected' : connectionError ? 'error' : 'disconnected';
    
    setConnectionHistory(prev => [
      ...prev.slice(-9), // Keep last 10 entries
      { timestamp, status, error: connectionError, hookId }
    ]);
  }, [isConnected, connectionError, hookId]);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 10,
        width: 300,
        maxHeight: 400,
        overflow: 'auto',
        zIndex: 9999,
        opacity: 0.9,
      }}
    >
      <Paper
        sx={{
          p: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" gutterBottom>
          WebSocket Debug ({hookId})
        </Typography>
        
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Chip
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            size="small"
          />
          {connectionError && (
            <Chip
              label="Error"
              color="warning"
              size="small"
            />
          )}
        </Box>

        {connectionError && (
          <Alert severity="warning" sx={{ mb: 2, p: 1 }}>
            <Typography variant="caption">
              {connectionError}
            </Typography>
          </Alert>
        )}

        <Typography variant="subtitle2" gutterBottom>
          Connection History:
        </Typography>
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          {connectionHistory.map((entry, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 0.5,
                borderBottom: index < connectionHistory.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
              }}
            >
              <Typography variant="caption">
                {entry.timestamp}
              </Typography>
              <Chip
                label={entry.status}
                color={
                  entry.status === 'connected' ? 'success' :
                  entry.status === 'error' ? 'error' : 'default'
                }
                size="small"
              />
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default WebSocketDebugPanel;
