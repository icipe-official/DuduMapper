import {
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Paper,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";

import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";
import { useAuth } from "@/context/context";
import React from "react";
const AccountProfile = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [settingAnchorEl, setSettingAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSettingAnchorEl(null);
  };
  const getGenderIcon = (gender: string | undefined) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return (
          <MaleIcon fontSize="small" sx={{ verticalAlign: "middle", ml: 1 }} />
        );
      case "female":
        return (
          <FemaleIcon
            fontSize="small"
            sx={{ verticalAlign: "middle", ml: 1 }}
          />
        );
      case "other":
        return (
          <TransgenderIcon
            fontSize="small"
            sx={{ verticalAlign: "middle", ml: 1 }}
          />
        );
    }
  };
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <Paper
        elevation={4}
        sx={{ p: 4, borderRadius: 4, width: "100%", maxWidth: 400 }}
      >
        <Typography
          variant="h6"
          display="block"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          User Profile
        </Typography>
        <Typography
          sx={{
            color: "green",
            display: "center",
            mb: 2,
            alignItems: "center",
          }}
        >
          Hello {user?.firstName}!
        </Typography>

        {/* <ListItemText
                    //sx={{ color: "black", padding: "5px" }}
                    //primary={`Name : ${user?.email}`}
                    //secondary={`Email Address:  ${user?.email}`}
                    />*/}
        <Box
          sx={{
            display: "flex",
            mb: 2,
            alignItems: "center",
            fontFamily: "sans-serif",
            fontWeight: "bold",
          }}
        >
          {" "}
          <Typography variant="h6"> Personal Details!</Typography>{" "}
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography sx={{ padding: "5px", gap: 1 }}>
            {" "}
            <PersonIcon sx={{ mr: 1, color: "text.secondary" }} /> First
            Name:&nbsp;
            {user?.firstName}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography sx={{ padding: "5px", gap: 1 }}>
            {" "}
            <PersonIcon sx={{ mr: 1, color: "text.secondary" }} /> Last
            Name:&nbsp;
            {user?.lastName}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography sx={{ padding: "5px", gap: 1 }}>
            {""}
            {getGenderIcon(user?.gender)} Gender:&nbsp;
            {user?.gender}
          </Typography>
        </Box>
        {/* Name input field */}
        {/*<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <TextField
                        sx={{ padding: "5px", gap: 1 }}
                        label="Enter your Name!"
                      />{" "}
                      <Button>Save</Button>
                    </Box>*/}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ padding: "5px", gap: 1, color: "" }}>
            {" "}
            <EmailIcon sx={{ mr: 1, color: "text.secondary" }} /> Email
            Address:&nbsp;
            {user?.email}
          </Typography>
        </Box>

        {/*<ListItemText sx={{ padding: "5px" }}>
                      <PersonIcon />
                      <h5>You are who?</h5>
                      <PersonIcon />
                      <p> Your email Address is {user?.email}</p>
                    </ListItemText>*/}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button onClick={logout}>Logout</Button>
        </Box>
      </Paper>
    </Box>
  );
};
export default AccountProfile;
