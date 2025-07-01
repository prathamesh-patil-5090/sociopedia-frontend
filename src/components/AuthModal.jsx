import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Close,
  FavoriteOutlined,
  ChatBubbleOutlineOutlined,
  PersonAddOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AuthModal = ({ open, onClose, action = 'like' }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const getActionConfig = () => {
    switch (action) {
      case 'like':
        return {
          icon: <FavoriteOutlined sx={{ fontSize: '3rem', color: '#e91e63' }} />,
          title: 'Like this post',
          description: 'Show your support for this post.',
        };
      case 'comment':
        return {
          icon: <ChatBubbleOutlineOutlined sx={{ fontSize: '3rem', color: '#2196f3' }} />,
          title: 'Make a comment',
          description: 'Share your thoughts on this post.',
        };
      case 'follow':
        return {
          icon: <PersonAddOutlined sx={{ fontSize: '3rem', color: '#4caf50' }} />,
          title: 'Follow this user',
          description: 'Stay updated with their latest posts.',
        };
      default:
        return {
          icon: <FavoriteOutlined sx={{ fontSize: '3rem', color: '#e91e63' }} />,
          title: 'Join Socipedia',
          description: 'Connect and interact with the community.',
        };
    }
  };

  const { icon, title, description } = getActionConfig();

  const handleClose = () => {
    console.log('AuthModal close button clicked');
    console.log('onClose function:', onClose);
    if (onClose) {
      onClose();
    }
  };

  const handleSignUp = () => {
    onClose();
    navigate('/login?signup=true');
  };

  const handleLogIn = () => {
    onClose();
    navigate('/login');
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          backgroundColor: theme.palette.background.alt,
          minHeight: '400px',
        },
      }}
    >
      <DialogTitle sx={{ 
        position: 'relative', 
        textAlign: 'center', 
        pb: 2,
        pointerEvents: 'none' 
      }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.neutral.medium,
            zIndex: 1001,
            width: 40,
            height: 40,
            pointerEvents: 'auto',
            '&:hover': {
              backgroundColor: theme.palette.neutral.light,
              color: theme.palette.neutral.dark,
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', px: 4, pb: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={3}
        >
          {/* Icon cluster */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              mb: 2,
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(45deg, #e91e63, #2196f3, #4caf50)',
                borderRadius: '50%',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
            {/* Additional decorative icons */}
            <Box
              sx={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                backgroundColor: '#ff9800',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
              }}
            >
              😊
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: '-5px',
                left: '-15px',
                backgroundColor: '#9c27b0',
                borderRadius: '50%',
                width: '35px',
                height: '35px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
              }}
            >
              ❤️
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            fontWeight="600"
            color={theme.palette.neutral.dark}
            mb={1}
          >
            {title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            color={theme.palette.neutral.medium}
            mb={2}
            maxWidth="280px"
          >
            {description}
          </Typography>

          <Typography
            variant="body2"
            color={theme.palette.neutral.medium}
            mb={3}
            fontSize="0.8rem"
          >
            By continuing, you agree to Socipedia's{' '}
            <span style={{ color: theme.palette.primary.main }}>Terms of Use</span>{' '}
            and{' '}
            <span style={{ color: theme.palette.primary.main }}>Privacy Policy</span>.
          </Typography>

          {/* Action Buttons */}
          <Box width="100%" display="flex" flexDirection="column" gap={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSignUp}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                borderRadius: '8px',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: '600',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              Sign up
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={handleLogIn}
              sx={{
                color: theme.palette.primary.main,
                borderRadius: '8px',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: '500',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '10',
                },
              }}
            >
              Log in
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
