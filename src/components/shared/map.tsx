"use client";
import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import LayerGroup from "ol/layer/Group";
import OSM from "ol/source/OSM";
import { BaseLayerOptions, GroupLayerOptions } from "ol-layerswitcher";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import { all, bbox as bboxStrategy } from "ol/loadingstrategy.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import {
  geoServerBaseUrl,
  getBasemapOverlaysLayersArray,
} from "@/requests/requests";
import "./CSS/LayerSwitcherStyles.css";
import { Stroke, Fill, Style, Circle } from "ol/style";
import OccurrencePopup from "../map/occurrence_popup";
import FilterSection from "../filters/filtersection";
import { IconButton, Tooltip } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import "../filters/filterSectionStyles.css";
import {
  addAreaInteractions,
  buildAreaSelectionLayer,
  removeAreaInteractions,
} from "./pointUtils";

function Newmap() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [popoverContent, setPopoverContent] = React.useState<{
    [x: string]: any;
  }>({});
  const open = Boolean(anchorEl);
  const id = open ? "feature-popover" : undefined;
  const [map, setMap] = useState<Map | undefined>(); // Specify the type using a generic type argument
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | undefined>(undefined);
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedByArea, setSelectedByArea] = useState("");

  const handleSelectByAreaData = (dataFromChild: any) => {
    // Handle the data received from the child component
    if (dataFromChild === "Box") {
      setSelectedByArea("Polygon");
    } else {
      setSelectedByArea(dataFromChild);
    }
  };

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
      event.stopPropagation(); // Stop the click event from reaching the parent accordion
    };

  const handleClosePopover = () => {
    if (anchorEl) {
      anchorEl.remove(); // This removes the dummy anchor from the DOM
    }
    setAnchorEl(null);
  };
  mapRef.current = map;

  const occurrenceSource = new VectorSource({
    format: new GeoJSON(),
    url:
      geoServerBaseUrl +
      "/geoserver/vector/ows?service=WFS&version=" +
      "1.0.0&request=GetFeature&typeName" +
      "=vector%3Aoccurrence&maxFeatures=50&outputFormat=application%2Fjson",
    strategy: all,
  });

  const fill = new Fill({
    color: "rgba(2,255,2,1)",
  });
  const stroke = new Stroke({
    color: "#222",
    width: 1.25,
  });

  const occurrenceLayer = new VectorLayer({
    title: "Occurrence Layer",
    visible: true,
    preload: Infinity,
    source: occurrenceSource,
    style: new Style({
      image: new Circle({
        fill: fill,
        stroke: stroke,
        radius: 8,
      }),
      fill: fill,
      stroke: stroke,
    }),
  } as BaseLayerOptions);
  occurrenceLayer.set("area-select", true);

  const occurrenceGroup = new LayerGroup({
    title: "Occurrence",
    layers: [occurrenceLayer],
  } as GroupLayerOptions);

  useEffect(() => {
    getBasemapOverlaysLayersArray("basemaps").then((baseMapsArray) => {
      getBasemapOverlaysLayersArray("overlays").then((overlaysArray) => {
        const BaseMaps = new LayerGroup({
          title: "Base Maps",
          layers: baseMapsArray,
        } as GroupLayerOptions);

        const Overlays = new LayerGroup({
          title: "Overlays",
          layers: overlaysArray,
        } as GroupLayerOptions);

        if (BaseMaps) {
          if (Overlays) {
            const initialMap = new Map({
              target: "map-container",
              layers: [BaseMaps, Overlays, occurrenceGroup],
              view: new View({
                center: [0, 0],
                zoom: 4,
              }),
            });
            const layerSwitcher = new LayerSwitcher();
            initialMap.addControl(layerSwitcher);

            if (selectedByArea) {
              addAreaInteractions(initialMap, selectedByArea);
            } else {
              removeAreaInteractions(initialMap);
            }

            const handleMapClick = (event: any) => {
              console.log("handle map click before checking if map is defined");

              // if (map) {
              console.log("map defined");
              initialMap.forEachFeatureAtPixel(
                event.pixel,
                (feature, layer) => {
                  if (layer === occurrenceLayer) {
                    console.log("Point clicked");

                    // Create a reference to the dummy HTML element for Popover anchor
                    const dummyAnchor = document.createElement("div");
                    dummyAnchor.style.position = "absolute";

                    // Adjust the position of the dummy anchor to be on the right side and vertically centered
                    // You need to know the width of the map container, assuming it's available in mapContainerWidth
                    const mapContainerWidth = mapElement.current
                      ? mapElement.current.offsetWidth
                      : 0;
                    const verticalCenter = mapElement.current
                      ? mapElement.current.offsetHeight / 2
                      : 0;

                    dummyAnchor.style.left = `${
                      mapContainerWidth - dummyAnchor.offsetWidth
                    }px`;
                    dummyAnchor.style.top = `${
                      verticalCenter - dummyAnchor.offsetHeight / 2
                    }px`;

                    // Append the dummy anchor to the map element
                    if (mapElement.current) {
                      mapElement.current.appendChild(dummyAnchor);
                    }

                    // Set the state for Popover content and anchor
                    setPopoverContent(feature.getProperties());
                    setAnchorEl(dummyAnchor);

                    // Return true to stop the forEach loop if needed
                    return true;
                  }
                }
              );
              // }
            };

            initialMap.on("singleclick", handleMapClick);

            setMap(initialMap);
          }
        }
      });
    });

    const layerSwitcher = new LayerSwitcher();
    if (map) {
      map.addControl(layerSwitcher);
    }
  }, [selectedByArea]);

  // useEffect(() => {
  //   if (!map) {
  //     return;
  //   }

  //   console.log("Hello, its trickered..");
  //   console.log("slectAreaVar: " + selectedByArea);

  //   if (selectedByArea) {
  //     addAreaInteractions(map, selectedByArea);
  //   } else {
  //     removeAreaInteractions(map);
  //   }
  // }, [selectedByArea]);

  return (
    <>
      <div
        style={{ height: "calc(100vh - 70px)" }}
        ref={mapElement}
        className="map-container"
        id="map-container"
      >
        <div>
          {filterOpen && (
            <FilterSection
              onSelectByAreaData={handleSelectByAreaData}
              openFilter={filterOpen}
            />
          )}

          <div className="filter-section">
            <Tooltip title={filterOpen ? "Hide Filters" : "Show Filters"} arrow>
              <IconButton
                onClick={() => setFilterOpen(!filterOpen)}
                className="custom-icon-button"
                style={{ color: "white" }}
              >
                <TuneIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>

      <OccurrencePopup
        id={id}
        open={open}
        anchorEl={anchorEl}
        handleClose={handleClosePopover}
        popoverContent={popoverContent}
        expanded={expanded}
        handleChange={handleChange}
      />
    </>
  );
}

export default Newmap;
