import { Box } from "@mui/material";
import DefaultAvatar from "./DefaultAvatar";
import { useState } from "react";
import PostsService from "../services/PostsService";

const UserImage = ({ image, size = "60px" }) => {
  const [imageError, setImageError] = useState(false);

  if (!image || imageError) {
    return (
      <Box width={size} height={size} display="flex" alignItems="center" justifyContent="center">
        <DefaultAvatar 
          size={size} 
          sx={{ 
            width: size, 
            height: size,
            padding: "0px",
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.3s ease'
            }
          }} 
        />
      </Box>
    );
  }

  return (
    <Box width={size} height={size}>
      <img
        style={{ 
          objectFit: "cover", 
          borderRadius: "50%",
          width: size,
          height: size
        }}
        alt="user"
        src={PostsService.getImageUrl(image)}
        onError={() => setImageError(true)}
      />
    </Box>
  );
};

export default UserImage;
