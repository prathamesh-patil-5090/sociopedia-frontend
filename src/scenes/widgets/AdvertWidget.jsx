import { Typography, useTheme } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import banaoImage from "./assets/banao.png";

const AdvertWidget = () => {
  const { palette } = useTheme();
  const dark = palette.neutral.dark;
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  return (
    <WidgetWrapper>
      <FlexBetween>
        <Typography color={dark} variant="h5" fontWeight="500">
          Sponsored
        </Typography>
        <Typography color={medium}>Create Ad</Typography>
      </FlexBetween>
      <img
        width="100%"
        height="auto"
        alt="Banao Tech"
        src={banaoImage}
        style={{ borderRadius: "0.75rem", margin: "0.75rem 0" }}
      />
      <FlexBetween>
        <Typography color={main}>Banao Tech</Typography>
        <Typography color={medium}>banao.tech</Typography>
      </FlexBetween>
      <Typography color={medium} m="0.5rem 0">
        Turn your ideas into reality with Banao Technologies. 
        We specialize in custom software development, mobile apps, 
        web solutions, and digital transformation. Join thousands of 
        satisfied clients worldwide.
      </Typography>
    </WidgetWrapper>
  );
};

export default AdvertWidget;