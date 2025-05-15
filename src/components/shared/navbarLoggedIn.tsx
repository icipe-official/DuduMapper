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
  Menu,
  MenuItem,
} from "@mui/material";
import { BASE_PATH } from "@/lib/constants";
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import AccountCircle from "@mui/icons-material/AccountCircle";

const NavbarLoggedIn: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  console.log("Rendering NavbarLoggedIn ✅");
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
    handleMenuClose();
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  const navMenuItems = [<NavLink key="About" url="/about" text="About" />];

  return (
    <Box sx={{ position: "relative", zIndex: 2 }}>
      <AppBar position="fixed" sx={{ bgcolor: "white", margin: 0, padding: 0 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1, mt: "6px" }}>
            <div onClick={handleLogoClick} style={{ cursor: "pointer" }}>
              <Link href="/">
                <picture>
                  <img
                    src={`${BASE_PATH}/Animals-Mosquito-icon.png`}
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
                  <span>Welcome&nbsp;</span>
                  {user?.email}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    router.push("/settings");
                    handleMenuClose();
                  }}
                >
                  Settings
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default NavbarLoggedIn;
