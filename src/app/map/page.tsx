"use client";
import Newmap from "@/components/map/Map";

function Map(): JSX.Element {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <main style={{ width: "100%" }}>
        <Newmap />
      </main>
    </div>
  );
}

export default Map;
