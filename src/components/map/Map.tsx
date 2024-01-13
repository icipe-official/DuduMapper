"use client";
import React, { useEffect, useRef, useState } from "react";
import Map from "ol/Map.js";
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
import { IconButton, Tooltip } from "@mui/material";
import "../filters/filterSectionStyles.css";
import TuneIcon from "@mui/icons-material/Tune";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import OccurrenceFilter from "@/components/filters/OccurrenceFilter";
import TimeSlider from "@/components/filters/TimeSlider";
import { transform } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import SimpleGeometry from "ol/geom/SimpleGeometry";
import Draw from "ol/interaction/Draw.js";
import * as turf from "@turf/turf";
import { never } from "ol/events/condition";
import wellknown from "wellknown";
import View from "ol/View";
import toWgs84 from "@turf/projection";

let draw: Draw;

const OCCURRENCE_API = `${geoServerBaseUrl}/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector:occurrence&maxFeatures=10000&outputFormat=application/json`;
const getOccurrences = async (queryKey) => {
  console.log(queryKey[1]);
  const params: string = queryKey[1];
  if (params) {
    console.log("Filtering occurrence on: ", params);
    const url = `${OCCURRENCE_API}&cql_filter=${params}`;
    console.log(url);
    const response = await fetch(url);
    return response.json();
  }
  console.log("Loading all occurrence");
  const response = await fetch(`${OCCURRENCE_API}`);
  return response.json();
};

function Newmap() {
  const queryClient = useQueryClient();
  const mapRef = useRef<Map>();
  const [popoverContent, setPopoverContent] = React.useState<{
    [x: string]: any;
  }>({});
  const [map, setMap] = useState<Map>(); // Specify the type using a generic type argument
  const mapElement = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showOccurrencePopup, setShowOccurrencePopup] = useState(false);
  const [filterConditions, setFilterContions] = useState<string[]>([]);
  const [cqlFilter, setCqlFilter] = useState<string>();
  const [areaSelected, setAreaSelected] = useState<string>("");
  const [cordinateArray, setCordinateArray] = useState<Coordinate[][]>([]);

  const [selectedPeriod, setSelectedPeriod] = useState<[number, number]>([
    1970,
    new Date().getFullYear(),
  ]);

  const [occurrenceSource, setOccurrenceSource] = useState(
    new VectorSource({
      format: new GeoJSON(),
      features: [],
      strategy: bboxStrategy,
    })
  );

  const {
    status,
    data: occurrenceData,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["occurrences", cqlFilter], //Example CQl filter species IN ('gambie', 'finiestus', 'fini') AND WITHIN (the_geom, MULTIPOLYGON((22,22,223,223))) AND adult =true AND season=dry
    //queryFn: getOccurrences
    queryFn: ({ queryKey }) => getOccurrences(queryKey),
  });

  useEffect(() => {
    console.log("Conditions", filterConditions);

    if (filterConditions?.length > 0) {
      const cql_filter = filterConditions.join(" AND ");
      console.log("CQL Filter", cql_filter);
      setCqlFilter(cql_filter);
    }
  }, [filterConditions]);

  const updateFilterConditions = (conditions: any) => {
    //join the filter conditions into one string using the AND CQL clause conditions and add the date filter
    if (filterConditions.length > 0) {
      const newFilterConditionsValue = [...filterConditions, conditions];
      setFilterContions(newFilterConditionsValue);
    } else {
      setFilterContions(conditions);
    }
  };

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
    console.log("Loading occurrences...");
  }
  if (isError) {
    console.log("Error", error);
  }

  if (status === "success") {
    const total = occurrenceData["totalFeatures"];
    const returned = occurrenceData["numberReturned"];
    console.log(`${returned} out of ${total} features`);

    occurrenceSource?.clear();
    occurrenceSource?.addFeatures(
      new GeoJSON().readFeatures(occurrenceData, {
        featureProjection: "EPSG:3857",
      })
    );
  }

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
  occurrenceLayer.set("occurrence-data", true);

  const occurrenceGroup = new LayerGroup({
    title: "Occurrence",
    layers: [occurrenceLayer],
  } as GroupLayerOptions);

  const handleClosePopup = () => {
    setShowOccurrencePopup(false);
  };

  //TODO Styling
  const handleSpeciesStyling = (species: string[]) => {};
  let mapLayers: Array<any> = [];

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
            mapLayers = [BaseMaps, Overlays, occurrenceGroup];
            const initialMap = new Map({
              target: "map-container",
              layers: mapLayers,
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

            //Area Interaction Test
            const addAreaInteractions = (initialMap: Map) => {
              const areaSelect = initialMap
                ?.getAllLayers()
                .find((l) => l.get("occurrence-data"));
              const source = areaSelect?.getSource() as VectorSource;

              draw = new Draw({
                source: source,
                type: "Polygon",
                //freehandCondition: never,
              });

              draw.on("drawend", (e) => {
                const geom = e.feature.getGeometry() as SimpleGeometry;
                const coords = geom?.getCoordinates();
                console.log("Geom", geom);

                if (coords && coords.length > 0) {
                  let thecordinateArray = [];

                  thecordinateArray = coords[0].map((c: Coordinate) =>
                    transform(c, "EPSG:3857", "EPSG:4326")
                  );

                  console.log("Coordinate...", thecordinateArray);
                  if (thecordinateArray.length > 0) {
                    const wktString = `MULTIPOLYGON(((${thecordinateArray
                      .map((coord: any) => coord.join(" "))
                      .join(", ")})))`;

                    const wktStringEdited = ` WITHIN(the_geom, ${wktString})`;
                    const updatedFilterCondition = [
                      ...filterConditions,
                      wktStringEdited,
                    ];
                    setFilterContions(updatedFilterCondition);
                  }
                }
              });
              initialMap?.addInteraction(draw);
            };

            // const areaTypes = ["Polygon", "Circle", "Box"];
            // if (areaSelected && areaTypes.includes(areaSelected)) {
            addAreaInteractions(initialMap);
            // } else {
            //   initialMap?.removeInteraction(draw);
            // }
          }
        }
      });
    });
  }, []);

  const handleMapClick = (event: any) => {
    console.log("Map single click triggered");
    mapRef.current?.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
      if (layer === occurrenceLayer) {
        console.log("Point clicked");

        setPopoverContent(feature.getProperties());
        setShowOccurrencePopup(true);
        // Return true to stop the forEach loop if needed
        return true;
      }
    });
  };

  //   useEffect(() => {
  //     if (!map) {
  //       return;
  //     }

  //     const addAreaInteractions = (map: Map) => {
  //       const areaSelect = map
  //         ?.getAllLayers()
  //         .find((l) => l.get("occurrence-data"));
  //       const source = areaSelect?.getSource() as VectorSource;

  //       draw = new Draw({
  //         source: source,
  //         type: "Polygon",
  //         //freehandCondition: never,
  //       });

  //       draw.on("drawend", (e) => {
  //         const geom = e.feature.getGeometry() as SimpleGeometry;
  //         const coords = geom?.getCoordinates();
  //         console.log("Geom", geom);

  //         if (coords && coords.length > 0) {
  //           let thecordinateArray = [];

  //           thecordinateArray = coords[0].map((c: Coordinate) =>
  //             transform(c, "EPSG:3857", "EPSG:4326")
  //           );

  //           console.log("Coordinate...", thecordinateArray);
  //           if (thecordinateArray.length > 0) {
  //             const wktString = `MULTIPOLYGON(((${thecordinateArray
  //               .map((coord: any) => coord.join(" "))
  //               .join(", ")})))`;

  //             const wktStringEdited = ` WITHIN(the_geom, ${wktString})`;
  //             const updatedFilterCondition = [
  //               ...filterConditions,
  //               wktStringEdited,
  //             ];
  //             setFilterContions(updatedFilterCondition);
  //           }
  //         }
  //       });
  //       map?.addInteraction(draw);
  //     };

  //     const areaTypes = ["Polygon", "Circle", "Box"];
  //     if (areaSelected && areaTypes.includes(areaSelected)) {
  //       addAreaInteractions(map);
  //     } else {
  //       map?.removeInteraction(draw);
  //     }
  //   }, [areaSelected, map]);

  const handleAreaDrawn = (areaType: string) => {
    setAreaSelected(areaType);
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 70px)" }}>
      <div
        style={{ flexGrow: 1, width: showOccurrencePopup ? "70%" : "100%" }}
        ref={mapElement}
        className="map-container"
        id="map-container"
      >
        <div>
          {filterOpen && (
            <OccurrenceFilter
              open={filterOpen}
              handleFilterConditions={updateFilterConditions}
              handleSelectedSpecies={handleSpeciesStyling}
              handleDrawArea={handleAreaDrawn}
            />
          )}

          <div className="filter-section">
            <Tooltip title={filterOpen ? "Hide Filters" : "Show Filters"} arrow>
              <IconButton
                className="custom-icon-button"
                style={{ color: "white" }}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <TuneIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>

      {showOccurrencePopup && (
        <OccurrencePopup
          id={"feature_popover"}
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
