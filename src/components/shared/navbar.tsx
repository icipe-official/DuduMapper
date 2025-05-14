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
import { useRouter } from "next/navigation";

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  // Get auth state including loading
  const { user, logout, loading } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoClick = () => {
    if (!user) {
      alert("Please sign in first");
      return;
    }
    router.push("/");
  };

  // Create navigation items based on auth state
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

            {/* Only render auth-dependent UI after loading completes */}
            {loading ? (
              // Optional loading indicator (can be styled better)
              <div style={{ color: "black" }}>Loading...</div>
            ) : (
              <>
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
                          <MenuItem disabled>
                            <span>Welcome&nbsp;</span>
                            {user.email}
                          </MenuItem>
                          <MenuItem onClick={() => router.push("/settings")}>
                            Setting
                          </MenuItem>
                          <MenuItem
                            onClick={async () => {
                              await logout();
                              handleMenuClose();
                            }}
                          >
                            Logout
                          </MenuItem>
                        </Menu>
                      </>
                    )}
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
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const router = useRouter();

  const handleLogoClick = () => {
    if (!user) {
      alert("Please sign in first");
      return;
    }
    router.push("/");
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    logout(); // Clear context
    router.push("/"); // Go to homepage
    localStorage.removeItem("user");
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
                  <div className="relative inline-block text-left ml-4">
                    {/* Profile Button *
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full hover:bg-green-600"
                    >
                      <span className="font-medium text-black">
                        {user.email || "Profile"}
                      </span>
                      <img
                        src="/profile-icon.svg"
                        alt="Profile"
                        className="w-6 h-6"
                      />
                    </button>

                    {/* Dropdown Content *
                    {isOpen && (
                      <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg bg-white border shadow-lg p-4">
                        <div className="font-semibold text-lg">
                          {user.email || "No Email"}
                        </div>
                        <button
                          onClick={() => {
                            router.push("/settings");
                            setIsOpen(false);
                          }}
                          className="mt-4 w-full text-left text-gray-700 hover:underline"
                        >
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="mt-2 w-full text-left text-red-600 hover:underline"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </Toolbar>
        </AppBar>
      </Box>
    </div>
  );
}
*/
