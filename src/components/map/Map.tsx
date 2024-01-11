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
import { Draw, Modify, Snap } from "ol/interaction.js";
import turf from "@turf/turf";

const queryClient = new QueryClient();

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
  const [map, setMap] = useState<Map | undefined>(); // Specify the type using a generic type argument
  const mapElement = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showOccurrencePopup, setShowOccurrencePopup] = useState(false);
  const [filterConditions, setFilterContions] = useState<[]>();
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
    const cql_filter = filterConditions?.join("AND");
    console.log("CQL Filter", cql_filter);
    setCqlFilter(cql_filter);
  }, [filterConditions]);

  const updateFilterConditions = (conditions: any) => {
    //join the filter conditions into one string using the AND CQL clause conditions and add the date filter
    setFilterContions(conditions);
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
  const handleSpeciesStyling = (species: string[]) => {

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

  useEffect(() => {
    if (!map) {
      return;
    }

    const addAreaInteractions = (selectedByArea: any) => {
      const areaSelect = map
        ?.getAllLayers()
        .find((l) => l.get("occurrence-data"));
      const source = areaSelect?.getSource() as VectorSource;

      let draw = new Draw({
        source: source,
        type: selectedByArea,
        // freehandCondition: never,
      });

      draw.on("drawend", (e) => {
        const geom = e.feature.getGeometry() as SimpleGeometry;
        //const coords = geom?.getCoordinates();

        const shapewgs84 = turf.toWgs84(geom);
        console.log("WGS84 shape", shapewgs84);
        const shapeWkt = wellknown.stringify(shapewgs84);
        console.log("WKT shape", shapeWkt);
        filterConditions?.push(shapeWkt);
        // if (coords && coords.length > 0) {
        //   setCordinateArray(
        //     coords[0].map((c: Coordinate) =>
        //       transform(c, "EPSG:3857", "EPSG:4326")
        //     )
        //   );
        // }
      });
      map?.addInteraction(draw);
      //   let snap = new Snap({ source: source });
      //   map?.addInteraction(snap);
    };

    // const removeAreaInteractions = (map: Map) => {
    //   map.removeInteraction(modify);
    //   map.removeInteraction(draw);
    //   map.removeInteraction(snap);
    // };

    console.log("Selected Area Type:", areaSelected);
    // console.log("selectedByArea:", selectedByArea);
    const areaTypes = ["Polygon", "Circle", "Rectangle"];
    //if (areaSelected && areaTypes.includes(areaSelected)) {
    addAreaInteractions("Polygon");
    console.log("Added Interaction");
    // }

    //else {
    //   console.log("Value Not Passed...");
    //   // removeAreaInteractions(map);
    // }
  }, [areaSelected, map]);

  const handleAreaDrawn = (areaType: string) => {
    setAreaSelected(areaType);
  };

  //   useEffect(() => {
  //     console.log("selected coordinates", cordinateArray);
  //     const getFeatureStyle = (feature: any) => {
  //       const style = new Style({
  //         image: new Circle({
  //           radius: 8,
  //           fill: new Fill({
  //             color: "green",
  //           }),
  //           stroke: new Stroke({
  //             color: "black",
  //             width: 2,
  //           }),
  //         }),
  //       });
  //       return style;
  //     };
  //     const existingOccurrenceLayer = map
  //       ?.getLayers()
  //       .getArray()
  //       .find((layer) => {
  //         return layer.get("occurrence-data") === true;
  //       });
  //     if (
  //       existingOccurrenceLayer &&
  //       existingOccurrenceLayer instanceof VectorLayer
  //     ) {
  //       const occurrenceSource = existingOccurrenceLayer.getSource();
  //       const filteredFeatures = occurrenceData.filter((feature) => {
  //         const cordinates = feature.geometry.coordinates;
  //         //Check for equality instead of using includes

  //         const isInBound = booleanPointInPolygon(
  //           turf.point(cordinates),
  //           turf.polygon([cordinateArray])
  //         );

  //         if (isInBound) {
  //           return cordinates;
  //         }
  //       });
  //       console.log("filtered Coordinates", filteredFeatures);
  //       // Filter features based on selectedCountry
  //       occurrenceSource.clear();
  //       occurrenceSource.addFeatures(
  //         new GeoJSON()
  //           .readFeatures(responseToGEOJSON(filteredFeatures), {
  //             featureProjection: "EPSG:3857",
  //           })
  //           .map((feature) => {
  //             feature.setStyle(getFeatureStyle(feature));
  //             return feature;
  //           })
  //       );
  //       // Refresh the map
  //       map?.render();
  //     }
  //   }, [cordinateArray]);

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
