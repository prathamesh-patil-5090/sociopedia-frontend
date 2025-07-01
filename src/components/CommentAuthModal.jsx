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
  ChatBubbleOutlineOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CommentAuthModal = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleClose = () => {
    console.log('CommentAuthModal close button clicked');
    console.log('CommentAuthModal: onClose function:', onClose);
    console.log('CommentAuthModal: calling onClose...');
    if (onClose) {
      onClose();
    }
    console.log('CommentAuthModal: onClose called');
  };

  const handleSignUp = () => {
    if (onClose) {
      onClose();
    }
    navigate('/login?signup=true');
  };

  const handleLogIn = () => {
    if (onClose) {
      onClose();
    }
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
      <DialogTitle
        sx={{
          position: 'relative',
          textAlign: 'center',
          pb: 2,
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.neutral.medium,
            zIndex: 1002,
            width: 40,
            height: 40,
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
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
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
                background: 'linear-gradient(45deg, #2196f3, #4caf50, #e91e63)',
                borderRadius: '50%',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChatBubbleOutlineOutlined sx={{ fontSize: '3rem', color: 'white' }} />
            </Box>
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
              💬
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
              ✨
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            fontWeight="600"
            color={theme.palette.neutral.dark}
            mb={1}
          >
            Make a comment
          </Typography>

          {/* Description */}
          <Typography
            variant="body1"
            color={theme.palette.neutral.medium}
            mb={2}
            maxWidth="280px"
          >
            Share your thoughts on this post.
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

export default CommentAuthModal;
