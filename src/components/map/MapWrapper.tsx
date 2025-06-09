// "use client";
// import dynamic from "next/dynamic";
// import React from "react";

// const NewmapNoSSR = dynamic(() => import("./Map"), {
//   ssr: false,
//   loading: () => <p>Loading map...</p>,
// });

// export default function MapWrapper() {
//   return <NewmapNoSSR />;
// }

// MapWrapper.tsx
import React from "react";
import NewMap from "./Map";

const MapWrapper = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <NewMap />
    </div>
  );
};

export default MapWrapper;
