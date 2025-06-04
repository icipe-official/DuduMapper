"use client";

import dynamic from "next/dynamic";

const NewMapNoSSR = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function MapWrapper() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",  // or any fixed height to ensure container is visible
        position: "relative",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <NewMapNoSSR />
    </div>
  );
}
