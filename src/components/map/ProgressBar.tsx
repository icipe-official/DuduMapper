import { CircularProgress, Box } from "@mui/material";

const ProgressBar = () => {
  return (
    <Box
      sx={{
        position: "fixed", // Ensures it overlays
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.7)", // Semi-transparent background
        zIndex: 9999, // Ensures it appears on top // Optional for better visibility
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default ProgressBar;
