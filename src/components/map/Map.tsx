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
import {Stroke, Fill, Style, Circle} from "ol/style";
import "../shared/CSS/LayerSwitcherStyles.css";
import OccurrencePopup from "../popup/OccurrenceDrawer";
import FilterSection from "../filters/filtersection";
import {IconButton, Tooltip} from "@mui/material";
import "../filters/filterSectionStyles.css";
import TuneIcon from "@mui/icons-material/Tune";
import {QueryClient, QueryClientProvider, useQuery, useQueryClient} from "@tanstack/react-query";
import OccurrenceFilter from "@/components/filters/OccurrenceFilter";
import TimeSlider from "@/components/filters/TimeSlider";

const queryClient = new QueryClient();

const OCCURRENCE_API = `${geoServerBaseUrl}/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector:occurrence&maxFeatures=10000&outputFormat=application/json`;
const getOccurrences = async (queryKey) => {
    console.log(queryKey[1])
    const params: string = queryKey[1]
    if (params) {
        console.log('Filtering occurrence on: ', params)
        const url = `${OCCURRENCE_API}&cql_filter=${params}`;
        console.log(url)
        const response = await fetch(url)
        return response.json();
    }
    const response = await fetch(`${OCCURRENCE_API}`)
    return response.json();
}

function Newmap() {
    const queryClient = useQueryClient();
    const mapRef = useRef<Map>()
    const [popoverContent, setPopoverContent] = React.useState<{
        [x: string]: any;
    }>({});
    const [map, setMap] = useState<Map | undefined>(); // Specify the type using a generic type argument
    const mapElement = useRef<HTMLDivElement>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [showOccurrencePopup, setShowOccurrencePopup] = useState(false);
    const [cqlFilter, setCqlFilter] = useState(null)


    const [selectedPeriod, setSelectedPeriod] = useState<[number, number]>([
        1970,
        new Date().getFullYear(),
    ]);

    const {
        status,
        data: occurrenceData,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: ["occurrences", cqlFilter], //Example CQl filter species IN ('gambie', 'finiestus', 'fini') AND WITHIN (the_geom, MULTIPOLYGON((22,22,223,223))) AND adult =true AND season=dry
        //queryFn: getOccurrences
        queryFn: ({queryKey}) => getOccurrences(queryKey)
    });

    const updateFilterConditions = (filterConditions: any) => {

        //join the filter conditions into one string using the AND CQL clause conditions and add the date filter
        console.log('Conditions', filterConditions)
        const cql_filter = filterConditions.join('AND');
        console.log('CQL Filter', cql_filter)
        setCqlFilter(cql_filter)
    }

    const isValidDate = (date: Date) => {
        return !isNaN(date.getTime());
    };
    const handleTimeChange = (startDate: Date, endDate: Date) => {
        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return;
        }
        setSelectedPeriod([startDate.getFullYear(), endDate.getFullYear()]);
    };



    if (isFetching) {
        console.log('Loading occurrences...')
    }
    if (isError) {
        console.log('Error', error)
    }
    if (status === 'success') {
        const total = occurrenceData['totalFeatures']
        const returned = occurrenceData['numberReturned']
        console.log(`${returned} out of ${total} features`)


        const occLayer = new VectorLayer({
            source: new VectorSource({
                features: new GeoJSON().readFeatures(occurrenceData),
            }),

        })
        console.log('Occurrence Layer', occLayer)
        const occurrence2 = new LayerGroup({
            title: "Occurrence 2",
            layers: [occLayer],
        } as GroupLayerOptions);
        console.log('Adding occurrence to map', mapRef.current)
        if (map && map instanceof Map) {
            map.addLayer(occurrence2)
        }
    }

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
        <div style={{display: 'flex', height: 'calc(100vh - 70px)'}}>
            <div
                style={{flexGrow: 1, width: showOccurrencePopup ? '70%' : '100%'}}
                ref={mapElement}
                className="map-container"
                id="map-container"
            >
                <div>
                    {filterOpen && <OccurrenceFilter open={filterOpen} handleFilterConditions={updateFilterConditions}/>}

                    <div className="filter-section">
                        <Tooltip title={filterOpen ? "Hide Filters" : "Show Filters"} arrow>
                            <IconButton
                                className="custom-icon-button"
                                style={{color: "white"}}
                                onClick={() => setFilterOpen(!filterOpen)}
                            >
                                <TuneIcon/>
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
            {/*<div className="time-slider-container">*/}
            {/*    <TimeSlider onChange={handleTimeChange}/>*/}
            {/*</div>*/}

        </div>
    );
}

export default Newmap;
