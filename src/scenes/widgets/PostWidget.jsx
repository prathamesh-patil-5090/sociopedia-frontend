import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  EditOutlined,
  DeleteOutlined,
  ImageNotSupported,
  ContentCopy,
  Facebook,
  Twitter,
  WhatsApp,
} from "@mui/icons-material";
import { 
  Box, Divider, IconButton, Typography, useTheme, InputBase, Button,
  Menu, MenuItem, ListItemIcon, ListItemText, Snackbar, Alert
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import AuthModal from "components/AuthModal";
import CommentAuthModal from "components/CommentAuthModal";
import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, setPosts } from "state";
import CommentCard from "components/CommentCard";
import PostsService from "../../services/PostsService";

const PostWidget = ({
  postId,
  postUserId,
  name,
  ...props
}) => {
  const [isComments, setIsComments] = useState(false);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(props.description);
  const [newPicture, setNewPicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState("");
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [authModalAction, setAuthModalAction] = useState('like');
  const [lastModalCloseTime, setLastModalCloseTime] = useState(0);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUser = useSelector((state) => state.user) || {};
  const loggedInUserId = loggedInUser?._id;
  const isLiked = Boolean(props.likes[loggedInUserId]);
  const likeCount = Object.keys(props.likes || {}).length;
  const posts = useSelector((state) => state.posts);
  const isDummyUser = loggedInUser?._id === "67b1d55da90d9304b1f869d5";

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const isOwner = useMemo(() => {
    if (!loggedInUserId || !postUserId) return false;
    // Handle both string and object postUserId
    const actualPostUserId = typeof postUserId === 'object' ? postUserId._id || postUserId.userId : postUserId;
    return String(loggedInUserId) === String(actualPostUserId);
  }, [loggedInUserId, postUserId]);

  const showPostActions = isOwner && props.isProfile; // Show edit/delete only for post owner AND on profile page

  // Add strict type checking for postUserId comparison
  const isOwnPost = useMemo(() => {
    if (!loggedInUserId || !postUserId) return false;
    return String(loggedInUserId) === String(postUserId);
  }, [loggedInUserId, postUserId]);

  // Get the actual ID whether postUserId is an object or string for the Friend component
  const actualPostUserId = useMemo(() => {
    return typeof postUserId === 'object' ? postUserId._id || postUserId.userId : postUserId;
  }, [postUserId]);

  const handleModalClose = () => {
    setShowAuthModal(false);
    // Clear any input focus by blurring active element
    if (document.activeElement) {
      document.activeElement.blur();
    }
  };

  const handleCommentModalClose = () => {
    setShowCommentModal(false);
    setLastModalCloseTime(Date.now());
    if (document.activeElement) {
      (document.activeElement).blur();
    }
  };

  const openCommentModal = () => {
    // Only show modal if user is not authenticated
    if (!token || !loggedInUserId) {
      if (Date.now() - lastModalCloseTime > 500) {
        setShowCommentModal(true);
      }
    }
  };

  const patchLike = async () => {
    // Prevent rapid clicking
    if (isLiking) return;
    
    // Check if user is authenticated
    if (!token || !loggedInUserId) {
      setAuthModalAction('like');
      setShowAuthModal(true);
      return;
    }

    setIsLiking(true);
    try {
      const result = await PostsService.likePost(postId, loggedInUserId, token);
      
      // Update the local post state based on the like result
      const currentPost = posts.find(post => post._id === postId);
      if (currentPost) {
        const updatedLikes = { ...currentPost.likes };
        
        if (result.liked) {
          // User liked the post
          updatedLikes[loggedInUserId] = true;
        } else {
          // User unliked the post
          delete updatedLikes[loggedInUserId];
        }
        
        const updatedPost = {
          ...currentPost,
          likes: updatedLikes
        };
        
        dispatch(setPost({ post: updatedPost }));
      }
    } catch (error) {
      console.error("Failed to like post:", error);
    } finally {
      // Add a small delay before allowing another like
      setTimeout(() => setIsLiking(false), 500);
    }
  };

  const addComment = async () => {
    // Check if user is authenticated
    if (!token || !loggedInUserId) {
      if (!showCommentModal) {
        setShowCommentModal(true);
      }
      return;
    }

    try {
      if (!comment.trim()) return;

      const commentData = {
        userId: loggedInUserId,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        userPicturePath: loggedInUser.picture_path || loggedInUser.picturePath,
        comment: comment.trim(),
        createdAt: new Date().toISOString()
      };

      // Call the API to create the comment
      const newComment = await PostsService.addComment(postId, commentData, token);
      
      // Update the local post state by adding the new comment
      const currentPost = posts.find(post => post._id === postId);
      if (currentPost) {
        const updatedPost = {
          ...currentPost,
          comments: [...(currentPost.comments || []), newComment]
        };
        dispatch(setPost({ post: updatedPost }));
      }
      
      setComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleDeletePost = async () => {
    if (!token || !isOwner) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      await PostsService.deletePost(postId, loggedInUserId, token);
      
      // Remove the deleted post from the local state
      const updatedPosts = posts.filter(post => post._id !== postId);
      dispatch(setPosts({ posts: updatedPosts }));
      
      console.log('Post deleted successfully');
    } catch (error) {
      console.error("Failed to delete post:", error);
      // Show user-friendly error message
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleUpdatePost = async () => {
    try {
      const updatedPost = await PostsService.updatePost(postId, { 
        description: editedDescription,
        userId: loggedInUserId 
      }, token);
      dispatch(setPost({ post: updatedPost }));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update post:", error);
    }
  };

  const handleUpdateComment = async (commentId, newText) => {
    try {
      await PostsService.updateComment(postId, commentId, { 
        comment: newText,
        userId: loggedInUserId 
      }, token);
      
      // Update the local post state by updating the specific comment
      const currentPost = posts.find(post => post._id === postId);
      if (currentPost) {
        const updatedComments = currentPost.comments.map(comment => 
          comment._id === commentId 
            ? { ...comment, comment: newText }
            : comment
        );
        const updatedPost = {
          ...currentPost,
          comments: updatedComments
        };
        dispatch(setPost({ post: updatedPost }));
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await PostsService.deleteComment(postId, commentId, token);
      
      // Update the local post state by removing the deleted comment
      const currentPost = posts.find(post => post._id === postId);
      if (currentPost) {
        const updatedComments = currentPost.comments.filter(comment => comment._id !== commentId);
        const updatedPost = {
          ...currentPost,
          comments: updatedComments
        };
        dispatch(setPost({ post: updatedPost }));
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // Add function to validate image file
  const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setImageError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return false;
    }

    if (file.size > maxSize) {
      setImageError("Image size must be less than 5MB");
      return false;
    }

    setImageError("");
    return true;
  };

  // Add function to handle picture selection with preview
  const handlePictureSelect = (file) => {
    if (file && validateImageFile(file)) {
      setNewPicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setShowPreview(true);
      };
      reader.readAsDataURL(file);
    } else {
      // Reset file input
      const fileInput = document.getElementById(`picture-upload-${postId}`);
      if (fileInput) fileInput.value = '';
    }
  };

  // Update the picture update function
  const handleUpdatePicture = async () => {
    if (!newPicture || !isOwner || !props.isProfile) return;
    
    try {
      const formData = new FormData();
      formData.append("picture", newPicture);
      formData.append("userId", loggedInUserId);

      const updatedPost = await PostsService.updatePostPicture(postId, formData, token);
      dispatch(setPost({ post: updatedPost }));
      
      // Reset preview state
      setShowPreview(false);
      setPreviewImage(null);
      setNewPicture(null);
    } catch (error) {
      console.error("Failed to update picture:", error);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setPreviewImage(null);
    setNewPicture(null);
    setImageError("");
    // Reset file input
    const fileInput = document.getElementById(`picture-upload-${postId}`);
    if (fileInput) fileInput.value = '';
  };

  const handleDeletePicture = async () => {
    if (!isOwner || !props.isProfile) return;
    
    try {
      const updatedPost = await PostsService.deletePostPicture(postId, loggedInUserId, token);
      dispatch(setPost({ post: updatedPost }));
    } catch (error) {
      console.error("Failed to delete picture:", error);
    }
  };

  const handleShareClick = (event) => {
    setShareAnchorEl(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
  };

  const getPostUrl = () => {
    return `${window.location.origin}/post/${postId}`;
  };

  const handleCopyLink = async () => {
    try {
      const postUrl = getPostUrl();
      await navigator.clipboard.writeText(postUrl);
      setShowCopySuccess(true);
      handleShareClose();
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleShareFacebook = () => {
    const postUrl = getPostUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    handleShareClose();
  };

  const handleShareTwitter = () => {
    const postUrl = getPostUrl();
    const text = `Check out this post by ${name}: ${props.description?.substring(0, 100)}${props.description?.length > 100 ? '...' : ''}`;
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    handleShareClose();
  };

  const handleShareWhatsApp = () => {
    const postUrl = getPostUrl();
    const text = `Check out this post by ${name}: ${props.description?.substring(0, 100)}${props.description?.length > 100 ? '...' : ''}\n${postUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    handleShareClose();
  };

  return (
    <WidgetWrapper m="2rem 0">
      <FlexBetween>
        <Friend
          friendId={actualPostUserId} // Pass the actual ID instead of the object
          name={name}
          subtitle={props.location}
          userPicturePath={props.userPicturePath || null} // Add null fallback
          isAuth={props.isAuth && !isOwnPost} // Prevent friend actions on own posts
          hideRequestActions={true} // Hide accept/decline buttons under posts
        />
        {showPostActions && (
          <FlexBetween gap="1rem">
            <IconButton 
              onClick={() => setIsEditing(!isEditing)}
              sx={{
                '&:hover': {
                  backgroundColor: palette.primary.light,
                  '& .MuiSvgIcon-root': { color: palette.primary.dark }
                }
              }}
            >
              <EditOutlined />
            </IconButton>
            <IconButton 
              onClick={handleDeletePost}
              sx={{
                '&:hover': {
                  backgroundColor: '#ff000022',
                  '& .MuiSvgIcon-root': { color: '#ff0000' }
                }
              }}
            >
              <DeleteOutlined />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>

      {isEditing ? (
        <Box>
          <InputBase
            fullWidth
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            sx={{
              backgroundColor: palette.neutral.light,
              borderRadius: "2rem",
              padding: "1rem 2rem",
              marginTop: "1rem",
            }}
          />
          <Button onClick={handleUpdatePost}>Save</Button>
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        </Box>
      ) : (
        <Typography color={main} sx={{ mt: "1rem" }}>
          {props.description}
        </Typography>
      )}
      {props.picturePath && !showPreview && (
        <Box position="relative">
          <img
            width="100%"
            height="auto"
            alt="post"
            style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
            src={PostsService.getImageUrl(props.picturePath)}
          />
          {isOwner && props.isProfile && (
            <Box
              position="absolute"
              top="1rem"
              right="1rem"
              display="flex"
              gap="0.5rem"
              sx={{ backgroundColor: "rgba(0,0,0,0.6)", borderRadius: "1rem", padding: "0.5rem" }}
            >
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                style={{ display: "none" }}
                id={`picture-upload-${postId}`}
                onChange={(e) => handlePictureSelect(e.target.files[0])}
              />
              <label htmlFor={`picture-upload-${postId}`}>
                <IconButton
                  component="span"
                  sx={{
                    color: "white",
                    "&:hover": { color: palette.primary.light }
                  }}
                >
                  <EditOutlined />
                </IconButton>
              </label>
              <IconButton
                onClick={handleDeletePicture}
                sx={{
                  color: "white",
                  "&:hover": { color: "#ff4444" }
                }}
              >
                <ImageNotSupported />
              </IconButton>
            </Box>
          )}
        </Box>
      )}

      {/* Image Preview Section */}
      {showPreview && previewImage && (
        <Box mt="0.75rem">
          <Typography variant="h6" mb="0.5rem">
            Preview New Image:
          </Typography>
          <Box position="relative">
            <img
              width="100%"
              height="auto"
              alt="preview"
              style={{ borderRadius: "0.75rem" }}
              src={previewImage}
            />
            <Box
              position="absolute"
              top="1rem"
              right="1rem"
              display="flex"
              gap="0.5rem"
            >
              <Button
                variant="contained"
                size="small"
                onClick={handleUpdatePicture}
                sx={{
                  backgroundColor: palette.primary.main,
                  "&:hover": { backgroundColor: palette.primary.dark }
                }}
              >
                Update
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancelPreview}
                sx={{
                  borderColor: palette.neutral.medium,
                  color: palette.neutral.dark,
                  "&:hover": { backgroundColor: palette.neutral.light }
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Show image error */}
      {imageError && (
        <Box mt="0.5rem">
          <Typography color="error" variant="body2">
            {imageError}
          </Typography>
        </Box>
      )}

      {/* Show current image if no preview */}
      {!props.picturePath && !showPreview && isOwner && props.isProfile && (
        <Box mt="0.75rem">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            style={{ display: "none" }}
            id={`picture-upload-${postId}`}
            onChange={(e) => handlePictureSelect(e.target.files[0])}
          />
          <label htmlFor={`picture-upload-${postId}`}>
            <Button
              component="span"
              variant="outlined"
              sx={{
                width: "100%",
                padding: "1rem",
                borderStyle: "dashed",
                "&:hover": { backgroundColor: palette.neutral.light }
              }}
            >
              Add Image (JPEG, PNG, GIF, WebP only)
            </Button>
          </label>
        </Box>
      )}

      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton 
              onClick={patchLike} 
              disabled={isLiking || (!props.isAuth || isDummyUser)}
              sx={{ 
                color: (!props.isAuth || isDummyUser) ? "gray" : "inherit",
                opacity: isLiking ? 0.6 : 1,
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "50%",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: isLiked ? 
                    `${primary}20` : 
                    `${palette.neutral.light}`,
                  transform: "scale(1.1)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              }}
            >
              {isLiked ? (
                <FavoriteOutlined 
                  sx={{ 
                    color: props.isAuth ? primary : "gray",
                    fontSize: "1.3rem",
                    filter: props.isAuth ? "drop-shadow(0 0 4px rgba(255,0,0,0.3))" : "none",
                  }} 
                />
              ) : (
                <FavoriteBorderOutlined 
                  sx={{ 
                    fontSize: "1.3rem",
                    "&:hover": {
                      color: primary,
                    },
                  }} 
                />
              )}
            </IconButton>
            <Typography 
              sx={{ 
                fontWeight: likeCount > 0 ? 600 : 400,
                color: likeCount > 0 ? primary : "inherit",
                transition: "all 0.3s ease",
              }}
            >
              {likeCount}
            </Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton 
              onClick={() => setIsComments(!isComments)}
              sx={{ 
                color: "inherit",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "50%",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: palette.neutral.light,
                  transform: "scale(1.1)",
                  color: primary,
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
              }}
            >
              <ChatBubbleOutlineOutlined sx={{ fontSize: "1.3rem" }} />
            </IconButton>
            <Typography 
              sx={{ 
                fontWeight: props.comments.length > 0 ? 600 : 400,
                color: props.comments.length > 0 ? primary : "inherit",
                transition: "all 0.3s ease",
              }}
            >
              {props.comments.length}
            </Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton 
          onClick={handleShareClick}
          sx={{
            padding: "0.5rem",
            borderRadius: "50%",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: palette.neutral.light,
              transform: "scale(1.1)",
              color: primary,
            },
            "&:active": {
              transform: "scale(0.95)",
            },
          }}
        >
          <ShareOutlined sx={{ fontSize: "1.3rem" }} />
        </IconButton>
        
        <Menu
          anchorEl={shareAnchorEl}
          open={Boolean(shareAnchorEl)}
          onClose={handleShareClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleCopyLink}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Copy Link" />
          </MenuItem>
          <MenuItem onClick={handleShareFacebook}>
            <ListItemIcon>
              <Facebook fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Share on Facebook" />
          </MenuItem>
          <MenuItem onClick={handleShareTwitter}>
            <ListItemIcon>
              <Twitter fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Share on Twitter" />
          </MenuItem>
          <MenuItem onClick={handleShareWhatsApp}>
            <ListItemIcon>
              <WhatsApp fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Share on WhatsApp" />
          </MenuItem>
        </Menu>

        <Snackbar
          open={showCopySuccess}
          autoHideDuration={3000}
          onClose={() => setShowCopySuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowCopySuccess(false)} 
            severity="success" 
            sx={{ width: '100%' }}
          >
            Link copied to clipboard!
          </Alert>
        </Snackbar>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          <InputBase
            placeholder={token && loggedInUserId ? "Write a comment..." : "Log in to write a comment..."}
            value={comment}
            onChange={(e) => {
              if (!token || !loggedInUserId) {
                openCommentModal();
                return;
              }
              setComment(e.target.value);
            }}
            onFocus={(e) => {
              if (!token || !loggedInUserId) {
                openCommentModal();
              }
            }}
            onClick={(e) => {
              if (!token || !loggedInUserId) {
                openCommentModal();
              }
            }}
            sx={{
              width: "100%",
              backgroundColor: palette.neutral.light,
              borderRadius: "2rem",
              padding: "0.5rem 2rem",
              marginBottom: "1rem",
              cursor: token && loggedInUserId ? "text" : "pointer",
            }}
          />
          {token && loggedInUserId && (
            <Button
              disabled={!comment}
              onClick={addComment}
              sx={{
                color: !comment ? palette.neutral.medium : palette.background.alt,
                backgroundColor: !comment ? palette.neutral.light : palette.primary.main,
                borderRadius: "3rem",
                marginBottom: "1rem",
              padding: "0.5rem 1.5rem",
              fontWeight: "bold",
              textTransform: "none",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: !comment ? palette.neutral.light : palette.primary.dark,
                color: !comment ? palette.neutral.medium : palette.background.alt,
                transform: comment ? "translateY(-2px)" : "none",
                boxShadow: comment ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
              },
              "&:disabled": {
                backgroundColor: palette.neutral.light,
                color: palette.neutral.medium,
                cursor: "not-allowed",
                opacity: 0.6,
              },
              "&:active": {
                transform: comment ? "translateY(0)" : "none",
              }
            }}
          >
            Post Comment
          </Button>
          )}
          {Array.isArray(props.comments) && props.comments.map((comment, index) => (
            <Box key={comment._id || `temp-comment-${index}`}>
              <Divider />
              <CommentCard 
                comment={comment}
                postId={postId}
                currentUserId={loggedInUserId}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
                onLike={(commentId, result) => {
                  // You can add additional logic here if needed
                  console.log(`Comment ${commentId} like status:`, result);
                }}
                isOwner={
                  (comment.user?._id && comment.user._id === loggedInUserId) ||
                  (comment.user?.id && comment.user.id === loggedInUserId) ||
                  (comment.userId && comment.userId === loggedInUserId)
                }
                token={token}
              />
            </Box>
          ))}
          <Divider />
        </Box>
      )}

      {/* Authentication Modal */}
      <AuthModal
        open={showAuthModal}
        onClose={handleModalClose}
        action={authModalAction}
      />

      {/* Comment Authentication Modal */}
      <CommentAuthModal
        open={showCommentModal}
        onClose={handleCommentModalClose}
      />
    </WidgetWrapper>
  );
};

export default PostWidget;