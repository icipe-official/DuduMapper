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
const Navbar: React.FC = () => {
  const theme = useTheme();
  const navMenuItems: any[] = [];
  navMenuItems.push(<NavLink key="About" url="/about" text="About" />);

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
                      src={`${BASE_PATH}/vector-atlas-logo.svg`}
                      style={{ maxHeight: "50px", cursor: "pointer" }}
                      alt="Vector Atlas logo"
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

export default Navbar;
