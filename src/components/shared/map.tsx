"use client";
import React, {useEffect, useRef, useState} from "react";
import {Map, View} from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import LayerGroup from "ol/layer/Group";
import {BaseLayerOptions, GroupLayerOptions} from "ol-layerswitcher";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import {bbox as bboxStrategy} from "ol/loadingstrategy.js";
import {Vector as VectorLayer} from "ol/layer.js";
import {
    geoServerBaseUrl,
    getBasemapOverlaysLayersArray,
} from "@/api/requests";
import "./CSS/LayerSwitcherStyles.css";
import {Stroke, Fill, Style, Circle} from "ol/style";
import OccurrencePopup from "../popup/OccurrencePopup";
import FilterSection from "../filters/filtersection";
import {IconButton, Tooltip} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import "../filters/filterSectionStyles.css";
import "../overlays/overlays.css"
import {
    QueryClient,
    QueryClientProvider,
} from 'react-query'
import {Control, defaults as defaultControls, Zoom} from "ol/control";
import {createRoot} from "react-dom/client";
import OverlaysButton from "@/components/overlays/OverlaysButton";
import Bar from "ol-ext/control/Bar";
import LayersIcon from "@mui/icons-material/Layers";
import OverlaysPopper from "@/components/overlays/OverlaysPopper";

const queryClient = new QueryClient()

function Newmap() {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [popoverContent, setPopoverContent] = React.useState<{
        [x: string]: any;
    }>({});
    const open = Boolean(anchorEl);
    const id = open ? "feature-popover" : undefined;
    const [map, setMap] = useState<Map | undefined>(); // Specify the type using a generic type argument
    const mapElement = useRef<HTMLDivElement>();
    const mapRef = useRef<Map | undefined>(undefined);
    const [filterOpen, setFilterOpen] = useState(false);
    const [popup, setPopup] = useState({maxHeight: "400px", height: "500px"})
    const [overlaysOpen, setOverlaysOpen] = useState(false)

    const handleClosePopover = () => {
        if (anchorEl) {
            anchorEl.remove(); // This removes the dummy anchor from the DOM
        }
        setAnchorEl(null);
        setPopoverContent({})
    };




    const occurrenceSource = new VectorSource({
        format: new GeoJSON(),
        url:
            geoServerBaseUrl +
            "/geoserver/vector/ows?service=WFS&version=" +
            "1.0.0&request=GetFeature&typeName" +
            "=vector%3Aoccurrence&maxFeatures=50&outputFormat=application%2Fjson",
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

                const overlayDiv = document.createElement('div');
                const root = createRoot(overlayDiv);
                root.render(<OverlaysButton overlayOpen={true}/>);
                const overlayControl = new Control({element: overlayDiv},);

                if (BaseMaps) {
                    if (Overlays) {
                        const initialMap = new Map({
                            target: "map-container",
                            layers: [BaseMaps, Overlays, occurrenceGroup],
                            view: new View({
                                center: [0, 0],
                                zoom: 4,
                            }),
                            controls: defaultControls({
                                zoom: false,
                                rotate: false
                            }).extend([
                                overlayControl,
                                new Zoom({})
                            ])
                        });
                        const layerSwitcher = new LayerSwitcher();
                        initialMap.addControl(layerSwitcher);

                        //overlayControl.setPositioning("bottom-left")
                        //initialMap.addControl(overlayControl);


                        // Create a toolbar
                        const toolBar = new Bar();
                        toolBar.setPosition("top")
                        toolBar.addControl(overlayControl)
                        //initialMap.addControl(toolBar);

                        const handleMapClick = (event: any) => {
                            initialMap.forEachFeatureAtPixel(
                                event.pixel,
                                (feature, layer) => {
                                    if (layer === occurrenceLayer) {

                                        // Create a reference to the dummy HTML element for Popover anchor
                                        const popupAnchor = document.createElement("div");
                                        popupAnchor.style.position = "absolute";

                                        // Adjust the position of the dummy anchor to be on the right side and vertically centered
                                        // You need to know the width of the map container, assuming it's available in mapContainerWidth
                                        const mapContainerWidth = mapElement.current
                                            ? mapElement.current?.offsetWidth
                                            : 0;

                                        const verticalCenter = mapElement.current
                                            ? mapElement.current?.offsetHeight
                                            : 0;
                                        popup.maxHeight = mapElement.current?.offsetHeight * 0.5
                                        popup.height = mapElement.current?.offsetHeight * 0.5
                                        popupAnchor.style.left = `${
                                            mapContainerWidth - popupAnchor.offsetWidth
                                        }px`;
                                        popupAnchor.style.top = `${
                                            verticalCenter / 4
                                        }px`;

                                        // Append the dummy anchor to the map element
                                        if (mapElement.current) {
                                            mapElement.current?.appendChild(popupAnchor);
                                        }

                                        // Set the state for Popover content and anchor
                                        setPopoverContent(feature.getProperties());
                                        setAnchorEl(popupAnchor);

                                        // Return true to stop the forEach loop if needed
                                        return true;
                                    }
                                }
                            );
                        };

                        initialMap.on("singleclick", handleMapClick);
                        mapRef.current = initialMap;
                    }
                }
            });
        });
    }, [popup]);


    //Load overlays and add to Overlays component
    useEffect(() => {
        const overlaysList = getBasemapOverlaysLayersArray("overlays");

        //mapRef.current?.addControl()
    })

    return (
        <QueryClientProvider client={queryClient}>
            <div
                style={{height: "calc(100vh - 70px)"}}
                ref={mapElement}
                className="map-container"
                id="map-container"
            >
                {filterOpen && <FilterSection openFilter={filterOpen}/>}
                {overlaysOpen && <OverlaysPopper open={overlaysOpen}/>}

                <div className="filter-section">
                    <Tooltip title={filterOpen ? "Hide Filters" : "Show Filters"} arrow>
                        <IconButton
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="custom-icon-button"
                            style={{color: "white"}}
                        >
                            <TuneIcon/>
                        </IconButton>
                    </Tooltip>
                </div>
                <div className="overlays-button">
                    <Tooltip title={filterOpen ? "Show Overlays" : "Hide Overlays"} arrow>
                        <IconButton
                            onClick={() => setOverlaysOpen(!overlaysOpen)}
                            className="custom-icon-button"
                            style={{color: "white"}}
                        >
                            <LayersIcon/>
                        </IconButton>
                    </Tooltip>
                </div>

                <OccurrencePopup
                    id={id}
                    anchorEl={anchorEl}
                    handleClose={handleClosePopover}
                    speciesData={popoverContent}
                />
            </div>
        </QueryClientProvider>
    );
}

export default Newmap;
