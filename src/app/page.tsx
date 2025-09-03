"use client"; // Required because we use hooks like useEffect and context

//import { useEffect, useState } from "react";
//import { useAuth } from "../context/context";
//import Newmap from "../components/map/Map";
import NavbarContainer from "../components/shared/navbarContainer"; //
import NavbarLoggedIn from "../components/shared/navbarLoggedIn";
import dynamic from "next/dynamic";
import React, { useState } from "react";

// Dynamically import the map to prevent server-side rendering issues
const Newmap = dynamic(() => import("../components/map/Map"), { ssr: false });

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * The home page of the application, containing a dynamic header and a map
 * component.
 *
 * The map component is a dynamic import to prevent server-side rendering issues.
 *
 * The header is also dynamic, and is currently a simple logged-in/logged-out
 * toggle.
 *
 * The user's authentication state is stored in a context, and is used to
 * conditionally render the logged-in or logged-out header.
 *
 * @returns {JSX.Element} The home page component
 */
/*******  e8e6e861-a710-4ce2-8fb5-fc80f050d146  *******/ export default function Home() {
  //added state for ischecked then pass it to navbarcontainer
  //and also to newmap so that it can check on checkbox

  const [isChecked, setIsChecked] = useState(false);
  return (
    <div
      style={{ overflow: "hidden", height: "100vh", width: "100vw", margin: 0 }}
    >
      <NavbarContainer isChecked={isChecked} />{" "}
      {/* 👈 This makes the header dynamic */}
      <div style={{ height: "100%", marginTop: "50px" }}>
        <Newmap isChecked={isChecked} setIsChecked={setIsChecked} />
      </div>
    </div>
  );
}
