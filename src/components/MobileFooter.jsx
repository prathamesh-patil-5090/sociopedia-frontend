import React from 'react';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  useMediaQuery,
  Badge,
  Paper,
} from '@mui/material';
import {
  Home,
  Search,
  People,
  Message,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MobileFooter = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:1000px)");
  const isAuth = Boolean(useSelector((state) => state.token));
  const user = useSelector((state) => state.user) || {};
  const userId = user._id;
  
  // Don't show footer if not mobile
  if (!isMobile) {
    return null;
  }

  // Get current value based on pathname
  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/home' || path === '/') return 0;
    if (path === '/search') return 1;
    if (!isAuth) {
      if (path === '/login') return 2;
      return 0; // Default to home for unauthenticated
    }
    if (path === '/friends') return 2;
    if (path === '/messages' || path.startsWith('/messages/')) return 3;
    return 0; // Default to home
  };

  const handleNavigation = (event, newValue) => {
    console.log(`Navigation event: value=${newValue}, isAuth=${isAuth}`);

    if (!isAuth) {
      switch (newValue) {
        case 0:
          navigate('/');
          break;
        case 1:
          navigate('/search');
          break;
        case 2:
          navigate('/login');
          break;
        default:
          navigate('/');
      }
      return;
    }

    // Authenticated user navigation
    switch (newValue) {
      case 0:
        navigate('/home');
        break;
      case 1:
        navigate('/search');
        break;
      case 2:
        navigate('/friends');
        break;
      case 3:
        navigate('/messages');
        break;
      default:
        navigate('/home');
    }
  };

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default,
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleNavigation}
        sx={{
          backgroundColor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            color: theme.palette.neutral.medium,
            minWidth: 'auto',
            padding: '6px 12px 8px',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
            '&:hover': {
              color: theme.palette.primary.light,
            },
          },
        }}
      >
        <BottomNavigationAction
          label="Home"
          icon={<Home />}
          sx={{ 
            fontSize: '0.75rem',
            '& .MuiSvgIcon-root': {
              fontSize: '1.5rem',
            },
          }}
        />
        <BottomNavigationAction
          label="Search"
          icon={<Search />}
          sx={{ 
            fontSize: '0.75rem',
            '& .MuiSvgIcon-root': {
              fontSize: '1.5rem',
            },
          }}
        />
        {isAuth ? [
            <BottomNavigationAction
              key="friends"
              label="Friends"
              icon={<People />}
              sx={{ 
                fontSize: '0.75rem',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.5rem',
                },
              }}
            />,
            <BottomNavigationAction
              key="messages"
              label="Messages"
              icon={
                <Badge 
                  badgeContent={0} // You can add message count here later
                  color="error"
                  invisible={true} // Set to false when you have unread messages
                >
                  <Message />
                </Badge>
              }
              sx={{ 
                fontSize: '0.75rem',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.5rem',
                },
              }}
            />
        ] : (
          <BottomNavigationAction
            label="Login"
            icon={<People />}
            sx={{ 
              fontSize: '0.75rem',
              '& .MuiSvgIcon-root': {
                fontSize: '1.5rem',
              },
            }}
          />
        )}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileFooter;
