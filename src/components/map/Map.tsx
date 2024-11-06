"use client";
import React, { useEffect, useRef, useState } from "react";
import { Map as OlMap, View } from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import LayerGroup from "ol/layer/Group";
import { GroupLayerOptions } from "ol-layerswitcher";
import { getBasemapOverlaysLayersArray, vulenerability } from "@/api/requests";
import "../shared/CSS/LayerSwitcherStyles.css";
import "../shared/CSS/olzoom.css";
import "../filters/filterSectionStyles.css";
import "../filters/filter_section_dev.css";
import { fromLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { BaseLayerOptions } from "ol-layerswitcher";
import { geoServerBaseUrl } from "@/api/requests";
import WMTS from "ol/source/WMTS.js";
import WMTSTileGrid from "ol/tilegrid/WMTS.js";
import { get as getProjection } from "ol/proj.js";
import { getTopLeft, getWidth } from "ol/extent.js";
import { showLegend } from "@/api/requests";
let projection: any = null;

const maybeProjection = getProjection("EPSG:900913");

if (maybeProjection) {
  projection = maybeProjection;
}

const projectionExtent = projection.getExtent();
const size = getWidth(projectionExtent) / 256;
const resolutions = new Array(19);

const matrixIds = new Array(19);
for (let z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = `EPSG:900913:${z}`;
}

function Newmap() {
  const mapRef = useRef<OlMap>();
  const [_map, setMap] = useState<OlMap | undefined>(); // Specify the type using a generic type argument
  const mapElement = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      const initializeMap = async () => {
        if (true) {
          const crpsystems = new LayerGroup({
            title: "Crop Systems",
            layers: [
              new TileLayer({
                title: "Overlays",
                visible: false,
                source: new WMTS({
                  url: geoServerBaseUrl + "/geoserver/gwc/service/wmts",
                  layer: "Dudu:occurrence",
                  matrixSet: "EPSG:900913",
                  format: "image/png",
                  projection: projection,
                  tileGrid: new WMTSTileGrid({
                    origin: getTopLeft(projectionExtent),
                    resolutions: resolutions,
                    matrixIds: matrixIds,
                  }),
                  style: "",
                  wrapX: true,
                }),
              } as BaseLayerOptions),
            ],
          } as GroupLayerOptions);

          const initialMap = new OlMap({
            target: "map-container",
            layers: [
              new TileLayer({
                source: new OSM(), // Use OpenStreetMap as the tile source
              }),
              crpsystems /**BaseMaps, crpsystems, drought_risk, Overlays, vulnerablity, hazard, evapotranspiration*/,
            ],
            view: new View({
              center: fromLonLat([37.9062, -1.2921]),
              zoom: 6.5,
            }),
          });
          const layerSwitcher = new LayerSwitcher();
          initialMap.addControl(layerSwitcher);
          mapRef.current = initialMap;
          setMap(initialMap);
          // Initialise map
          //
          //
          initialMap.getLayers().forEach((layerGroup) => {
            // Check if the layer is a LayerGroup (contains multiple layers)
            if (layerGroup instanceof LayerGroup) {
              layerGroup.getLayers().forEach((layer) => {
                if (layer instanceof TileLayer) {
                  layer.on("change:visible", function (event) {
                    const layer = event.target;
                    const isVisible = layer.getVisible();
                    const layerName = layer.get("title");

                    if (isVisible) {
                      console.log(`Layer name: ${layerName} is now visible`);
                      showLegend(layerName); // Show legend in modal
                    } else {
                      console.log(`Layer name: ${layerName} is now hidden`);
                      const modal = document.getElementById("legend-modal");
                      if (modal) {
                        document.body.removeChild(modal); // Remove legend if it exists
                      }
                    }
                  });
                }
              });
            }
          });

          return () => initialMap.setTarget(undefined);
        }
      };

      initializeMap();
    },
    [
      /**theBaseMapsArray, crop_systemsArray, theOverlaysArray, drought_riskArray, hazardArray, vulnerabilityArray,*/
    ]
  );
  useEffect(() => {
    // Cleanup function to remove all popups when leaving the page
    return () => {
      // Find all modals by their common class or ID
      const modals = document.querySelectorAll("#legend-modal"); // or class like `.legend-popup`
      modals.forEach((modal) => modal.remove()); // Remove each modal
    };
  }, []);
  function calculateWidth() {
    // If neither is open
    return "100%"; // Default width
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 70px)" }}>
      <div
        style={{
          flexGrow: 1,
          width: calculateWidth(),
          position: "relative",
          zIndex: 0,
        }}
        ref={mapElement}
        className="map-container"
        id="map-container"
      ></div>
      <div id="legend-container"></div>
    </div>
  );
}

export default Newmap;
