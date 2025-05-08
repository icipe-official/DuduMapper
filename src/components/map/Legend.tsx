import React, { useEffect, useState } from "react";
import "./Legend.css";
import { getLegendUrl } from "@/app/api/requests";

// Legend component to show and hide legends based on layer visibility
interface LegendProps {
  layerName: string | null;
}

interface LegendInfo {
  url: string;
  title: string;
}

const Legend: React.FC<LegendProps> = ({ layerName }) => {
  const [legends, setLegends] = useState<LegendInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!layerName) {
      setLegends([]);
      setError(null);
      return;
    }

    // Reset error state
    setError(null);

    try {
      // Create legend URL and add to legends array
      const legendUrl = getLegendUrl(layerName);
      if (!legendUrl) {
        setError("Unable to create legend URL");
        return;
      }

      console.log("Attempting to load legend from:", legendUrl);

      setLegends([
        {
          url: legendUrl,
          title: layerName.split(":").pop() || layerName,
        },
      ]);

      // Verify the legend image loads
      const img = new Image();
      img.onerror = () => {
        console.error(`Failed to load legend image for ${layerName}`);
        console.error("Failed URL:", legendUrl);
        setError(`Unable to load legend for ${layerName}`);
      };
      img.onload = () => {
        console.log(`Successfully loaded legend for ${layerName}`);
      };
      img.src = legendUrl;
    } catch (err) {
      console.error("Error setting up legend:", err);
      setError("Error setting up legend");
    }
  }, [layerName]);

  if (!layerName || legends.length === 0) return null;

  return (
    <div className="legend-modal">
      <div className="legend-content">
        {legends.map((legend, index) => (
          <div key={index} className="legend-item">
            <h3>{legend.title}</h3>
            {error ? (
              <div className="legend-error">{error}</div>
            ) : (
              <img
                src={legend.url}
                alt={`Legend for ${legend.title}`}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  setError(`Failed to load legend image for ${legend.title}`);
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
