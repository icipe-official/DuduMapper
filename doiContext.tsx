"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the context value
interface MapDrilldownContextType {
  //defines the states for button and layer
  isChecked: boolean;
  setIsChecked: (value: boolean) => void;
  selectedLayer: string | null;
  setSelectedLayer: (value: string | null) => void;

  //lets extend for doi also
  //minting
  //doi: string | null; setDoi: (value: string | null) => void;
  //metadata
  //doiMetadata: Record<string, any> | null; //json
  //setDoiMetadata: (value: string | null) => void;
}

// Create the context
const MapDrilldownContext = createContext<MapDrilldownContextType | undefined>(
  undefined
);

// Custom hook for easy access
export const useMapDrilldown = () => {
  const context = useContext(MapDrilldownContext);
  if (!context) {
    throw new Error(
      "useMapDrilldown must be used within a MapDrilldownProvider"
    );
  }
  return context;
};

// Provider component
export const MapDrilldownProvider = ({ children }: { children: ReactNode }) => {
  //for states
  const [isChecked, setIsChecked] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  //for doi
  const [doi, setDoi] = useState<string | null>(null);
  const [doiMetadata, setDoiMetadata] = useState<Record<string, any>>({});

  return (
    <MapDrilldownContext.Provider
      value={{
        isChecked,
        setIsChecked,
        selectedLayer,
        setSelectedLayer,
      }}
    >
      {children}
    </MapDrilldownContext.Provider>
  );
};
