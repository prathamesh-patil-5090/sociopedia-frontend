import { useState, useEffect } from "react";
import { Box, Typography, useTheme, useMediaQuery, InputBase, IconButton, Divider } from "@mui/material";
import { Search } from "@mui/icons-material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import PostWidget from "scenes/widgets/PostWidget";
import UserCard from "components/UserCard";
import FlexBetween from "components/FlexBetween";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (query) => {
    if (!query.trim() || !token) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      // Search for posts
      const postsResponse = await fetch(`${import.meta.env.VITE_API_URL}/posts/search/?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Search for users
      const usersResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/search/?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setPosts(postsData.posts || []);
      }
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const currentQuery = searchParams.get("q");

  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        paddingBottom={isNonMobileScreens ? "2rem" : "6rem"} // Extra padding for mobile footer
        display="flex"
        flexDirection="column"
        gap="1.5rem"
      >
        {/* Search Header */}
        <Box>
          <Typography variant="h4" fontWeight="500" mb="1rem">
            Search Results
          </Typography>
          
          {/* Search Bar */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{ display: "flex", alignItems: "center", maxWidth: "600px" }}
          >
            <FlexBetween
              backgroundColor={theme.palette.background.alt}
              borderRadius="25px"
              gap="1rem"
              padding="0.75rem 1.5rem"
              width="100%"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
                },
                transition: "all 0.2s ease",
              }}
            >
              <InputBase
                placeholder="Search posts, people..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                sx={{
                  flex: 1,
                  fontSize: "1rem",
                  "& input::placeholder": {
                    color: theme.palette.neutral.medium,
                    opacity: 0.8,
                  },
                }}
              />
              <IconButton
                type="submit"
                sx={{
                  padding: "0.5rem",
                  color: theme.palette.neutral.medium,
                  "&:hover": {
                    color: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.main + "20",
                  },
                }}
              >
                <Search />
              </IconButton>
            </FlexBetween>
          </Box>
        </Box>

        {/* Search Results */}
        {loading && (
          <Typography variant="body1" color="text.secondary">
            Searching...
          </Typography>
        )}

        {hasSearched && !loading && (
          <Box>
            {currentQuery && (
              <Typography variant="h6" mb="1rem" color="text.secondary">
                Results for "{currentQuery}"
              </Typography>
            )}

            {/* Users Section */}
            {users.length > 0 && (
              <Box mb="2rem">
                <Typography variant="h6" mb="1rem" color="primary">
                  People
                </Typography>
                <Box display="flex" flexDirection="column" gap="1rem">
                  {users.map((searchUser) => (
                    <UserCard
                      key={searchUser._id}
                      user={searchUser}
                      showAddFriend={true}
                    />
                  ))}
                </Box>
                <Divider sx={{ my: "2rem" }} />
              </Box>
            )}

            {/* Posts Section */}
            {posts.length > 0 && (
              <Box>
                <Typography variant="h6" mb="1rem" color="primary">
                  Posts
                </Typography>
                <Box display="flex" flexDirection="column" gap="1rem">
                  {posts.map((post) => (
                    <PostWidget
                      key={post._id}
                      postId={post._id}
                      postUserId={post.userId}
                      name={`${post.firstName} ${post.lastName}`}
                      description={post.description}
                      location={post.location}
                      picturePath={post.picturePath}
                      userPicturePath={post.user?.picture_path || post.userPicturePath}
                      likes={post.likes}
                      comments={post.comments}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* No Results */}
            {users.length === 0 && posts.length === 0 && currentQuery && (
              <Box textAlign="center" py="3rem">
                <Typography variant="h6" color="text.secondary" mb="1rem">
                  No results found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try searching with different keywords or check your spelling.
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Initial State */}
        {!hasSearched && (
          <Box textAlign="center" py="3rem">
            <Typography variant="h6" color="text.secondary" mb="1rem">
              Start searching
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter a search term to find posts and people.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchPage;
