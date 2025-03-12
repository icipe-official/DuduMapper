"use client";
import React, { Children, useEffect, useRef, useState } from "react";
import { Map as OlMap, Tile, View } from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import LayerGroup from "ol/layer/Group";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { fromLonLat } from "ol/proj";
import { getTopLeft, getWidth } from "ol/extent";
import Collection from "ol/Collection";
import OSM from "ol/source/OSM";
import { get as getProjection } from "ol/proj";
import {
  geoServerBaseUrl,
  getBasemapOverlaysLayersArray,
  fetchWMTSCapabilities,
} from "@/api/requests"; // Adjust import path as needed
import Legend from "./Legend"; // Import the Legend component
import { Options as LayerGroupOptions } from "ol/layer/Group";
import { Collapse } from "@mui/material";

// Add these constants at the top of the file after imports
const projection4326 = getProjection("EPSG:4326");
const projection3857 = getProjection("EPSG:3857");

// Calculate resolutions and matrix IDs for EPSG:4326
const projectionExtent4326 = projection4326?.getExtent();
const size4326 = projectionExtent4326
  ? getWidth(projectionExtent4326) / 256
  : 0;
const resolutions4326 = projectionExtent4326
  ? Array.from({ length: 19 }, (_, z) => size4326 / Math.pow(2, z))
  : [];
const matrixIds4326 = Array.from({ length: 19 }, (_, z) => `EPSG:4326:${z}`);

// Calculate resolutions and matrix IDs for EPSG:3857
const projectionExtent3857 = projection3857?.getExtent();
const size3857 = projectionExtent3857
  ? getWidth(projectionExtent3857) / 256
  : 0;
const resolutions3857 = Array.from(
  { length: 19 },
  (_, z) => size3857 / Math.pow(2, z)
);
const matrixIds3857 = Array.from({ length: 19 }, (_, z) => `EPSG:3857:${z}`);

function Newmap() {
  const mapRef = useRef<OlMap>();
  const mapElement = useRef<HTMLDivElement>(null);
  const [wmtsLayers, setWmtsLayers] = useState([]);
  const [activeLayerName, setActiveLayerName] = useState<string | null>(null);

  // Single useEffect for layer fetching
  useEffect(() => {
    const fetchLayers = async () => {
      if (!geoServerBaseUrl) {
        console.error("GeoServer base URL is not set");
        return;
      }

      try {
        const layers = await fetchWMTSCapabilities();
        console.log("Fetched WMTS layers:", layers);
        setWmtsLayers(layers);
      } catch (error) {
        console.error("Error fetching capabilities:", error);
      }
    };

    fetchLayers();
  }, []);

  // Initialize map with layers
  useEffect(() => {
    if (!mapElement.current || !wmtsLayers.length) return;

    console.log("Initializing map with layers:", wmtsLayers);

    // Create dynamic WMTS layers
    const dynamicLayers = wmtsLayers
      .map((layer: any) => {
        const projectionToUse = getProjection(layer.supportedCRS);

        if (!projectionToUse) {
          console.warn(
            `Projection ${layer.supportedCRS} not found for layer ${layer.name}`
          );
          return null;
        }

        return new TileLayer({
          properties: {
            title: layer.title,
            type: "overlay",
          },
          visible: false,
          source: new WMTS({
            url: `${geoServerBaseUrl}/geoserver/gwc/service/wmts`,
            layer: layer.name,
            matrixSet: layer.matrixSet,
            format: "image/png",
            projection: projectionToUse,
            tileGrid: new WMTSTileGrid({
              origin: [-180.0, 90.0],
              resolutions: [
                0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125,
                0.02197265625, 0.010986328125, 0.0054931640625,
                0.00274658203125, 0.001373291015625, 0.0006866455078125,
                0.00034332275390625, 0.000171661376953125,
                0.0000858306884765625,
              ],
              matrixIds: Array.from({ length: 14 }, (_, i) => `EPSG:4326:${i}`),
              tileSize: [256, 256],
              extent: [-180.0, -90.0, 180.0, 90.0],
            }),
            style: "",
            wrapX: true,
            /**
             * Custom tile load function for managing WMTS tile loading.
             * Logs the source URL of the tile being loaded.
             * Handles image loading errors and success by assigning
             * appropriate callbacks to the image element of the tile.
             *
             * @param {any} tile - The tile object whose image is being loaded.
             * @param {string} src - The source URL from which the tile image is fetched.
             */
            tileLoadFunction: (tile: any, src: string) => {
              console.log("Loading tile from:", src);
              const img = tile.getImage();
              img.onerror = () => {
                console.error("Tile load error:", src);
              };
              img.onload = () => {
                console.log("Tile loaded successfully:", src);
              };
              img.src = src;
            },
          }),
        });
      })
      .filter((layer) => layer !== null);

    // Create base OSM layer
    const osmLayer = new TileLayer({
      source: new OSM(),
      properties: {
        title: "OpenStreetMap",
        type: "base",
      },
    });

    // Create layer groups
    const baseGroup = new LayerGroup({
      properties: {
        title: "Base Maps",
      },
      layers: [osmLayer],
    } as LayerGroupOptions);

    const duduGroup = new LayerGroup({
      properties: {
        title: "Dudu Layers",
        LayerGroup,
        Collapse: false,
      },
      layers: new Collection(dynamicLayers),
    } as LayerGroupOptions);

    // Initialize map
    const initialMap = new OlMap({
      target: mapElement.current,
      layers: [baseGroup, duduGroup],

      view: new View({
        projection: "EPSG:4326",
        center: [37.9062, -1.2921],
        zoom: 6,
        minZoom: 0,
        maxZoom: 13,
        extent: [-180.0, -90.0, 180.0, 90.0],
      }),
    });

    // Add layer switcher
    const layerSwitcher = new LayerSwitcher({
      startActive: true,
      groupSelectStyle: "children",
      collapsed: false,
    } as any);
    duduGroup.set("openInLayerSwitcher", true); // keep the group open

    initialMap.addControl(layerSwitcher);

    // Add visibility listeners
    dynamicLayers.forEach((layer) => {
      if (layer) {
        layer.on("change:visible", (event: any) => {
          const isVisible = event.target.getVisible();
          const layerName = event.target.get("title");

          if (isVisible) {
            setActiveLayerName(layerName);
            console.log(`Layer ${layerName} is now visible`);
          } else if (activeLayerName === layerName) {
            setActiveLayerName(null);
          }
        });
      }
    });

    mapRef.current = initialMap;

    return () => {
      initialMap.setTarget(undefined);
    };
  }, [wmtsLayers]);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 70px)" }}>
      <div
        style={{ flexGrow: 1, position: "relative" }}
        ref={mapElement}
        className="map-container"
        id="map-container"
      ></div>
      <Legend layerName={activeLayerName} />
    </div>
  );
}

export default Newmap;
