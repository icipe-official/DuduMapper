"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/context";
import Navbar from "./navbar";
import NavbarLoggedIn from "./navbarLoggedIn";
import { useMapDrilldown } from "../../../doiContext";

//added ischecked prop to receive
// the value of the state from parent component
// and use it to pass it down to navbarloggedin
//added also interface for props

//interface NavbarContainerProps {
//isChecked: boolean;
//selectedLayer: string | null;
//}

const NavbarContainer: React.FC = () =>
  //{
  // isChecked,
  //selectedLayer,
  // }
  {
    const { user, loading } = useAuth();
    const { isChecked, setIsChecked, selectedLayer } = useMapDrilldown();

    // Enhanced debugging with localStorage check
    useEffect(() => {
      console.log("NavbarContainer mounted/updated");

      // Check what's in localStorage directly
      const localStorageUser = localStorage.getItem("user");

      console.log("Auth state details:", {
        contextUser: user ? `${user.email} (set)` : "null",
        loading,
        localStorageHasUser: !!localStorageUser,
        localStorageUserValue: localStorageUser,
      });

      // If there's a mismatch, log a warning
      if (!!localStorageUser && !user) {
        console.warn(
          "MISMATCH: User exists in localStorage but not in context!"
        );
      }
    }, [user, loading]);

    // Reserved space during loading
    if (loading) {
      console.log("Auth is still loading...");
      return (
        <div style={{ height: "80px" }}>
          {/* Empty space to reserve height */}
        </div>
      );
    }

    // Force check localStorage one more time (defensive approach)
    if (!user) {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          console.warn(
            "User found in localStorage but not in context - refresh may be needed"
          );
        }
      } catch (e) {
        console.error("Error checking localStorage:", e);
      }
    }

    console.log(
      `Rendering navbar with ${user ? "authenticated user" : "no user"}`
    );
    return user ? <NavbarLoggedIn /> : <Navbar />;
  };

export default NavbarContainer;
