"use client";
import React, { useEffect, useRef, useState } from "react";
import { Map as OlMap, Tile, View } from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import LayerGroup from "ol/layer/Group";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import Collection from "ol/Collection";
import OSM from "ol/source/OSM";
import { get as getProjection } from "ol/proj";
import { geoServerBaseUrl, fetchWMTSCapabilities } from "@/api/requests";
import { fromLonLat } from "ol/proj";
import { getTopLeft, getWidth } from "ol/extent";
import { Options as LayerGroupOptions } from "ol/layer/Group";

// Add these constants at the top of the file after imports
const projection4326 = getProjection("EPSG:4326");
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
  const [wmtsLayers, setWmtsLayers] = useState<any[]>([]);
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

        // Organize layers by group
        const groupedLayers = layers.reduce(
          (groups: Record<string, any[]>, layer: any) => {
            const groupTitle = layer.group?.groupTitle || "Ungrouped";
            if (!groups[groupTitle]) {
              groups[groupTitle] = [];
            }
            groups[groupTitle].push(layer);
            return groups;
          },
          {}
        );

        setLayerGroups(groupedLayers);
      } catch (error) {
        console.error("Error fetching capabilities:", error);
      }
    };

    fetchLayers();
  }, []);
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.updateSize();
    }
  }, [open]);

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
      source: osmSource,
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
    } as any);
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
      osmSource.un("tileloadstart", incrementLoading);
      osmSource.un("tileloadend", decrementLoading);
      osmSource.un("tileloaderror", decrementLoading);
      initialMap.setTarget(undefined);
    };
  }, [wmtsLayers, layerGroups]);

  const renderLayerControls = () => (
    <Collapse in={overlaysOpen} timeout="auto" unmountOnExit>
      {Object.entries(layerGroups).map(([groupTitle, groupLayers]) => (
        <div key={groupTitle}>
          <ListItemButton
            onClick={() => handleGroupClick(groupTitle)}
            sx={{
              pl: 4,
              py: 1,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
              backgroundColor: expandedGroups[groupTitle]
                ? alpha(theme.palette.primary.main, 0.08)
                : "transparent",
            }}
          >
            <ListItemIcon>
              <FolderIcon
                color={expandedGroups[groupTitle] ? "primary" : "inherit"}
              />
            </ListItemIcon>
            <ListItemText
              primary={groupTitle}
              primaryTypographyProps={{
                fontWeight: expandedGroups[groupTitle] ? 600 : 400,
                color: expandedGroups[groupTitle]
                  ? theme.palette.primary.main
                  : "inherit",
              }}
            />
            {expandedGroups[groupTitle] ? (
              <ExpandLess color="primary" />
            ) : (
              <ExpandMore />
            )}
          </ListItemButton>
          <Collapse
            in={expandedGroups[groupTitle]}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {groupLayers.map((layer) => {
                const olLayer = mapRef.current
                  ?.getLayers()
                  .getArray()
                  .find((l: any) => l.get("title") === groupTitle)
                  ?.getLayers()
                  .getArray()
                  .find((l: any) => l.get("title") === layer.title);

                const isVisible = olLayer?.getVisible() || false;

                return (
                  <ListItemButton
                    key={layer.title}
                    sx={{ pl: 8 }}
                    onClick={() => handleLayerToggle(olLayer)}
                  >
                    <Checkbox
                      edge="start"
                      checked={olLayer?.getVisible() || false}
                      tabIndex={-1}
                      disableRipple
                    />
                    <ListItemText primary={layer.title} />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        </div>
      ))}
    </Collapse>
  );

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
