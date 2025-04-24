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
//import { useNavigate } from "react-router-dom";
//import { Link } from "react-router-dom";
const Navbar: React.FC = () => {
  const theme = useTheme();
  //const navigate = useNavigate();
  const navigateTo = (path: string) => {
    window.location.href = path;
  };
  const navMenuItems: any[] = [];

  //nav items calling//
  navMenuItems.push(
    <NavLink
      key="About"
      url="./about"
      text="About" //trying onclick for handle window shift request
      //onClick={() => navigateTo("/About")}
    />
  );
  navMenuItems.push(
    <NavLink
      key="Register"
      url="./auth/register"
      text="Register" //trying onclick for handle window shift request
      //onClick={() => navigateTo("/Register")}
    />
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div>
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <AppBar
          position="fixed"
          sx={{ bgcolor: "white", margin: "0", padding: "0" }}
        >
          {/* about link click function*/}

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

export default Navbar;
