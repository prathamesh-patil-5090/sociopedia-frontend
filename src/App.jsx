import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import HomePage from "scenes/homePage";
import LoginPage from "scenes/loginPage";
import ProfilePage from "scenes/profilePage";
import ForgotPassword from "scenes/loginPage/ForgotPassword";
import { useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import Footer from "components/Footer";
import { Box } from "@mui/material";
import { setLogin } from "state";
import LoginService from "./services/LoginService";

function App() {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const loginDummyUser = async () => {
      if (!isAuth && !user) {
        try {
          const data = await LoginService.login({
            usernameOrEmail: "dummy@gmail.com",
            password: "dummy@gmail.com", // replace with actual dummy account password
          });
          
          dispatch(setLogin({
            user: data.user,
            token: null // Keep token null to maintain restricted access
          }));
        } catch (error) {
          console.error("Error logging in dummy user:", error);
        }
      }
    };

    loginDummyUser();
  }, [dispatch, isAuth, user]);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box display="flex" flexDirection="column" minHeight="100vh">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/profile/:userId"
                element={isAuth ? <ProfilePage /> : <Navigate to="/login" />}
              />
            </Routes>
            <Footer />
          </Box>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;