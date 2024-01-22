"use client";
import React, { useEffect, useRef, useState } from "react";
import { Feature, Map as OlMap, View } from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import LayerGroup from "ol/layer/Group";
import { BaseLayerOptions, GroupLayerOptions } from "ol-layerswitcher";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import { bbox as bboxStrategy } from "ol/loadingstrategy.js";
import { Vector as VectorLayer } from "ol/layer.js";
import { getBasemapOverlaysLayersArray } from "@/api/requests";
import { Stroke, Fill, Style, Circle } from "ol/style";
import "../shared/CSS/LayerSwitcherStyles.css";
import OccurrencePopup from "../popup/OccurrenceDrawer";
import "../filters/filterSectionStyles.css";
import "../filters/filter_section_dev.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import OccurrenceFilter from "@/components/filters/OccurrenceFilter";
import TimeSlider from "@/components/filters/TimeSlider";
import OpenFilterButton from "@/components/filters/OpenFilterButton";
import { getOccurrence } from "../../api/occurrence";
import { Alert, IconButton, Snackbar, Tooltip } from "@mui/material";
import RenderFeature from "ol/render/Feature";
import { Geometry } from "ol/geom";
import PrintIcon from "@mui/icons-material/Print";

function Newmap() {
  const queryClient = useQueryClient();
  const mapRef = useRef<OlMap>();
  const [popoverContent, setPopoverContent] = React.useState<{
    [x: string]: any;
  }>({});
  const [map, setMap] = useState<OlMap | undefined>(); // Specify the type using a generic type argument
  const mapElement = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = React.useState(false);

  const [showOccurrencePopup, setShowOccurrencePopup] = useState(false);
  const [filterConditionsObj, setFilterConditionsObj] = useState<{
    [keys: string]: any;
  }>({
    species: "",
    period: "",
    country: "",
  });
  const [cqlFilter, setCqlFilter] = useState("");
  const speciesColors = [
    "#b48ead",
    "#a3be8c",
    "#a3be8c",
    "#d08770",
    "#bf616a",
    "#5e81ac",
    "#5e81ac",
  ];
  const [occurrenceSource, setOccurrenceSource] = useState<VectorSource>(
    new VectorSource({
      format: new GeoJSON(),
      features: [],
      strategy: bboxStrategy,
    })
  );
  const [zoomArea, setZoomArea] = useState<[number, number, number, number]>();

  const {
    status,
    data: occurrenceData,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["occurrences", cqlFilter], //Example CQl filter species IN ('gambie', 'finiestus', 'fini') AND WITHIN (the_geom, MULTIPOLYGON((22,22,223,223))) AND adult =true AND season=dry
    //queryFn: getOccurrences
    queryFn: ({ queryKey }) => getOccurrence(queryKey),
  });

  useEffect(() => {
    if (Object.keys(filterConditionsObj).length === 0) {
      return;
    }
    //join the filter conditions into one string using the AND CQL clause conditions and add the date filter
    let filterConditions: string[] = Object.values(filterConditionsObj);
    filterConditions = filterConditions.filter((c) => c);
    const cql_filter = filterConditions.join(" AND ");
    setCqlFilter(cql_filter);
  }, [filterConditionsObj]);

  const updateFilterConditions = (conditions: any) => {
    setFilterConditionsObj({
      ...filterConditionsObj,
      species: conditions["species"],
      country: conditions["country"],
    });
  };

  const resetOccurrence = () => {
    setCqlFilter("");
  };

  const handleTimeChange = (startYear: number, endYear: number) => {
    const condition = `start_year >= ${startYear} AND end_year <= ${endYear} `;
    setFilterConditionsObj({
      ...filterConditionsObj,
      period: condition,
    });
  };

  if (status === "success") {
    const total = occurrenceData["totalFeatures"];
    const returned = occurrenceData["numberReturned"];
    console.log(`${returned} out of ${total} features`);

    occurrenceSource?.clear();
    const geoJsonFormat = new GeoJSON({
      extractGeometryName: true,
      featureClass: Feature,
      featureProjection: "EPSG:3857",
    });
    //Externalize this to a utils service file somewhere else
    const geojsonData = geoJsonFormat.readFeatures(occurrenceData, {
      featureProjection: "EPSG:3857",
    }) as unknown;
    const featureGeojson = geojsonData as Feature<Geometry>[];

    occurrenceSource?.addFeatures(featureGeojson);
    //TODO zoom to occurrenceSource extent can also be implemented here
    //const extent = occurrenceSource.getExtent();
    //mapRef.current?.getView().fit(extent)
    //END alternative to funtion handleSelectedCountryBbox below
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

  const occurrenceGroup = new LayerGroup({
    title: "Occurrence",
    layers: [occurrenceLayer],
  } as GroupLayerOptions);

  const handleClosePopup = () => {
    setShowOccurrencePopup(false);
  };

  // const handleSelectedCountryBbox = (countryBbox: [number, number, number, number]) => {
  //     if(countryBbox) {
  //         setZoomArea(countryBbox)
  //         //TODO implement zoom to country
  //         mapRef.current?.getView().fit(countryBbox)
  //     }
  // }

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
            const initialMap = new OlMap({
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

  const printToScale = () => {
    console.log("Button clicked!");

    if (map) {
      console.log("Map is available");

      const resolutionChangeListener = () => {
        console.log("Inside resolutionChangeListener");

        const mapCanvas = document.createElement("canvas");
        const size = map.getSize();
        if (!size || size.length < 2) {
          return;
        }
        mapCanvas.width = size[0];
        mapCanvas.height = size[1];
        const mapContext = mapCanvas.getContext("2d");
        if (!mapContext) {
          return;
        }

        // Draw the legend onto the map canvas
        const legendDiv = document.querySelector(".legend-container");
        if (legendDiv) {
          // Create a temporary anchor element
          const tempAnchor = document.createElement("a");
          tempAnchor.href = `data:image/svg+xml;base64,${btoa(
            new XMLSerializer().serializeToString(legendDiv)
          )}`;
          tempAnchor.download = "legend.png"; // Specify the download filename

          // Append the anchor to the document body
          document.body.appendChild(tempAnchor);

          // Trigger a click event to initiate the download
          tempAnchor.click();

          // Remove the temporary anchor from the document body
          document.body.removeChild(tempAnchor);
        }

        // Capture other layers
        Array.prototype.forEach.call(
          map
            .getViewport()
            .querySelectorAll(".ol-layer canvas, canvas.ol-layer"),
          function (canvas) {
            if (canvas.width > 0) {
              const opacity =
                canvas.parentNode?.style.opacity || canvas.style.opacity;
              mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
              let matrix;
              const transform = canvas.style.transform;

              if (transform) {
                matrix = transform
                  .match(/^matrix\(([^\(]*)\)$/)[1]
                  .split(",")
                  .map(Number);
              } else {
                matrix = [
                  parseFloat(canvas.style.width) / canvas.width,
                  0,
                  0,
                  parseFloat(canvas.style.height) / canvas.height,
                  0,
                  0,
                ];
              }
              CanvasRenderingContext2D.prototype.setTransform.apply(
                mapContext,
                matrix
              );
              const backgroundColor = canvas.parentNode?.style.backgroundColor;
              if (backgroundColor) {
                mapContext.fillStyle = backgroundColor;
                mapContext.fillRect(0, 0, canvas.width, canvas.height);
              }

              mapContext.drawImage(canvas, 0, 0);
            }
          }
        );

        mapContext.globalAlpha = 1;
        mapContext.setTransform(1, 0, 0, 1, 0, 0);

        // Set the download link's href attribute
        const link = document.getElementById(
          "image-download"
        ) as HTMLAnchorElement | null;
        if (link != null) {
          link.href = mapCanvas.toDataURL();
          // Trigger a click event to download
          link.click();
        }

        // Remove the listener after capturing the map
        map.un("postrender", resolutionChangeListener);
      };

      // Attach the listener to 'postrender' event
      map.on("postrender", resolutionChangeListener);

      // Trigger a render to ensure the listener is called
      map.renderSync();
    } else {
      console.log("Map is not available");
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 70px)" }}>
      <div
        style={{ flexGrow: 1, width: showOccurrencePopup ? "70%" : "100%" }}
        ref={mapElement}
        className="map-container"
        id="map-container"
      >
        <div className="filter-dev-button">
          <OpenFilterButton
            filterOpen={filterOpen}
            onClick={() => setFilterOpen(!filterOpen)}
          />
        </div>
        <div>
          {filterOpen && (
            <OccurrenceFilter
              open={filterOpen}
              handleFilterConditions={updateFilterConditions}
              onClearFilter={resetOccurrence}
            />
          )}
        </div>
      </div>
      <div
        className="print-section"
        style={{
          position: "absolute",
          top: "270px",
          left: "12px",
          alignItems: "center",
          transform: "translateX(0%)",
          zIndex: 900,
          borderRadius: "15px",
        }}
      >
        <Tooltip title="Print map image" arrow>
          <IconButton onClick={printToScale}>
            <PrintIcon
              style={{
                color: "#ebbd40",
                fontWeight: "bold",

                // border: "2px solid white",
              }}
            />
          </IconButton>
        </Tooltip>
        <a
          id="image-download"
          style={{ display: "none" }}
          download="printed_map.png"
        ></a>
      </div>

      {showOccurrencePopup && (
        <OccurrencePopup
          id={"feature_popover"}
          handleClose={handleClosePopup}
          popoverContent={popoverContent}
        />
      )}
      <div>
        <TimeSlider onChange={handleTimeChange} />
      </div>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={isFetching}
        message="Loading occurrence..."
      />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={isError}
        message="Error Loading occurrence!"
      >
        <Alert severity="error" variant="filled" sx={{ width: "100%" }}>
          Error while fetching occurrence
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Newmap;
