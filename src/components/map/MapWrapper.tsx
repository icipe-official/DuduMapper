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
import React, { useState } from "react";
import NewMap from "./Map";

const MapWrapper = () => {
  //aded state for ischecked then pass it
  // to newmap so that it can check on checkbox
  const [isChecked, setIsChecked] = useState(false);
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
      <NewMap isChecked={isChecked} setIsChecked={setIsChecked} />
    </div>
  );
};

export default MapWrapper;
