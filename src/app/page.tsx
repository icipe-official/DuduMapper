"use client"; // Required because we use hooks like useEffect and context

import { useEffect, useState } from "react";
import { useAuth } from "../context/context";
import Newmap from "../components/map/Map";
import Navbar from "../components/shared/navbar"; //

export default function Home() {
  return (
    <div
      style={{ overflow: "hidden", height: "100%", width: "100%", margin: 0 }}
    >
      <Navbar /> {/* 👈 This makes the header dynamic */}
      <div style={{ marginTop: "50px" }}>
        <Newmap />
      </div>
    </div>
  );
}
