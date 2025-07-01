import { useEffect, useState, useCallback, useRef } from "react";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const getPosts = async (page = 1, reset = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await PostsService.getPosts(token, page, 10);
      const { posts: newPosts, pagination: paginationInfo } = response;

      if (reset || page === 1) {
        dispatch(setPosts({ posts: newPosts }));
      } else {
        // Append new posts to existing ones
        const currentPosts = Array.isArray(posts) ? posts : [];
        const updatedPosts = [...currentPosts, ...newPosts];
        dispatch(setPosts({ posts: updatedPosts }));
      }

      setPagination(paginationInfo);
      setHasMore(paginationInfo ? paginationInfo.hasNextPage : false);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Failed to load posts. Please try again.");
      if (reset || page === 1) {
        dispatch(setPosts({ posts: [] }));
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getUserPosts = async (page = 1, reset = false) => {
    if (!userId) return;
    
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const response = await PostsService.getUserPosts(userId, token, page, 10);
      const { posts: newPosts, pagination: paginationInfo } = response;

      if (reset || page === 1) {
        dispatch(setPosts({ posts: newPosts }));
      } else {
        // Append new posts to existing ones
        const currentPosts = Array.isArray(posts) ? posts : [];
        const updatedPosts = [...currentPosts, ...newPosts];
        dispatch(setPosts({ posts: updatedPosts }));
      }

      setPagination(paginationInfo);
      setHasMore(paginationInfo ? paginationInfo.hasNextPage : false);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setError("Failed to load user posts. Please try again.");
      if (reset || page === 1) {
        dispatch(setPosts({ posts: [] }));
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      if (isProfile) {
        getUserPosts(nextPage, false);
      } else {
        getPosts(nextPage, false);
      }
    }
  }, [loadingMore, hasMore, currentPage, isProfile, userId, token]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore, loadMorePosts]
  );

  useEffect(() => {
    // Reset state when switching between profile/feed or user changes
    setCurrentPage(1);
    setHasMore(true);
    setPagination(null);
    
    if (isProfile) {
      getUserPosts(1, true);
    } else {
      getPosts(1, true);
    }
  }, [userId, isProfile, token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && (!Array.isArray(posts) || posts.length === 0)) {
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
      {posts.map((post, index) => {
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

        const isLastPost = index === posts.length - 1;

        return (
          <Box
            key={_id}
            ref={isLastPost ? lastPostElementRef : null}
          >
            <PostWidget
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
          </Box>
        );
      })}
      
      {/* Loading indicator for infinite scroll */}
      {loadingMore && (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress size={30} />
        </Box>
      )}
      
      {/* End of posts indicator */}
      {!hasMore && posts.length > 0 && (
        <Box textAlign="center" p={2}>
          <Typography variant="body2" color="textSecondary">
            No more posts to load
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PostsWidget;