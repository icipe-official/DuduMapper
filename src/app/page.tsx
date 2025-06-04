'use client'; // Required if using client-only components like OpenLayers

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the map to prevent server-side rendering issues
const Newmap = dynamic(() => import('../components/map/Map'), { ssr: false });

export default function Home() {
  return (
    <main style={{ height: '100vh', width: '100vw', overflow: 'hidden', margin: 0 }}>
      {/* <NavBar /> Uncomment if you plan to use the navbar */}
      <div style={{ height: '100%', marginTop: '50px' }}>
        <Newmap />
      </div>
    </main>
  );
}
