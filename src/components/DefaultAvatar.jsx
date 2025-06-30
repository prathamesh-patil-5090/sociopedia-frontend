import { SvgIcon } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const DefaultAvatar = ({ size = "40px", ...props }) => {
  const theme = useTheme();
  const bgColor = theme.palette.mode === "dark" ? "#424242" : "#e0e0e0";
  const iconColor = theme.palette.mode === "dark" ? "#fafafa" : "#424242";

  return (
    <SvgIcon
      viewBox="0 0 36 36"
      sx={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        borderRadius: '50%',
        padding: '4px',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.background.alt,
        },
      }}
      {...props}
    >
      <path
        fill={iconColor}
        d="M18,17.5c2.7,0,5-2.2,5-5s-2.2-5-5-5s-5,2.2-5,5S15.3,17.5,18,17.5z M18,8.5c2.2,0,4,1.8,4,4s-1.8,4-4,4 s-4-1.8-4-4S15.8,8.5,18,8.5z"
      />
      <path
        fill={iconColor}
        d="M18,19.5c-4.7,0-9,2.9-9,7v3h18v-3C27,22.4,22.7,19.5,18,19.5z M26,28.5H10v-2c0-3.3,3.7-6,8-6s8,2.7,8,6V28.5z"
      />
      <circle
        cx="18"
        cy="12.5"
        r="3"
        fill={iconColor}
      />
    </SvgIcon>
  );
};

export default DefaultAvatar;
