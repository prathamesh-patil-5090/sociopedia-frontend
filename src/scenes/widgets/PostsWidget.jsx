import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, CircularProgress } from "@mui/material";
import { setPosts } from "state";
import PostWidget from "./PostWidget";
import PostsService from "../../services/PostsService";

const PostsWidget = ({ userId, isProfile = false, isAuth = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PostsService.getPosts(token);
      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again.");
      dispatch(setPosts({ posts: [] }));
    } finally {
      setLoading(false);
    }
  };

  const getUserPosts = async () => {
    if (!token || !userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await PostsService.getUserPosts(userId, token);
      dispatch(setPosts({ posts: data }));
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setError("Failed to load user posts. Please try again.");
      dispatch(setPosts({ posts: [] }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
  }, [userId, isProfile, token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <Box textAlign="center" p={3}>
        <Typography variant="h6" color="textSecondary">
          {isProfile ? "No posts yet" : "No posts available"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {posts.map((post) => {
        if (!post?._id) return null;

        const {
          _id,
          userId: postUserId,
          firstName,
          lastName,
          description,
          location,
          picturePath,
          userPicturePath,
          likes,
          comments,
        } = post;

        return (
          <PostWidget
            key={_id}
            postId={_id}
            postUserId={postUserId}
            name={`${firstName || ""} ${lastName || ""}`.trim()}
            description={description || ""}
            location={location || ""}
            picturePath={picturePath}
            userPicturePath={userPicturePath}
            likes={likes || {}}
            comments={comments || []}
            isAuth={isAuth}
            isProfile={isProfile}
          />
        );
      })}
    </Box>
  );
};

export default PostsWidget;