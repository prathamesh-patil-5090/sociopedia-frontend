import {
  EditOutlined,
  DeleteOutlined,
  ImageOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Dropzone from "react-dropzone";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostsService from "../../services/PostsService";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const [post, setPost] = useState("");
  const theme = useTheme();
  const { palette } = theme;
  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const posts = useSelector((state) => state.posts); // Get current posts
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const mediumMain = palette.neutral.mediumMain;
  const medium = palette.neutral.medium;

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

  const handleImageSelect = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && validateImageFile(file)) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setImageError("");
  };

  const handlePost = async () => {
    try {
      const formData = new FormData();
      formData.append("userId", _id);
      formData.append("description", post);
      if (image) {
        formData.append("picture", image);
        formData.append("picturePath", image.name);
      }

      const newPost = await PostsService.createPost(formData, token);
      
      // Add the new post to the beginning of the existing posts array
      const updatedPosts = [newPost, ...posts];
      dispatch(setPosts({ posts: updatedPosts }));
      
      setImage(null);
      setImagePreview(null);
      setPost("");
      setIsImage(false);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <WidgetWrapper>
      <FlexBetween gap="1.5rem">
        <UserImage image={picturePath} />
        <InputBase
          placeholder="What's on your mind..."
          onChange={(e) => setPost(e.target.value)}
          value={post}
          sx={{
            width: "100%",
            backgroundColor: palette.neutral.light,
            borderRadius: "2rem",
            padding: "1rem 2rem",
          }}
        />
      </FlexBetween>
      {isImage && (
        <Box
          border={`1px solid ${medium}`}
          borderRadius="5px"
          mt="1rem"
          p="1rem"
        >
          <Dropzone
            accept={{
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
              'image/gif': ['.gif'],
              'image/webp': ['.webp']
            }}
            multiple={false}
            onDrop={handleImageSelect}
          >
            {({ getRootProps, getInputProps }) => (
              <FlexBetween>
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${theme.palette.mode === "dark" ? "#66b3ff" : palette.primary.main}`}
                  p="1rem"
                  width="100%"
                  sx={{ "&:hover": { cursor: "pointer" } }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <Typography textAlign="center" color={mediumMain}>
                      Drop an image here or click to select
                      <br />
                      (JPEG, PNG, GIF, WebP only)
                    </Typography>
                  ) : (
                    <FlexBetween>
                      <Typography>{image.name}</Typography>
                      <EditOutlined />
                    </FlexBetween>
                  )}
                </Box>
                {image && (
                  <IconButton
                    onClick={removeImage}
                    sx={{ width: "15%" }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                )}
              </FlexBetween>
            )}
          </Dropzone>
          
          {imageError && (
            <Typography color="error" variant="body2" mt="0.5rem">
              {imageError}
            </Typography>
          )}

          {imagePreview && (
            <Box mt="1rem">
              <Typography variant="subtitle2" mb="0.5rem">
                Image Preview:
              </Typography>
              <Box
                component="img"
                src={imagePreview}
                alt="Preview"
                sx={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                  borderRadius: "0.5rem",
                  border: `1px solid ${medium}`
                }}
              />
            </Box>
          )}
        </Box>
      )}

      <Divider sx={{ margin: "1.25rem 0" }} />

      <FlexBetween>
        <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)}>
          <ImageOutlined sx={{ color: mediumMain }} />
          <Typography
            color={mediumMain}
            sx={{ "&:hover": { cursor: "pointer", color: medium } }}
          >
            Image
          </Typography>
        </FlexBetween>

        <Button
          disabled={!post}
          onClick={handlePost}
          className={`
            ${!post 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:-translate-y-0.5 hover:shadow-lg'
            } 
            rounded-full font-bold px-8 py-2 transition-all duration-300 transform 
            ${post ? 'hover:scale-105' : ''}
          `}
          sx={{
            textTransform: 'none',
            minWidth: 'auto',
            color: post ? (palette.mode === 'dark' ? 'white' : 'black') : undefined,
          }}
        >
          POST
        </Button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default MyPostWidget;
