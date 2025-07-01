import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  useMediaQuery,
  Typography,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import Dropzone from "react-dropzone";
import FlexBetween from "components/FlexBetween";
import RegisterService from "../../services/RegisterService";
import LoginService from "../../services/LoginService";

const registerSchema = yup.object().shape({
  firstName: yup.string().required("First name is required").min(2, "Too short").max(50, "Too long"),
  lastName: yup.string().required("Last name is required").min(2, "Too short").max(50, "Too long"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  username: yup.string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username too long")
    .matches(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  picture: yup
    .mixed()
    .required("Profile picture is required")
    .test("fileSize", "File too large (max 5MB)", (value) => !value || value.size <= 5 * 1024 * 1024)
    .test("fileFormat", "Only JPEG, PNG files allowed", (value) =>
      !value || ["image/jpg", "image/jpeg", "image/png"].includes(value.type)
    ),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const loginSchema = yup.object().shape({
  usernameOrEmail: yup.string()
    .required("Username or Email is required")
    .min(3, "Too short"),
  password: yup.string().required("Password is required"),
});

const initialValuesRegister = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  picture: null,
  username: "",
  confirmPassword: "",
};

const initialValuesLogin = {
  usernameOrEmail: "",
  password: "",
};

const Form = () => {
  const [pageType, setPageType] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const { palette } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const isLogin = pageType === "login";
  const isRegister = pageType === "register";

  // Check for signup URL parameter on component mount
  useEffect(() => {
    const signupParam = searchParams.get('signup');
    if (signupParam === 'true') {
      setPageType('register');
    }
  }, [searchParams]);

  const validateImageFile = (file) => {
    return RegisterService.validateImageFile(file);
  };

  const handleImageSelect = (file, setFieldValue) => {
    if (file) {
      const error = validateImageFile(file);
      if (error) {
        setSubmitError(error);
        setImagePreview(null);
        return;
      }
      setFieldValue("picture", file);
      setSubmitError("");
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const register = async (values, onSubmitProps) => {
    setIsLoading(true);
    setSubmitError("");
    setSubmitSuccess("");
    
    try {
      // Validate image
      if (values.picture) {
        const imageError = validateImageFile(values.picture);
        if (imageError) {
          throw new Error(imageError);
        }
      }

      const formData = RegisterService.createFormData(values);
      
      // Debug: Log form data contents
      console.log("Form values:", values);
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      await RegisterService.register(formData);

      setSubmitSuccess("Registration successful! Please login with your credentials.");
      onSubmitProps.resetForm();
      setTimeout(() => {
        setPageType("login");
        setSubmitSuccess("");
      }, 2000);

    } catch (error) {
      console.error("Registration error:", error);
      setSubmitError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (values, onSubmitProps) => {
    setIsLoading(true);
    setSubmitError("");
    
    try {
      const data = await LoginService.login({
        usernameOrEmail: values.usernameOrEmail,
        password: values.password,
      });

      onSubmitProps.resetForm();
      dispatch(setLogin({
        user: data.user,
        token: data.token,
      }));
      navigate("/");
      
    } catch (error) {
      console.error("Login error:", error);
      setSubmitError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (values, onSubmitProps) => {
    if (isLogin) await login(values, onSubmitProps);
    if (isRegister) await register(values, onSubmitProps);
  };

  const handlePageTypeChange = (resetForm) => {
    setPageType(isLogin ? "register" : "login");
    setSubmitError("");
    setSubmitSuccess("");
    setImagePreview(null);
    resetForm();
  };

  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
      validationSchema={isLogin ? loginSchema : registerSchema}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
        resetForm,
        isSubmitting,
      }) => (
        <form onSubmit={handleSubmit}>
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

          <Box
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            sx={{
              "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
            }}
          >
            {isRegister && (
              <>
                <TextField
                  label="First Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.firstName}
                  name="firstName"
                  error={Boolean(touched.firstName) && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  sx={{ gridColumn: "span 2" }}
                  disabled={isLoading}
                />
                <TextField
                  label="Last Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.lastName}
                  name="lastName"
                  error={Boolean(touched.lastName) && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  sx={{ gridColumn: "span 2" }}
                  disabled={isLoading}
                />
                <TextField
                  label="Username"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.username}
                  name="username"
                  error={Boolean(touched.username) && Boolean(errors.username)}
                  helperText={touched.username && errors.username}
                  sx={{ gridColumn: "span 4" }}
                  disabled={isLoading}
                />
                <TextField
                  label="Email"
                  type="email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.email}
                  name="email"
                  error={Boolean(touched.email) && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  sx={{ gridColumn: "span 4" }}
                  disabled={isLoading}
                />
                <Box
                  gridColumn="span 4"
                  border={`1px solid ${palette.neutral.medium}`}
                  borderRadius="5px"
                  p="1rem"
                >
                  <Dropzone
                    accept={{
                      'image/jpeg': ['.jpg', '.jpeg'],
                      'image/png': ['.png']
                    }}
                    multiple={false}
                    disabled={isLoading}
                    onDrop={(acceptedFiles) => {
                      const file = acceptedFiles[0];
                      handleImageSelect(file, setFieldValue);
                    }}
                  >
                    {({ getRootProps, getInputProps, isDragActive }) => (
                      <Box
                        {...getRootProps()}
                        border={`2px dashed ${isDragActive ? palette.primary.light : palette.primary.main}`}
                        p="1rem"
                        sx={{ 
                          "&:hover": { cursor: isLoading ? "not-allowed" : "pointer" },
                          backgroundColor: isDragActive ? palette.primary.light + "10" : "transparent"
                        }}
                      >
                        <input {...getInputProps()} />
                        {!values.picture ? (
                          <Typography textAlign="center" color={palette.neutral.medium}>
                            {isDragActive ? "Drop image here..." : "Drag & drop an image here, or click to select"}
                            <br />
                            <Typography variant="caption">
                              Supported: JPEG, PNG (max 5MB)
                            </Typography>
                          </Typography>
                        ) : (
                          <FlexBetween>
                            <Typography>{values.picture.name}</Typography>
                            <EditOutlinedIcon />
                          </FlexBetween>
                        )}
                      </Box>
                    )}
                  </Dropzone>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <Box mt="1rem">
                      <Typography variant="subtitle2" mb="0.5rem">
                        Preview:
                      </Typography>
                      <Box
                        component="img"
                        src={imagePreview}
                        alt="Preview"
                        sx={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: `2px solid ${palette.primary.main}`
                        }}
                      />
                    </Box>
                  )}
                  
                  {errors.picture && touched.picture && (
                    <Typography color="error" variant="caption" mt={1}>
                      {errors.picture}
                    </Typography>
                  )}
                </Box>
                <TextField
                  label="Password"
                  type="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password}
                  name="password"
                  error={Boolean(touched.password) && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  sx={{ gridColumn: "span 2" }}
                  disabled={isLoading}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.confirmPassword}
                  name="confirmPassword"
                  error={Boolean(touched.confirmPassword) && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  sx={{ gridColumn: "span 2" }}
                  disabled={isLoading}
                />
              </>
            )}

            {isLogin && (
              <>
                <TextField
                  label="Username or Email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.usernameOrEmail}
                  name="usernameOrEmail"
                  error={Boolean(touched.usernameOrEmail) && Boolean(errors.usernameOrEmail)}
                  helperText={touched.usernameOrEmail && errors.usernameOrEmail}
                  sx={{ gridColumn: "span 4" }}
                  disabled={isLoading}
                />
                <TextField
                  label="Password"
                  type="password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password}
                  name="password"
                  error={Boolean(touched.password) && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  sx={{ gridColumn: "span 4" }}
                  disabled={isLoading}
                />
              </>
            )}
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
                color: palette.background.alt,
                "&:hover": { 
                  backgroundColor: palette.primary.dark,
                  color: palette.background.alt 
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
                isLogin ? "LOGIN" : "REGISTER"
              )}
            </Button>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Typography
                onClick={() => !isLoading && handlePageTypeChange(resetForm)}
                sx={{
                  textDecoration: "underline",
                  color: isLoading ? palette.neutral.medium : palette.primary.main,
                  "&:hover": {
                    cursor: isLoading ? "not-allowed" : "pointer",
                    color: isLoading ? palette.neutral.medium : palette.primary.light,
                  },
                }}
              >
                {isLogin
                  ? "Don't have an account? Sign Up here."
                  : "Already have an account? Login here."}
              </Typography>
              
              {isLogin && (
                <Typography
                  onClick={() => !isLoading && navigate("/forgot-password")}
                  sx={{
                    textDecoration: "underline",
                    color: isLoading ? palette.neutral.medium : palette.primary.main,
                    "&:hover": {
                      cursor: isLoading ? "not-allowed" : "pointer",
                      color: isLoading ? palette.neutral.medium : palette.primary.light,
                    },
                  }}
                >
                  Forgot Password?
                </Typography>
              )}
            </Box>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default Form;