import { useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Button,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Search,
  Menu,
  Close,
  DarkMode,
  LightMode,
  Person,
  Logout,
  Home,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "state";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";

const AuthButtons = ({ theme, navigate, isMobile = false }) => {
  return (
    <Box 
      display="flex" 
      gap={isMobile ? "1.5rem" : "1rem"}
      flexDirection={isMobile ? "column" : "row"}
      width={isMobile ? "100%" : "auto"}
      alignItems="center"
    >
      <Button
        variant="outlined"
        startIcon={<Person />}
        onClick={() => navigate("/login")}
        sx={{
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          padding: isMobile ? "0.75rem 1.5rem" : "0.5rem 1.5rem",
          borderRadius: "25px",
          width: isMobile ? "85%" : "auto",
          fontSize: isMobile ? "1rem" : "0.9rem",
          fontWeight: 500,
          textTransform: "none",
          border: `2px solid ${theme.palette.primary.main}`,
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.alt,
            transform: "translateY(-1px)",
            boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
            borderColor: theme.palette.primary.main,
          },
          transition: "all 0.3s ease",
        }}
      >
        Login
      </Button>
    </Box>
  );
};

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user) || {};
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const isAuth = Boolean(useSelector((state) => state.token));

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const background = theme.palette.background.default;
  const alt = theme.palette.background.alt;

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}` : '';

  return (
    <FlexBetween 
      padding={isNonMobileScreens ? "1rem 6%" : "0.75rem 4%"} 
      backgroundColor={alt}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: theme.palette.mode === "dark" 
          ? "0 2px 10px rgba(0,0,0,0.3)" 
          : "0 2px 10px rgba(0,0,0,0.1)",
        minHeight: isNonMobileScreens ? "auto" : "60px",
      }}
    >
      <FlexBetween gap={isNonMobileScreens ? "1.75rem" : "0.75rem"}>
        <Box display="flex" alignItems="center" gap={isNonMobileScreens ? "0.5rem" : "0.25rem"}>
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              padding: isNonMobileScreens ? "0.5rem" : "0.4rem",
              borderRadius: "12px",
              backgroundColor: theme.palette.mode === "dark" 
                ? "rgba(255,255,255,0.1)" 
                : theme.palette.primary.main,
              color: theme.palette.mode === "dark" 
                ? "#ffffff" 
                : theme.palette.background.alt,
              border: theme.palette.mode === "dark" 
                ? "1px solid rgba(255,255,255,0.2)" 
                : "none",
              "&:hover": {
                backgroundColor: theme.palette.mode === "dark" 
                  ? "rgba(255,255,255,0.2)" 
                  : theme.palette.primary.dark,
                transform: "scale(1.05)",
                boxShadow: theme.palette.mode === "dark" 
                  ? "0 0 15px rgba(255,255,255,0.3)" 
                  : "none",
              },
              transition: "all 0.2s ease",
            }}
          >
            <Home sx={{ fontSize: isNonMobileScreens ? "24px" : "20px" }} />
          </IconButton>
          <Typography
            fontWeight="bold"
            fontSize={isNonMobileScreens ? "clamp(1.2rem, 2rem, 2.25rem)" : "1.4rem"}
            onClick={() => navigate("/")}
            sx={{
              cursor: "pointer",
              color: theme.palette.mode === "dark" 
                ? "#ffffff" 
                : theme.palette.primary.main,
              textShadow: theme.palette.mode === "dark" 
                ? "0 0 15px rgba(255,255,255,0.3)"
                : `0 2px 4px ${theme.palette.primary.main}20`,
              "&:hover": {
                transform: "scale(1.02)",
                color: theme.palette.mode === "dark" 
                  ? theme.palette.primary.light 
                  : theme.palette.primary.dark,
                textShadow: theme.palette.mode === "dark" 
                  ? `0 0 20px ${theme.palette.primary.light}60`
                  : `0 3px 6px ${theme.palette.primary.main}30`,
              },
              transition: "all 0.3s ease",
            }}
          >
            Socipedia
          </Typography>
        </Box>
        {isNonMobileScreens && (
          <FlexBetween
            backgroundColor={neutralLight}
            borderRadius="25px"
            gap="1rem"
            padding="0.5rem 1.5rem"
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              "&:hover": {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
              },
              transition: "all 0.2s ease",
              minWidth: "250px",
            }}
          >
            <InputBase 
              placeholder="Search posts, people..." 
              sx={{
                flex: 1,
                "& input::placeholder": {
                  color: theme.palette.neutral.medium,
                  opacity: 0.8,
                },
              }}
            />
            <IconButton
              sx={{
                padding: "0.3rem",
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
        )}
      </FlexBetween>

      {/* DESKTOP NAV */}
      {isNonMobileScreens ? (
        <FlexBetween gap="1.5rem">
          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${theme.palette.mode === "dark" ? "light" : "dark"} mode`}>
            <IconButton
              onClick={() => dispatch(setMode())}
              sx={{
                backgroundColor: theme.palette.neutral.light,
                color: theme.palette.neutral.dark,
                padding: "0.5rem",
                "&:hover": {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.background.alt,
                  transform: "rotate(180deg)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {theme.palette.mode === "dark" ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {isAuth ? (
            <FlexBetween gap="1rem">
              {/* User Profile Section */}
              <Box display="flex" alignItems="center" gap="0.5rem">
                <Box
                  onClick={() => navigate(`/profile/${user._id}`)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                    transition: "transform 0.2s ease",
                  }}
                >
                  <UserImage image={user?.picturePath} size="35px" />
                </Box>
                <FormControl variant="standard" value={fullName}>
                  <Select
                    value={fullName}
                    sx={{
                      backgroundColor: neutralLight,
                      minWidth: "120px",
                      borderRadius: "20px",
                      padding: "0.25rem 1rem",
                      border: `1px solid ${theme.palette.divider}`,
                      "& .MuiSvgIcon-root": {
                        color: theme.palette.neutral.medium,
                      },
                      "& .MuiSelect-select:focus": {
                        backgroundColor: neutralLight,
                      },
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                      },
                      transition: "all 0.2s ease",
                    }}
                    input={<InputBase />}
                  >
                    <MenuItem 
                      value={fullName}
                      onClick={() => navigate(`/profile/${user._id}`)}
                      sx={{
                        "&:hover": {
                          backgroundColor: theme.palette.primary.main + "20",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap="0.5rem">
                        <Person fontSize="small" />
                        <Typography variant="body2">{fullName}</Typography>
                      </Box>
                    </MenuItem>
                    <Divider />
                    <MenuItem 
                      onClick={() => dispatch(setLogout())}
                      sx={{
                        color: theme.palette.error.main,
                        "&:hover": {
                          backgroundColor: theme.palette.error.main + "20",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap="0.5rem">
                        <Logout fontSize="small" />
                        <Typography variant="body2">Log Out</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </FlexBetween>
          ) : (
            <AuthButtons theme={theme} navigate={navigate} />
          )}
        </FlexBetween>
      ) : (
        <Box display="flex" alignItems="center" gap="0.25rem">
          {/* Theme Toggle for Mobile */}
          <IconButton
            onClick={() => dispatch(setMode())}
            sx={{
              backgroundColor: theme.palette.neutral.light,
              color: theme.palette.neutral.dark,
              padding: "0.6rem",
              minWidth: "44px",
              minHeight: "44px",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.alt,
              },
            }}
          >
            {theme.palette.mode === "dark" ? <LightMode sx={{ fontSize: "20px" }} /> : <DarkMode sx={{ fontSize: "20px" }} />}
          </IconButton>
          <IconButton
            onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            sx={{
              backgroundColor: theme.palette.neutral.light,
              color: theme.palette.neutral.dark,
              padding: "0.6rem",
              minWidth: "44px",
              minHeight: "44px",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.background.alt,
              },
            }}
          >
            <Menu sx={{ fontSize: "20px" }} />
          </IconButton>
        </Box>
      )}

      {/* MOBILE NAV */}
      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          top="0"
          height="100vh"
          zIndex="1000"
          width="100vw"
          maxWidth="350px"
          backgroundColor={background}
          sx={{
            backdropFilter: "blur(10px)",
            borderLeft: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.palette.mode === "dark" 
              ? "0 0 30px rgba(0,0,0,0.5)" 
              : "0 0 30px rgba(0,0,0,0.15)",
            overflowY: "auto",
          }}
        >
          {/* CLOSE ICON */}
          <Box 
            display="flex" 
            justifyContent="flex-end" 
            p="1rem"
            borderBottom={`1px solid ${theme.palette.divider}`}
          >
            <IconButton
              onClick={() => setIsMobileMenuToggled(false)}
              sx={{
                backgroundColor: theme.palette.neutral.light,
                padding: "0.75rem",
                minWidth: "44px",
                minHeight: "44px",
                "&:hover": {
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.background.alt,
                },
              }}
            >
              <Close sx={{ fontSize: "20px" }} />
            </IconButton>
          </Box>

          {/* MENU ITEMS */}
          <Box
            display="flex"
            flexDirection="column"
            gap="1.5rem"
            padding="2rem 1.5rem"
            height="calc(100vh - 100px)"
          >
            {/* Search Bar for Mobile */}
            <FlexBetween
              backgroundColor={neutralLight}
              borderRadius="25px"
              gap="1rem"
              padding="0.75rem 1.5rem"
              width="100%"
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                minHeight: "50px",
              }}
            >
              <InputBase 
                placeholder="Search posts, people..." 
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
                size="small"
                sx={{
                  padding: "0.5rem",
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main + "20",
                  },
                }}
              >
                <Search sx={{ fontSize: "18px" }} />
              </IconButton>
            </FlexBetween>

            {isAuth ? (
              <Box display="flex" flexDirection="column" gap="2rem" alignItems="center" mt="1rem">
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  gap="1rem"
                  onClick={() => {
                    navigate(`/profile/${user._id}`);
                    setIsMobileMenuToggled(false);
                  }}
                  sx={{
                    cursor: "pointer",
                    padding: "1rem",
                    borderRadius: "16px",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main + "10",
                      transform: "scale(1.02)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <UserImage image={user?.picturePath} size="60px" />
                  <Typography variant="h6" fontWeight="500" textAlign="center">
                    {fullName}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Logout />}
                  onClick={() => {
                    dispatch(setLogout());
                    setIsMobileMenuToggled(false);
                  }}
                  sx={{
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main,
                    padding: "1rem",
                    borderRadius: "25px",
                    fontSize: "1rem",
                    fontWeight: 500,
                    minHeight: "50px",
                    "&:hover": {
                      backgroundColor: theme.palette.error.main,
                      color: theme.palette.background.alt,
                    },
                  }}
                >
                  Log Out
                </Button>
              </Box>
            ) : (
              <Box mt="2rem">
                <AuthButtons theme={theme} navigate={navigate} isMobile={true} />
              </Box>
            )}
          </Box>
        </Box>
      )}
    </FlexBetween>
  );
};

export default Navbar;
