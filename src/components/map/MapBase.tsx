// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { Map as OlMap, View } from "ol";
// import "ol/ol.css";
// import "ol-ext/control/LayerSwitcher.css";
// import LayerSwitcher from "ol-ext/control/LayerSwitcher";
// import LayerGroup from "ol/layer/Group";
// import TileLayer from "ol/layer/Tile";
// import WMTS from "ol/source/WMTS";
// import WMTSTileGrid from "ol/tilegrid/WMTS";
// import { Projection } from "ol/proj";
// import Collection from "ol/Collection";
// import OSM from "ol/source/OSM";
// import { geoServerBaseUrl, fetchWMTSCapabilities } from "@/api/requests";
// import Legend from "./Legend";
// import DrawerComponent from "./DrawerComponent";
// import { Options as LayerGroupOptions } from "ol/layer/Group";
// import { get as getProjection } from "ol/proj";

// function MapBase() {
//   const mapRef = useRef<OlMap>();
//   const mapElement = useRef<HTMLDivElement>(null);
//   const [wmtsLayers, setWmtsLayers] = useState<any[]>([]);
//   const [activeLayerName, setActiveLayerName] = useState<string | null>(null);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [filterOpen, setFilterOpen] = useState(false);

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
//   const printToScale = () => console.log("Print map");
//   const handleDownloadClick = () => console.log("Download map");

//   useEffect(() => {
//     const fetchLayers = async () => {
//       if (!geoServerBaseUrl) {
//         console.error("GeoServer base URL is not set");
//         return;
//       }

//       try {
//         const layers = await fetchWMTSCapabilities();
//         setWmtsLayers(layers);
//       } catch (error) {
//         console.error("Error fetching capabilities:", error);
//       }
//     };

//     fetchLayers();
//   }, []);

//   useEffect(() => {
//     if (!mapElement.current || !wmtsLayers.length || mapRef.current) return;

//     const layersByGroup = wmtsLayers.reduce(
//       (groups: Record<string, any[]>, layer: any) => {
//         const groupTitle = layer.group?.groupTitle || "Ungrouped";
//         if (!groups[groupTitle]) groups[groupTitle] = [];
//         groups[groupTitle].push(layer);
//         return groups;
//       },
//       {}
//     );

//     const dynamicGroups = Object.entries(layersByGroup).map(
//       ([groupTitle, groupLayers]) => {
//         const layers = groupLayers
//           .map((layer) => {
//             const projectionToUse = getProjection(layer.supportedCRS);
//             if (!projectionToUse) {
//               console.warn(
//                 `Projection ${layer.supportedCRS} not found for layer ${layer.name}`
//               );
//               return null;
//             }

//             return new TileLayer({
//               properties: {
//                 title: layer.title,
//                 type: "overlay",
//               },
//               visible: false,
//               source: new WMTS({
//                 url: `${geoServerBaseUrl}/geoserver/gwc/service/wmts`,
//                 layer: layer.name,
//                 matrixSet: layer.matrixSet,
//                 format: "image/png",
//                 projection: projectionToUse,
//                 tileGrid: new WMTSTileGrid({
//                   origin: [-180.0, 90.0],
//                   resolutions: [
//                     0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125,
//                     0.02197265625, 0.010986328125, 0.0054931640625,
//                     0.00274658203125, 0.001373291015625, 0.0006866455078125,
//                     0.00034332275390625, 0.000171661376953125,
//                     0.0000858306884765625,
//                   ],
//                   matrixIds: Array.from(
//                     { length: 14 },
//                     (_, i) => `EPSG:4326:${i}`
//                   ),
//                   tileSize: [256, 256],
//                   extent: [-180.0, -90.0, 180.0, 90.0],
//                 }),
//                 style: "",
//                 wrapX: true,
//               }),
//             });
//           })
//           .filter((layer): layer is TileLayer<any> => layer !== null);

//         return new LayerGroup({
//           properties: {
//             title: groupTitle,
//             type: "group",
//           },
//           layers: new Collection(layers),
//         } as LayerGroupOptions);
//       }
//     );

//     const osmLayer = new TileLayer({
//       source: new OSM(),
//       properties: {
//         title: "OpenStreetMap",
//         type: "base",
//       },
//     });

//     const map = new OlMap({
//       target: mapElement.current,
//       layers: [
//         new LayerGroup({
//           properties: {
//             title: "Base Maps",
//           },
//           layers: [osmLayer],
//         } as LayerGroupOptions),
//         ...dynamicGroups,
//       ],
//       view: new View({
//         projection: "EPSG:4326",
//         center: [37.9062, -1.2921],
//         zoom: 6,
//         minZoom: 0,
//         maxZoom: 13,
//         extent: [-180.0, -90.0, 180.0, 90.0],
//       }),
//     });

//     const layerSwitcher = new (LayerSwitcher as any)({
//       startActive: true,
//       groupSelectStyle: "children",
//     });
//     map.addControl(layerSwitcher);

//     dynamicGroups.forEach((group) => {
//       const groupLayers = group.getLayers();
//       if (groupLayers) {
//         groupLayers.forEach((layer: any) => {
//           if (layer) {
//             layer.on("change:visible", (event: any) => {
//               const isVisible = event.target.getVisible();
//               const layerName = event.target.get("title");
//               if (isVisible) {
//                 setActiveLayerName(layerName);
//               } else if (activeLayerName === layerName) {
//                 setActiveLayerName(null);
//               }
//             });
//           }
//         });
//       }
//     });

//     mapRef.current = map;

//     return () => {
//       map.setTarget(undefined);
//     };
//   }, [wmtsLayers, activeLayerName]);

//   return (
//     <div
//       className="map-layout-container"
//       style={{ position: "relative", height: "calc(100vh - 70px)" }}
//     >
//       <DrawerComponent
//         sidebarOpen={sidebarOpen}
//         toggleSidebar={toggleSidebar}
//         filterOpen={filterOpen}
//         setFilterOpen={setFilterOpen}
//         printToScale={printToScale}
//         handleDownloadClick={handleDownloadClick}
//       />
//       <div
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           zIndex: 0,
//         }}
//         ref={mapElement}
//         className="map-container"
//         id="map-container"
//       />
//       <div style={{ position: "absolute", right: 0, zIndex: 1 }}>
//         <Legend layerName={activeLayerName} />
//       </div>
//     </div>
//   );
// }

// export default MapBase;
