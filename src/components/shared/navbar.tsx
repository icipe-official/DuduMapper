"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import DrawerComp from "./DrawerComp";
import NavLink from "./navlink";
import { useMediaQuery, useTheme } from "@mui/material";
import { BASE_PATH } from "@/lib/constants";
import { useAuth } from "@/context/context";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AccountCircle from "@mui/icons-material/AccountCircle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { user, logout, updateUserName } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [editingName, setEditingName] = React.useState(false);
  const [newName, setNewName] = React.useState(user?.name || "");
  const [setting, setSetting] = React.useState();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setEditingName(false);
  };

  const handleNameUpdate = () => {
    updateUserName(newName);
    setEditingName(false);
  };
  //lets choose  handle logo click
  const router = useRouter();

  const handleLogoClick = () => {
    if (!user) {
      alert("Please sign in first");
      return;
    }
    router.push("/");
  };
  const navMenuItems: any[] = [];
  navMenuItems.push(<NavLink key="About" url="/about" text="About" />);
  if (!user) {
    navMenuItems.push(
      <NavLink key="Register" url="/auth/register" text="Register" />
    );
  }

  return (
    <div>
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <AppBar
          position="fixed"
          sx={{ bgcolor: "white", margin: "0", padding: "0" }}
        >
          <Toolbar>
            <Box sx={{ flexGrow: 1, mt: "6px" }}>
              <div onClick={handleLogoClick}>
                <Link href="/"></Link>
                <picture>
                  <img
                    src={`${BASE_PATH}/Animals-Mosquito-icon.png`}
                    style={{ maxHeight: "70px", cursor: "pointer" }}
                    alt="Dudu Mapper logo"
                  />
                </picture>
              </div>
            </Box>

            {isMobile ? (
              <DrawerComp navItems={navMenuItems} />
            ) : (
              <>
                {navMenuItems}
                {user && (
                  <>
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
                      <MenuItem disabled>{user.email}</MenuItem>
                      {editingName ? (
                        <MenuItem disableRipple>
                          <TextField
                            size="small"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleNameUpdate()
                            }
                          />
                          <Button onClick={handleNameUpdate}>Save</Button>
                        </MenuItem>
                      ) : (
                        <MenuItem onClick={() => setEditingName(true)}>
                          Edit Name ({user.email || "Unnamed"})
                        </MenuItem>
                      )}
                      <MenuItem>Setting</MenuItem>
                      <MenuItem onClick={logout}>Logout</MenuItem>
                    </Menu>
                  </>
                )}
              </>
            )}
          </Toolbar>
        </AppBar>
      </Box>
    </div>
  );
};

export default Navbar;
/*"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import DrawerComp from "./DrawerComp";
import NavLink from "./navlink";
import { useMediaQuery, useTheme } from "@mui/material";
import { BASE_PATH } from "@/lib/constants";
const Navbar: React.FC = () => {
  const theme = useTheme();
  const navMenuItems: any[] = [];

  navMenuItems.push(<NavLink key="About" url="/about" text="About" />);
  navMenuItems.push(
    <NavLink key="Register" url="/auth/register" text="Register" />
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div>
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <AppBar
          position="fixed"
          sx={{ bgcolor: "white", margin: "0", padding: "0" }}
        >
          <Toolbar>
            <>
              <Box sx={{ flexGrow: 1, mt: "6px" }}>
                <Link href="/">
                  <picture>
                    <img
                      src={`${BASE_PATH}/Animals-Mosquito-icon.png`}
                      style={{ maxHeight: "70px", cursor: "pointer" }}
                      alt="Dudu Mapper logo"
                    />
                  </picture>
                </Link>
              </Box>

              {isMobile ? (
                <DrawerComp navItems={navMenuItems} />
              ) : (
                <>{navMenuItems}</>
              )}
            </>
          </Toolbar>
        </AppBar>
      </Box>
    </div>
  );
};

export default Navbar;*/
