"use client";
import Newmap from "../components/shared/map";
import NavBar from "../components/shared/navbar";

export default function Home() {
  return (
    <div style={{ overflow: "hidden", height: "100%", width: "100%" }}>
      <NavBar />
      <div style={{ marginTop: "80px" }}>
        <Newmap />
      </div>
    </div>
  );
}
