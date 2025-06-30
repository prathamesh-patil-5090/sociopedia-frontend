import { 
  Box, Button, TextField, Typography, useTheme, useMediaQuery, 
  Alert, CircularProgress 
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ForgotPasswordService from "../../services/ForgotPasswordService";

const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
  newPassword: yup.string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  confirmPassword: yup.string()
    .required("Please confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords must match"),
});

const ForgotPassword = () => {
  const { palette } = useTheme();
  const navigate = useNavigate();
  const theme = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const handleSubmit = async (values, onSubmitProps) => {
    setIsLoading(true);
    setSubmitError("");
    setSubmitSuccess("");
    
    try {
      await ForgotPasswordService.resetPassword(values.email, values.newPassword);
      
      setSubmitSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Reset error:", error);
      setSubmitError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Box
        width="100%"
        backgroundColor={theme.palette.background.alt}
        p="1rem 6%"
        textAlign="center"
      >
        <Typography 
          fontWeight="bold" 
          fontSize="32px" 
          color="primary"
          onClick={() => navigate("/")}
          sx={{ 
            cursor: "pointer",
            "&:hover": { color: palette.primary.light }
          }}
        >
          Socipedia
        </Typography>
      </Box>

      <Box
        width={isNonMobileScreens ? "50%" : "93%"}
        p="2rem"
        m="2rem auto"
        borderRadius="1.5rem"
        backgroundColor={theme.palette.background.alt}
        boxShadow="0 4px 20px rgba(0,0,0,0.1)"
      >
        <Typography fontWeight="500" variant="h5" sx={{ mb: "1rem" }}>
          Reset Your Password
        </Typography>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: "1.5rem" }}>
          Enter your email and create a new password to reset your account.
        </Typography>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
        
        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {submitSuccess}
          </Alert>
        )}

        <Formik
          initialValues={{ email: "", newPassword: "", confirmPassword: "" }}
          validationSchema={forgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit}>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: "span 4" },
                }}
              >
                <TextField
                  label="Email Address"
                  type="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.email}
                  name="email"
                  error={Boolean(touched.email) && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  sx={{ gridColumn: "span 4" }}
                  disabled={isLoading}
                  placeholder="Enter your registered email"
                />
                <TextField
                  label="New Password"
                  type="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.newPassword}
                  name="newPassword"
                  error={Boolean(touched.newPassword) && Boolean(errors.newPassword)}
                  helperText={touched.newPassword && errors.newPassword}
                  sx={{ gridColumn: "span 4" }}
                  disabled={isLoading}
                  placeholder="Enter your new password"
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.confirmPassword}
                  name="confirmPassword"
                  error={Boolean(touched.confirmPassword) && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  sx={{ gridColumn: "span 4" }}
                  disabled={isLoading}
                  placeholder="Confirm your new password"
                />
              </Box>

              <Box>
                <Button
                  fullWidth
                  type="submit"
                  disabled={isLoading || isSubmitting}
                  sx={{
                    m: "2rem 0",
                    p: "1rem",
                    backgroundColor: palette.primary.main,
                    color: "white",
                    "&:hover": { 
                      backgroundColor: palette.primary.dark,
                      color: "white"
                    },
                    "&:disabled": {
                      backgroundColor: palette.neutral.light,
                      color: palette.neutral.medium
                    },
                    position: "relative"
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} sx={{ color: palette.neutral.medium }} />
                  ) : (
                    "Reset Password"
                  )}
                </Button>
                
                <Typography
                  onClick={() => !isLoading && navigate("/")}
                  sx={{
                    textDecoration: "underline",
                    color: isLoading ? palette.neutral.medium : palette.primary.main,
                    "&:hover": {
                      cursor: isLoading ? "not-allowed" : "pointer",
                      color: isLoading ? palette.neutral.medium : palette.primary.light,
                    },
                    textAlign: "center",
                  }}
                >
                  Back to Login
                </Typography>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default ForgotPassword;