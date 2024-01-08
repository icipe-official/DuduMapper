"use client";
import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import LayerGroup from "ol/layer/Group";
import { BaseLayerOptions, GroupLayerOptions } from "ol-layerswitcher";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import { bbox as bboxStrategy } from "ol/loadingstrategy.js";
import { Vector as VectorLayer } from "ol/layer.js";
import {
    geoServerBaseUrl,
    getBasemapOverlaysLayersArray,
} from "@/api/requests";
import { Stroke, Fill, Style, Circle } from "ol/style";
import "../shared/CSS/LayerSwitcherStyles.css";
import OccurrencePopup from "../popup/OccurrenceDrawer";
import FilterSection from "../filters/filtersection";
import { IconButton, Tooltip } from "@mui/material";
import "../filters/filterSectionStyles.css";
import TuneIcon from "@mui/icons-material/Tune";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

function Newmap() {

    const mapRef = useRef<Map>()
    const [popoverContent, setPopoverContent] = React.useState<{
        [x: string]: any;
    }>({});
    const [map, setMap] = useState<Map | undefined>(); // Specify the type using a generic type argument
    const mapElement = useRef<HTMLDivElement>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [showOccurrencePopup, setShowOccurrencePopup] = useState(false);

    const occurrenceSource = new VectorSource({
        format: new GeoJSON(),
        url:
            geoServerBaseUrl +
            "/geoserver/vector/ows?service=WFS&version=" +
            "1.0.0&request=GetFeature&typeName" +
            "=vector%3Aoccurrence&maxFeatures=10000&outputFormat=application%2Fjson",
        strategy: bboxStrategy,
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

    const occurrenceGroup = new LayerGroup({
        title: "Occurrence",
        layers: [occurrenceLayer],
    } as GroupLayerOptions);

    const handleClosePopup = () => {
        setShowOccurrencePopup(false);
    };

    useEffect(() => {
        getBasemapOverlaysLayersArray("basemaps").then((baseMapsArray) => {
            getBasemapOverlaysLayersArray("overlays").then((overlaysArray) => {
                const BaseMaps = new LayerGroup({
                    title: "Basemaps",
                    layers: baseMapsArray,
                } as GroupLayerOptions);

                const Overlays = new LayerGroup({
                    title: "Labels",
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
                        initialMap.on("singleclick", handleMapClick);
                        mapRef.current = initialMap;
                        setMap(initialMap);
                    }
                }
            });
        });
    }, []);

    const handleMapClick = (event: any) => {
        console.log("Map single click triggered");
        mapRef.current?.forEachFeatureAtPixel(
            event.pixel,
            (feature, layer) => {
                if (layer === occurrenceLayer) {
                    console.log("Point clicked");


                    setPopoverContent(feature.getProperties());
                    setShowOccurrencePopup(true);
                    // Return true to stop the forEach loop if needed
                    return true;
                }
            }
        );
    };

    return (
        <QueryClientProvider client={queryClient}>
            <div style={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
                <div
                    style={{ flexGrow: 1, width: showOccurrencePopup ? '70%' : '100%' }}
                    ref={mapElement}
                    className="map-container"
                    id="map-container"
                >
                    <div>
                        {filterOpen && <FilterSection openFilter={filterOpen} />}

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

                {showOccurrencePopup && (
                    <OccurrencePopup
                        id={'feature_popover'}
                        handleClose={handleClosePopup}
                        popoverContent={popoverContent}
                    />
                )}
            </div>
        </QueryClientProvider>
    );
}

export default Newmap;
