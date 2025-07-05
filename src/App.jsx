import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import HomePage from "scenes/homePage";
import LoginPage from "scenes/loginPage";
import ProfilePage from "scenes/profilePage";
import SearchPage from "scenes/searchPage";
import FriendsPage from "scenes/friendsPage";
import MessagesPage from "scenes/messagesPage";
import ForgotPassword from "scenes/loginPage/ForgotPassword";
import Auth0Callback from "scenes/auth0Callback";
import Auth0TestPage from "scenes/auth0Test";
import Auth0ProfilePage from "scenes/auth0ProfilePage";
import { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import Footer from "components/Footer";
import MobileFooter from "components/MobileFooter";
import { Box } from "@mui/material";
import { setLogout } from "state";
import { Auth0Provider } from "@auth0/auth0-react";
import auth0Config from "./config/auth0Config.js";

function App() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));
  const token = useSelector((state) => state.token);

  // Clear any persisted invalid state on app load
  useEffect(() => {
    // If there's an invalid token, clear the state
    if (token && (typeof token !== 'string' || token.trim() === '' || token === 'null' || token === 'undefined')) {
      dispatch(setLogout());
    }
  }, [token, dispatch]);

  return (
    <div className="app">
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box display="flex" flexDirection="column" minHeight="100vh">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/friends" element={<FriendsPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:chatId" element={<MessagesPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/callback" element={<Auth0Callback />} />
                <Route path="/auth0-test" element={<Auth0TestPage />} />
                <Route path="/auth0-profile" element={<Auth0ProfilePage />} />
                <Route
                  path="/profile/:userId"
                  element={<ProfilePage />}
                />
              </Routes>
              <Footer />
              <MobileFooter />
            </Box>
          </ThemeProvider>
        </BrowserRouter>
    </div>
  );
}

export default App;