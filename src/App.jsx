import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import HomePage from "scenes/homePage";
import LoginPage from "scenes/loginPage";
import ProfilePage from "scenes/profilePage";
import ForgotPassword from "scenes/loginPage/ForgotPassword";
import Auth0Callback from "scenes/auth0Callback";
import { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import Footer from "components/Footer";
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
      <Auth0Provider
        domain={auth0Config.domain}
        clientId={auth0Config.clientId}
        authorizationParams={{
          redirect_uri: auth0Config.redirectUri,
          audience: auth0Config.audience,
          scope: auth0Config.scope
        }}
      >
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box display="flex" flexDirection="column" minHeight="100vh">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/callback" element={<Auth0Callback />} />
                <Route
                  path="/profile/:userId"
                  element={<ProfilePage />}
                />
              </Routes>
              <Footer />
            </Box>
          </ThemeProvider>
        </BrowserRouter>
      </Auth0Provider>
    </div>
  );
}

export default App;