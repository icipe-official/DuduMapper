"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import DrawerComp from "./DrawerComp";
import NavLink from "./navlink";
import {
  useMediaQuery,
  useTheme,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import Menu from "@mui/material/Menu";

import EmailIcon from "@mui/icons-material/Email";

import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import TuneIcon from "@mui/icons-material/Tune";
import MenuIcon from "@mui/icons-material/Menu";
import { BASE_PATH } from "@/lib/constants";
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { toast } from "react-toastify";
import { AdminPanelSettings, List } from "@mui/icons-material";
import Logout from "@mui/icons-material/Logout";
import Text from "ol/style/Text";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";

const NavbarLoggedIn: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  console.log("Rendering NavbarLoggedIn ✅");
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [settingAnchorEl, setSettingAnchorEl] =
    React.useState<null | HTMLElement>(null);

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Opens the user menu.
   * @param {React.MouseEvent<HTMLElement>} event The event that triggered the function.
   */
  /*******  f3559e20-e1b3-4bf5-a28a-82a02d448521  *******/
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSettingAnchorEl(null);
  };
  const handleSettingClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingAnchorEl(event.currentTarget);
  };
  const handleLogout = async () => {
    await logout();
    toast.success("Logging out Successfully"),
      {
        position: "top-right",
        hideProgressBar: false,
        pauseOnHover: false,
        autoClose: 5000,
      };
    router.push("/");
    handleMenuClose();
  };
  //route
  const accountpage = () => {
    router.push("/auth/AccountPage");
  };
  //admin page
  const handleAdminPage = () => {
    router.push("/auth/admin");
  };
  //icon for gender
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
      default:
        return null;
    }
  };

  const handleLogoClick = () => {
    router.push("/");
  };
  const [open, setOpen] = React.useState(false);

  const navMenuItems = [<NavLink key="About" url="/about" text="About" />];

  //using this as name in my field
  {
    /*function getNameFromEmail(email?: string): string {
    if (!email) return "user"; // handle for undefined email
    return email.split("@")[0];
  }*/
  }

  return (
    <Box sx={{ position: "relative", zIndex: 2 }}>
      <AppBar position="fixed" sx={{ bgcolor: "white", margin: 0, padding: 0 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, mt: "6px" }}>
            <div onClick={handleLogoClick} style={{ cursor: "pointer" }}>
              <Link href="/">
                <picture>
                  <img
                    src={`/Animals-Mosquito-icon.png`}
                    style={{ maxHeight: "70px" }}
                    alt="Dudu Mapper logo"
                  />
                </picture>
              </Link>
            </div>
          </Box>

          {isMobile ? (
            <DrawerComp navItems={navMenuItems} />
          ) : (
            <>
              {navMenuItems}
              <IconButton
                size="large"
                edge="end"
                color="success"
                onClick={handleMenuOpen}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography
                    sx={{
                      color: "black",
                      fontFamily: "sans-serif",
                      fontWeight: "bold",
                    }}
                  >
                    Welcome &nbsp;
                  </Typography>
                  {user?.firstName}
                  <PersonIcon />
                </MenuItem>

                <Divider sx={{ my: 0.5 }} />

                {/*<MenuItem onClick={handleAdminPage}>
                  Admin Panel &nbsp;
                  <AdminPanelSettings sx={{ ml: "auto", mr: 1 }} />
                </MenuItem>*/}

                <Divider sx={{ my: 0.5 }} />

                <MenuItem onClick={accountpage}>
                  Profile &nbsp;
                  <AccountCircle sx={{ ml: "auto", mr: 1 }} />
                </MenuItem>

                {/*<MenuItem
                  //onClick={() => {
                  // router.push("/auth/settings");
                  //handleMenuClose();
                  // }}
                  onClick={handleSettingClick}
                >
                  Settings
                  <SettingsIcon sx={{ ml: "auto", mr: 1 }} />
                </MenuItem>*/}

                <MenuItem onClick={handleLogout}>
                  Logout
                  <Logout sx={{ ml: "auto", mr: 1 }} />
                </MenuItem>
              </Menu>

              {/**setting dropdown *
              <Menu
                anchorEl={settingAnchorEl}
                open={Boolean(settingAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
              >
                <MenuItem>
                  <Box sx={{ px: 2, py: 2, mt: 1 }}>
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
                    />*
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
                      <Typography variant="h6">
                        {" "}
                        Personal Details!
                      </Typography>{" "}
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography sx={{ padding: "5px", gap: 1 }}>
                        {" "}
                        <PersonIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />{" "}
                        First Name:&nbsp;
                        {user?.firstName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography sx={{ padding: "5px", gap: 1 }}>
                        {" "}
                        <PersonIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />{" "}
                        Last Name:&nbsp;
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
                    {/* Name input field *
                    {/*<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <TextField
                        sx={{ padding: "5px", gap: 1 }}
                        label="Enter your Name!"
                      />{" "}
                      <Button>Save</Button>
                    </Box>*
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ padding: "5px", gap: 1, color: "" }}>
                        {" "}
                        <EmailIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />{" "}
                        Email Address:&nbsp;
                        {user?.email}
                      </Typography>
                    </Box>

                    {/*<ListItemText sx={{ padding: "5px" }}>
                      <PersonIcon />
                      <h5>You are who?</h5>
                      <PersonIcon />
                      <p> Your email Address is {user?.email}</p>
                    </ListItemText>
                  </Box>
                </MenuItem>
              </Menu>*/}
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavbarLoggedIn;
