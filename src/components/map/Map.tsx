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
import { getOccurrence } from "@/api/occurrence";
import {Alert, IconButton, Snackbar, Tooltip} from "@mui/material";
import RenderFeature from "ol/render/Feature";
import { Geometry, Polygon, SimpleGeometry } from "ol/geom";
import { transform } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import { Draw, Modify, Snap } from "ol/interaction.js";
import Map from "ol/Map";
import { never } from "ol/events/condition";
import colormap from "colormap";
import PrintIcon from '@mui/icons-material/Print'

let draw: Draw, snap: Snap, modify: Modify;
function Newmap() {

  const queryClient = useQueryClient();
  const mapRef = useRef<OlMap>();
  const [popoverContent, setPopoverContent] = React.useState<{
    [x: string]: any;
  }>({});
  const [map, setMap] = useState<OlMap | undefined>(); // Specify the type using a generic type argument
  const mapElement = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showOccurrencePopup, setShowOccurrencePopup] = useState(false);
  const [areaSelected, setAreaSelected] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [filterConditionsObj, setFilterConditionsObj] = useState<{
    [keys: string]: any;
  }>({
    species: "",
    period: "",
    country: "",
  });
  const [cqlFilter, setCqlFilter] = useState("");
  const [theOverlaysArray, setTheOverlaysArray] = useState<any>([]);
  const [theBaseMapsArray, setTheBaseMapsArray] = useState<any>([]);

  const [occurrenceSource, setOccurrenceSource] = useState<VectorSource>(
    new VectorSource({
      format: new GeoJSON(),
      features: [],
      strategy: bboxStrategy,
    })
  );
  const [zoomArea, setZoomArea] = useState<[number, number, number, number]>();

  const [speciesColors, setSpeciesColors] = useState<string[]>([
    "#DC267F",
    "#648FFF",
    "#785EF0",
    "#FE6100",
    "#FFB000",
    "#000000",
    "#FFFFFF",
  ]);
  const getColormapColors = (numColors: number): string[] => {
    return colormap({ colormap: "jet", nshades: numColors, format: "hex" });
  };
  const addColormapColorsIfNeeded = () => {
    const remainingColors = selectedSpecies.length - speciesColors.length;
    if (remainingColors > 0) {
      const newColors = getColormapColors(remainingColors);
      setSpeciesColors((prevColors) => [...prevColors, ...newColors]);
    }
  };

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

  function responseToGEOJSON(occurrenceData: any) {
    const geoJSONPoints = (occurrenceData || []).map((d: any) => {
      const coordinates = d.geometry.coordinates;
      return {
        type: "Feature",
        geometry: {
          type: d.geometry.type,
          coordinates: coordinates,
        },
        properties: d.properties,
      };
    });
    const geoJSONFeatureCollection = {
      type: "FeatureCollection",
      features: geoJSONPoints,
    };
    return geoJSONFeatureCollection;
  }

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
      bionomics: conditions["bionomics"],
    });
  };

  // const clearDropdown = () =>{
  //   setSelectedSpecies([]);
  // }

  const removeOccurence = ()=> {
    setCqlFilter("");
    setSelectedSpecies([])
    setFilterConditionsObj({
        species: "", // Reset species filter
        period: "", // Reset period filter
        country: "", // Reset country filter
        bionomics: "",
    });
  }

  const resetOccurrence = () => {
    setCqlFilter("");
    setFilterConditionsObj({
        species: selectedSpecies, // Reset species filter
        period: "", // Reset period filter
        country: "", // Reset country filter
    });
    // Additional logic to clear any other filter-related state variables if needed
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
    const featureArray = occurrenceData?.features || [];

    occurrenceSource?.clear();
    const geoJsonFormat = new GeoJSON({
      extractGeometryName: true,
      featureClass: Feature,
      featureProjection: "EPSG:3857",
    });
    //Externalize this to a utils service file somewhere else
    const geojsonData = geoJsonFormat.readFeatures(
      responseToGEOJSON(featureArray),
      {
        featureProjection: "EPSG:3857",
      }
    ) as unknown;
    const featureGeojson = geojsonData as Feature<Geometry>[];

    occurrenceSource?.addFeatures(featureGeojson);

    const extent = occurrenceSource.getExtent();
    if (returned != 0) {
      mapRef.current?.getView().fit(extent);
    }
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

  const handleClosePopup = () => {
    setShowOccurrencePopup(false);
  };

  const createCircleCoordinates = (
    center: any,
    radius: any,
    numSegments = 64
  ) => {
    const circleCoords = [];
    for (let i = 0; i < numSegments; i++) {
      const angle = (Math.PI * 2 * i) / numSegments;
      const x = center[0] + radius * Math.cos(angle);
      const y = center[1] + radius * Math.sin(angle);
      circleCoords.push(transform([x, y], "EPSG:3857", "EPSG:4326"));
    }
    circleCoords.push(circleCoords[0]); // Close the circle
    return circleCoords;
  };

  const removeAreaInteractions = (map: Map) => {
    map.removeInteraction(modify);
    map.removeInteraction(draw);
    map.removeInteraction(snap);
    console.log("Removed Interactions...");
  };

  const addAreaInteractions = (map: Map, shapeType: any) => {
    draw = new Draw({
      source: occurrenceSource,
      type: shapeType,
      freehandCondition: never,
    });

    let coordinates;

    draw.on("drawend", (e) => {
      const geometry: any = e.feature.getGeometry();
      // const geometry = e.feature.getGeometry() as SimpleGeometry;
      let coordinates: any;

      if (shapeType === "Circle") {
        // Handle Circle geometry

        const center = geometry.getCenter();
        const radius = geometry.getRadius();

        coordinates = createCircleCoordinates(center, radius);
      } else if (shapeType === "Polygon" && geometry instanceof Polygon) {
        // Handle Polygon geometry

        coordinates = geometry
          ?.getCoordinates()[0]
          .map((coord: any) => transform(coord, "EPSG:3857", "EPSG:4326"));
      }

      console.log("Coordinates:", coordinates);

      if (coordinates) {
        const wktString = `MULTIPOLYGON(((${coordinates
          .map((coord: any) => coord.join(" "))
          .join(", ")})))`;

        const wktStringEdited = ` WITHIN(the_geom, ${wktString})`;
        const updatedFilterCondition = {
          ...filterConditionsObj,
          wktStringEdited,
        };
        setFilterConditionsObj(updatedFilterCondition);
        map?.addInteraction(draw);
      }
    });

    map?.addInteraction(draw);
    snap = new Snap({ source: occurrenceSource });
    map.addInteraction(snap);
  };

  useEffect(() => {
    getBasemapOverlaysLayersArray("basemaps").then((baseMapsArray) => {
      getBasemapOverlaysLayersArray("overlays").then((overlaysArray) => {if (overlaysArray) {
          setTheOverlaysArray(overlaysArray);
        }
        if (baseMapsArray) {
          setTheBaseMapsArray(baseMapsArray);
        }
      });
    });
  }, []);

  useEffect(() => {
    const initializeMap = async () => {
      if (theBaseMapsArray.length > 0 || theOverlaysArray.length > 0) {
        const BaseMaps = new LayerGroup({
          title: "Basemaps",
          layers: theBaseMapsArray,
        } as GroupLayerOptions);

        const Overlays = new LayerGroup({
          title: "Overlays",
          layers: theOverlaysArray,
        } as GroupLayerOptions);


            const initialMap = new OlMap({
              target: "map-container",
              layers: [BaseMaps, Overlays, occurrenceLayer],
              view: new View({
                center: [0, 0],
                zoom: 2,
              }),
            });
            const layerSwitcher = new LayerSwitcher();
            initialMap.addControl(layerSwitcher);
            initialMap.on("singleclick", handleMapClick);
            mapRef.current = initialMap;
            setMap(initialMap);
          // Initialise map
        return () => initialMap.setTarget(undefined);
      }
    };

    initializeMap();
  }, [theBaseMapsArray, theOverlaysArray]);

  useEffect(() => {
    if (!map) {
      return;
    }
    const areaTypes = ["Polygon", "Circle"];
    if (areaSelected && areaTypes.includes(areaSelected)) {
      removeAreaInteractions(map);
      addAreaInteractions(map, areaSelected);
      console.log("Added Interaction");
        }else {
      removeAreaInteractions(map);
    }
  }, [areaSelected, map]);

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

  const handleAreaDrawn = (areaType: string) => {
    setAreaSelected(areaType);
  };

  const handleSelectedSpecies = (selectedSpecies: any) => {
    setSelectedSpecies(selectedSpecies);
  };

  useEffect(() => {
    const defaultStyle = new Style({
      image: new Circle({
        fill: fill,
        stroke: stroke,
        radius: 8,
      }),
    });
    const getFeatureStyle = (feature: any) => {
      const species = feature.getProperties().species;
      const speciesIndex = selectedSpecies.indexOf(species);
      if (speciesIndex !== -1) {
        if (speciesIndex < speciesColors.length) {
          // If the species is selected and color exists in the array, use it
          return new Style({
            image: new Circle({
              radius: 8,
              stroke: new Stroke({
                color: "black",
                width: 1.25,
              }),
              fill: new Fill({
                color: speciesColors[speciesIndex],
              }),
            }),
          });
        } else {
          // If the species is selected but exceeds color array length, add a new color to the array
          const newColor = speciesColors[speciesColors.length - 1];
          setSpeciesColors((prevColors) => [...prevColors, newColor]);
          return new Style({
            image: new Circle({
              radius: 8,
              stroke: new Stroke({
                color: "black",
                width: 1.25,
              }),
              fill: new Fill({
                color: newColor,
              }),
            }),
          });
        }
      }
      // Default style for unselected species
      return defaultStyle;
    };

    const existingOccurrenceLayer = map
        ?.getLayers()
        .getArray()
        .find((layer) => {
          return layer.get("occurrence-data") === true;
        });
    if (
        existingOccurrenceLayer &&
        existingOccurrenceLayer instanceof VectorLayer
    ) {
      const occurrenceSource = existingOccurrenceLayer.getSource();
      const existingLegendControl = map
          ?.getControls()
          .getArray()
          .find((control) => control.get("name") === "legend");
      if (existingLegendControl) {
        map?.removeControl(existingLegendControl);
      }
      if (selectedSpecies.length === 0) {
        // If no species selected, show the original data with default style
        occurrenceSource.getFeatures().forEach((feature: any) => {
          feature.setStyle(defaultStyle);
        });
      } else {
        // Update the style of features in the occurrence source based on selected species
        occurrenceSource.getFeatures().forEach((feature: any) => {
          const species = feature.getProperties().species as string;
          const speciesIndex = selectedSpecies.indexOf(species);
          if (speciesIndex !== -1) {
            feature.setStyle(getFeatureStyle(feature));
          } else {
            feature.setStyle(defaultStyle);
          }
        });
      }
      // Refresh the map
      map?.render();
    }
    const createLegendDiv = () => {
      const legendContainer = document.createElement("div");
      legendContainer.className = "legend-container";
      legendContainer.style.position = "absolute";
      legendContainer.style.bottom = "16px";
      legendContainer.style.right = "16px";
      legendContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
      legendContainer.style.padding = "8px";
      legendContainer.style.border = "1px solid #ccc";
      legendContainer.style.borderRadius = "5px";
      const legendTitle = document.createElement("div");
      legendTitle.style.textDecoration = "underline";
      legendTitle.style.fontWeight = "bold";
      legendTitle.textContent = "Legend";
      legendContainer.appendChild(legendTitle);
      selectedSpecies.forEach((species, index) => {
        const legendItem = document.createElement("div");
        legendItem.style.fontStyle = "italic";
        legendItem.style.fontWeight = "bold";
        legendItem.style.color = speciesColors[index];
        legendItem.textContent = `an. ${species}`;
        legendContainer.appendChild(legendItem);
      });
      return legendContainer;
    };
    const legendDiv = createLegendDiv();
    document.body.appendChild(legendDiv);
    return () => {
      if (document.body.contains(legendDiv)) {
        document.body.removeChild(legendDiv);
      }
    };
  }, [occurrenceData]);

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
              onClearFilter={() => {
                removeOccurence();
              }}
              handleDrawArea={handleAreaDrawn}
              handleSelectedSpecies={handleSelectedSpecies}
              onResetFilter={resetOccurrence}
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
                color: "#038543",
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
