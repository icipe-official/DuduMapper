//"use client";

//import { createContext, useState, useContext } from "react";
import Newmap from "../components/map/Map";
import Navbar from "../components/shared/navbar";
import About from "../components/shared/About";
//import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Home from "./Home"; // Your homepage component
export default function Home() {
  return (
    <div
      style={{ overflow: "hidden", height: "100%", width: "100%", margin: 0 }}
    >
      {/*<Navbar />*/}
      {/*incorporating the about function*/}

      {/*<Routes>
      <About />
        <Navbar />
        <Route path="/about" element={<About />} />
      </Routes> */}
      <div style={{ marginTop: "50px" }}>
        <Newmap />
      </div>
      {/*<div>
        <About />
      </div>*/}
    </div>
  );
}
