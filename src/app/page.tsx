"use client"; // Required because we use hooks like useEffect and context

//import { useEffect, useState } from "react";
//import { useAuth } from "../context/context";
//import Newmap from "../components/map/Map";
import NavbarContainer from "../components/shared/navbarContainer"; //
import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the map to prevent server-side rendering issues
const Newmap = dynamic(() => import("../components/map/Map"), { ssr: false });
export default function Home() {
  return (
    <div
      style={{ overflow: "hidden", height: "100vh", width: "100vw", margin: 0 }}
    >
      <NavbarContainer /> {/* 👈 This makes the header dynamic */}
      <div style={{ height: "100%", marginTop: "50px" }}>
        <Newmap />
      </div>
    </div>
  );
}
