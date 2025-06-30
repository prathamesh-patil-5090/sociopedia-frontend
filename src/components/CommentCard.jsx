import { useState } from "react";
import { Box, Typography, IconButton, InputBase, Button } from "@mui/material";
import { 
  EditOutlined, 
  DeleteOutlined, 
  FavoriteBorderOutlined, 
  FavoriteOutlined 
} from "@mui/icons-material";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";
import PostsService from "../services/PostsService";

const CommentCard = ({ 
  comment, 
  postId, 
  currentUserId,
  onUpdate, 
  onDelete,
  onLike,
  isOwner,
  token 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.comment);
  const [isLiked, setIsLiked] = useState(comment.likes?.[currentUserId] || false);
  const [likeCount, setLikeCount] = useState(comment.likes_count || Object.keys(comment.likes || {}).length);

  const handleUpdate = async () => {
    if (!comment._id) {
      console.error("Comment ID is missing");
      return;
    }
    
    await onUpdate(comment._id, editedText);
    setIsEditing(false);
  };

  const handleLike = async () => {
    try {
      const result = await PostsService.likeComment(comment._id, token);
      setIsLiked(result.liked);
      setLikeCount(result.likes_count);
      
      // Also notify parent component if needed
      if (onLike) {
        onLike(comment._id, result);
      }
    } catch (error) {
      console.error("Failed to like comment:", error);
    }
  };

  return (
    <Box p="1rem">
      <FlexBetween>
        <FlexBetween gap="1rem">
          <UserImage image={comment.user?.picturePath || comment.userPicturePath} size="45px" />
          <Box>
            <Typography variant="h6">
              {comment.user?.firstName || comment.firstName} {comment.user?.lastName || comment.lastName}
            </Typography>
            {isEditing ? (
              <Box>
                <InputBase
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  fullWidth
                />
                <Button onClick={handleUpdate}>Save</Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </Box>
            ) : (
              <Typography>{comment.comment}</Typography>
            )}
          </Box>
        </FlexBetween>
        <FlexBetween gap="0.5rem">
          {/* Like Button */}
          <Box display="flex" alignItems="center" gap="0.25rem">
            <IconButton onClick={handleLike} size="small">
              {isLiked ? (
                <FavoriteOutlined sx={{ color: "#ff3040", fontSize: "20px" }} />
              ) : (
                <FavoriteBorderOutlined sx={{ fontSize: "20px" }} />
              )}
            </IconButton>
            {likeCount > 0 && (
              <Typography variant="caption" color="textSecondary">
                {likeCount}
              </Typography>
            )}
          </Box>
          
          {/* Edit/Delete Buttons (only for owner) */}
          {isOwner && (
            <>
              <IconButton onClick={() => setIsEditing(!isEditing)} size="small">
                <EditOutlined />
              </IconButton>
              <IconButton onClick={() => onDelete(comment._id)} size="small">
                <DeleteOutlined />
              </IconButton>
            </>
          )}
        </FlexBetween>
      </FlexBetween>
    </Box>
  );
};

export default CommentCard;
