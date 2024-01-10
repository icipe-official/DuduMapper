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
import { bbox as bboxStrategy } from "ol/loadingstrategy.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { Pixel } from "ol/pixel";
import MapBrowserEvent from "ol/MapBrowserEvent";
import Event from "ol/events/Event";
import Popover from "@mui/material/Popover";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  geoServerBaseUrl,
  getBasemapOverlaysLayersArray,
} from "@/requests/requests";
import "./CSS/LayerSwitcherStyles.css";
import { Stroke, Fill, Style, Circle } from "ol/style";
import OccurrencePopup from "../map/occurrence_popup";
import FilterSection from "../filters/filtersection";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  FormControl,
  Grid,
  IconButton,
  SelectChangeEvent,
  TextField,
  Tooltip,
  colors,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import "../filters/filterSectionStyles.css";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import DataArrayIcon from "@mui/icons-material/DataArray";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import BugReportIcon from "@mui/icons-material/BugReport";
import PestControlIcon from "@mui/icons-material/PestControl";
import EggIcon from "@mui/icons-material/Egg";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { countryList, speciesList } from "../filters/filterUtils";
import Control from "ol/control/Control";
import RectangleOutlinedIcon from "@mui/icons-material/RectangleOutlined";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import FormatShapesIcon from "@mui/icons-material/FormatShapes";
import { Draw, Modify, Snap } from "ol/interaction.js";
import SimpleGeometry from "ol/geom/SimpleGeometry";
import { never } from "ol/events/condition";
import { Coordinate } from "ol/coordinate";
import { transform } from "ol/proj";
import { Polygon } from "ol/geom";
import Feature from "ol/format/Feature";
import * as turf from "@turf/turf";
import {
  buildAreaSelectionLayer,
  updateSelectedPolygons,
} from "@/app/layerUtils";
import { createRegularPolygon } from "ol/interaction/Draw";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { polygon, point } from "@turf/boolean-point-in-polygon";

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
  const [occurrenceData, setOccurrenceData] = useState<any[]>([]);

  const [popen, setPOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<string[]>([]);
  const [isDiseaseSelected, setIsDiseaseSelected] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string[]>([]);
  const [isCountrySelected, setIsCountrySelected] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [isSpeciesSelected, setIsSpeciesSelected] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [isSeasonSelected, setIsSeasonSelected] = useState(false);
  const [selectedControl, setSelectedControl] = useState("");
  const [isControlSelected, setIsControlSelected] = useState(false);
  const [selectedAdult, setSelectedAdult] = useState("");
  const [isAdultSelected, setIsAdultSelected] = useState(false);
  const [selectedLarval, setSelectedLarval] = useState("");
  const [isLarvalSelected, setIsLarvalSelected] = useState(false);
  const [selectedByArea, setSelectedByArea] = useState("");
  const [enableAreaMode, setEnableAreaMode] = useState(false);
  const [cordinateArray, setCordinateArray] = useState<Coordinate[][]>([]);

  const [speciesColors, setSpeciesColors] = useState<string[]>([
    "#dc267f",
    "#648fff",
    "#785ef0",
    "#fe6100",
    "#ffb000",
    "#000000",
    "#ffffff",
  ]);

  const [filterOpen, setFilterOpen] = useState(false);
  // const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  // const [isSpeciesSelected, setIsSpeciesSelected] = useState(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
      event.stopPropagation(); // Stop the click event from reaching the parent accordion
    };

  mapRef.current = map;

  const handleDiseaseChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: string[]
  ) => {
    const selectedValues = [...value];
    setSelectedDisease(selectedValues);
    setIsDiseaseSelected(selectedValues.length > 0);
  };
  const handleCountryChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: string[]
  ) => {
    const selectedValues = [...value];
    setSelectedCountry(selectedValues);
    setIsCountrySelected(selectedValues.length > 0);
  };

  const handleSpeciesChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: string[]
  ) => {
    const selectedValues = [...value];
    setSelectedSpecies(selectedValues);
    setIsSpeciesSelected(selectedValues.length > 0);
  };
  const handleDeleteDisease = (index: number) => {
    const newSelectedDisease = [...selectedDisease];
    newSelectedDisease.splice(index, 1);
    setSelectedDisease(newSelectedDisease);
    setIsDiseaseSelected(newSelectedDisease.length > 0);
  };
  const handleDeleteCountry = (index: number) => {
    const newSelectedCountry = [...selectedCountry];
    newSelectedCountry.splice(index, 1);
    setSelectedCountry(newSelectedCountry);
    setIsCountrySelected(newSelectedCountry.length > 0);
  };

  const handleDeleteSpecies = (index: number) => {
    const newSelectedSpecies = [...selectedSpecies];
    newSelectedSpecies.splice(index, 1);
    setSelectedSpecies(newSelectedSpecies);
    setIsSpeciesSelected(newSelectedSpecies.length > 0);
  };

  const toggleSelectedByArea = (shape: string) => {
    if (selectedByArea === "") {
      setEnableAreaMode(true);
      setSelectedByArea(shape);
    } else if (selectedByArea != shape && selectedByArea != "") {
      setEnableAreaMode(true);
      setSelectedByArea(shape);
    } else {
      setEnableAreaMode(false);
      setSelectedByArea("");
    }
  };

  const SelectionCounter: React.FC<{ count: number }> = ({ count }) => (
    <Typography
      variant="caption"
      sx={{
        fontSize: "0.8rem",
        color: count > 0 ? "#2e7d32" : "", // Set color to green if items are selected
      }}
    >
      {count > 0 ? `${count} item(s) selected` : ""}
    </Typography>
  );

  const handleClosePopover = () => {
    if (anchorEl) {
      anchorEl.remove(); // This removes the dummy anchor from the DOM
    }
    setAnchorEl(null);
  };
  mapRef.current = map;

  // const occurrenceSource = new VectorSource({
  //   format: new GeoJSON(),
  //   url:
  //     geoServerBaseUrl +
  //     "/geoserver/vector/ows?service=WFS&version=" +
  //     "1.0.0&request=GetFeature&typeName" +
  //     "=vector%3Aoccurrence&maxFeatures=50&outputFormat=application%2Fjson",
  //   strategy: bboxStrategy,
  // });

  const fill = new Fill({
    color: "rgba(2,255,2,1)",
  });
  const stroke = new Stroke({
    color: "#222",
    width: 1.25,
  });
  let draw: Draw, snap: Snap, modify: Modify;

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

  const [occurrenceSource, setOccurrenceSource] = useState(
    new VectorSource({
      format: new GeoJSON(),
      features: [],
      strategy: bboxStrategy,
    })
  );

  useEffect(() => {
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

    const fetchOccurrenceData = async () => {
      try {
        const response = await fetch(
          geoServerBaseUrl +
            "/geoserver/vector/ows?service=WFS&version=" +
            "1.0.0&request=GetFeature&typeName" +
            "=vector%3Aoccurrence&maxFeatures=10000&outputFormat=application%2Fjson"
        );

        const data = await response.json();

        console.log("Fetched data:", data);
        const featuresArray = data.features || [];

        if (Array.isArray(featuresArray)) {
          // Update the occurrence source with the fetched features
          occurrenceSource.clear();
          occurrenceSource.addFeatures(
            new GeoJSON().readFeatures(responseToGEOJSON(featuresArray), {
              featureProjection: "EPSG:3857",
            })
          );
          occurrenceLayer.changed();

          setOccurrenceData(featuresArray);

          console.log(selectedSpecies);

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
                  const areaSelectedLayer = buildAreaSelectionLayer();
                  const initialMap = new Map({
                    target: "map-container",
                    layers: [
                      BaseMaps,
                      Overlays,
                      occurrenceLayer,
                      areaSelectedLayer,
                    ],
                    view: new View({
                      center: [0, 0],
                      zoom: 4,
                    }),
                  });
                  const layerSwitcher = new LayerSwitcher();
                  initialMap.addControl(layerSwitcher);

                  initialMap.getLayers().clear();
                  initialMap.addLayer(BaseMaps);
                  initialMap.addLayer(Overlays);
                  initialMap.addLayer(occurrenceLayer);

                  const handleMapClick = (event: any) => {
                    console.log(
                      "handle map click before checking if map is defined"
                    );

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
                  mapRef.current = initialMap;
                  setMap(initialMap);
                }
              }
            });
          });

          const layerSwitcher = new LayerSwitcher();
          if (map) {
            map.addControl(layerSwitcher);
          }
        }
      } catch (error) {
        console.error("Error fetching occurrence data:", error);
      }
    };
    fetchOccurrenceData();
  }, []);

  useEffect(() => {
    console.log("use inarun");

    const defaultStyle = new Style({
      image: new Circle({
        fill: fill,
        stroke: stroke,
        radius: 8,
      }),
      fill: fill,
      stroke: stroke,
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
          const newColor = getRandomColor();
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

    const getRandomColor = () => {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);

      return `rgb(${r},${g},${b})`;
    };

    const logFilteredFeatures = () => {
      const filteredFeatures = occurrenceData.filter((feature) => {
        const species = feature.properties.species;
        const season = feature.properties.season_given;
        const control = feature.properties.control;
        const adult = feature.properties.adult;
        const larval = feature.properties.larval;

        console.log(season);

        const isSpeciesSelected = selectedSpecies.includes(species);
        const isSeasonSelected = selectedSeason === season;
        const isControlSelected = selectedControl.includes(control);
        const isAdultSelected = selectedAdult.includes(adult);
        const isLarvalSelected = selectedLarval.includes(larval);
        return (
          isSpeciesSelected &&
          isSeasonSelected &&
          isControlSelected &&
          isAdultSelected &&
          isLarvalSelected
        );
      });

      console.log("Filtered Features:", filteredFeatures);

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
          occurrenceSource.clear();
          occurrenceSource.addFeatures(
            new GeoJSON()
              .readFeatures(responseToGEOJSON(occurrenceData), {
                featureProjection: "EPSG:3857",
              })
              .map((feature) => {
                feature.setStyle(defaultStyle);
                return feature;
              })
          );
        } else {
          // Update the occurrence source with the filtered features and apply styles
          const filteredFeatures = occurrenceData.filter((feature) => {
            const species = feature.properties.species;
            //const coordinates = feature.geometry
            return selectedSpecies.includes(species);
          });

          console.log("Filtered Features:", filteredFeatures);

          occurrenceSource.clear();
          occurrenceSource.addFeatures(
            new GeoJSON()
              .readFeatures(responseToGEOJSON(filteredFeatures), {
                featureProjection: "EPSG:3857",
              })
              .map((feature) => {
                feature.setStyle(getFeatureStyle(feature));
                return feature;
              })
          );
        }

        // Refresh the map
        map?.render();
      }
    };

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
    // Set the occurrenceSource state with initial features
    setOccurrenceSource(
      new VectorSource({
        format: new GeoJSON(),
        features: new GeoJSON()
          .readFeatures(responseToGEOJSON(occurrenceData), {
            featureProjection: "EPSG:3857",
          })
          .map((feature) => {
            feature.setStyle(getFeatureStyle(feature));
            return feature;
          }),
        strategy: bboxStrategy,
      })
    );

    logFilteredFeatures();

    return () => {
      document.body.removeChild(legendDiv);
      logFilteredFeatures();
    };
  }, [
    selectedSpecies,
    setOccurrenceSource,
    speciesColors,
    selectedSeason,
    selectedControl,
    selectedAdult,
    selectedLarval,
  ]);

  useEffect(() => {
    if (!map) {
      return;
    }

    const addAreaInteractions = (selectedByArea: any) => {
      const areaSelect = map
        ?.getAllLayers()
        .find((l) => l.get("occurrence-data"));
      const source = areaSelect?.getSource() as VectorSource;

      draw = new Draw({
        source: source,
        type: selectedByArea,
        freehandCondition: never,
      });

      draw.on("drawend", (e) => {
        const geom = e.feature.getGeometry() as SimpleGeometry;
        const coords = geom?.getCoordinates();
        if (coords && coords.length > 0) {
          setCordinateArray(
            coords[0].map((c: Coordinate) =>
              transform(c, "EPSG:3857", "EPSG:4326")
            )
          );
        }
      });
      map?.addInteraction(draw);
      snap = new Snap({ source: source });
      map?.addInteraction(snap);
    };

    const removeAreaInteractions = (map: Map) => {
      map.removeInteraction(modify);
      map.removeInteraction(draw);
      map.removeInteraction(snap);
    };

    console.log("enableAreaMode:", enableAreaMode);
    console.log("selectedByArea:", selectedByArea);

    //  if (enableAreaMode) {
    addAreaInteractions("Polygon");
    //   console.log("Added Interaction");
    // } else {
    //   console.log("Value Not Passed...");
    //   removeAreaInteractions(map);
    // }
  }, [enableAreaMode, selectedByArea, map]);

  useEffect(() => {
    console.log("selected coordinates", cordinateArray);
    const getFeatureStyle = (feature: any) => {
      const style = new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({
            color: "green",
          }),
          stroke: new Stroke({
            color: "black",
            width: 2,
          }),
        }),
      });
      return style;
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
      const filteredFeatures = occurrenceData.filter((feature) => {
        const cordinates = feature.geometry.coordinates;
        //Check for equality instead of using includes

        const isInBound = booleanPointInPolygon(
          turf.point(cordinates),
          turf.polygon([cordinateArray])
        );

        if (isInBound) {
          return cordinates;
        }
      });
      console.log("filtered Coordinates", filteredFeatures);
      // Filter features based on selectedCountry
      occurrenceSource.clear();
      occurrenceSource.addFeatures(
        new GeoJSON()
          .readFeatures(responseToGEOJSON(filteredFeatures), {
            featureProjection: "EPSG:3857",
          })
          .map((feature) => {
            feature.setStyle(getFeatureStyle(feature));
            return feature;
          })
      );
      // Refresh the map
      map?.render();
    }
  }, [cordinateArray]);

  return (
    <>
      <div
        style={{ height: "calc(100vh - 70px)" }}
        ref={mapElement}
        className="map-container"
        id="map-container"
      >
        {/* <div>
          {filterOpen && <FilterSection 
          
          openFilter={filterOpen} />} */}

        <div className="filter-section">
          <Collapse in={popen}>
            <div className="flex-container">
              <Box className="container-style">
                <Grid
                  container
                  spacing={1}
                  style={{ marginTop: "10px", display: "flex" }}
                >
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <Autocomplete
                        multiple
                        id="disease-select"
                        options={["Malaria", "Chikungunya"]}
                        value={selectedDisease}
                        onChange={(event, value) =>
                          handleDiseaseChange(event, value)
                        }
                        getOptionLabel={(option) => option}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={`Disease (${selectedDisease.length} selected)`}
                            InputLabelProps={{ sx: { fontSize: "0.8rem" } }}
                          />
                        )}
                        renderTags={() => null}
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Checkbox
                              icon={
                                <CheckBoxOutlineBlankIcon fontSize="small" />
                              }
                              checkedIcon={<CheckBoxIcon fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option}
                          </li>
                        )}
                        ListboxComponent={(props) => <ul {...props} />}
                      />
                    </FormControl>
                    <div
                      style={{
                        marginTop: "4px",
                        display: "flex",
                        flexWrap: "wrap",
                      }}
                    >
                      {selectedDisease.map((value, index) => (
                        <Chip
                          key={value}
                          label={value}
                          style={{
                            marginRight: "4px",
                            marginBottom: "4px",
                            fontSize: "0.7rem",
                          }}
                          onDelete={() => handleDeleteDisease(index)}
                        />
                      ))}
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <Autocomplete
                        multiple
                        id="country-select"
                        options={countryList}
                        value={selectedCountry}
                        onChange={(event, value) =>
                          handleCountryChange(event, value)
                        }
                        getOptionLabel={(option) => option}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={`Country (${selectedCountry.length} selected)`}
                            InputLabelProps={{ sx: { fontSize: "0.8rem" } }}
                          />
                        )}
                        renderTags={() => null}
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Checkbox
                              icon={
                                <CheckBoxOutlineBlankIcon fontSize="small" />
                              }
                              checkedIcon={<CheckBoxIcon fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option}
                          </li>
                        )}
                        ListboxComponent={(props) => <ul {...props} />}
                      />
                    </FormControl>
                    <div
                      style={{
                        marginTop: "4px",
                        display: "flex",
                        flexWrap: "wrap",
                      }}
                    >
                      {selectedCountry.slice(0, 4).map((value, index) => (
                        <Chip
                          key={value}
                          label={value}
                          style={{
                            marginRight: "4px",
                            marginBottom: "4px",
                            fontSize: "0.7rem",
                          }}
                          onDelete={() => handleDeleteCountry(index)}
                        />
                      ))}
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <Autocomplete
                        multiple
                        id="species-select"
                        options={speciesList}
                        value={selectedSpecies}
                        onChange={(event, value) =>
                          handleSpeciesChange(event, value)
                        }
                        getOptionLabel={(option) => option}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={`Species (${selectedSpecies.length} selected)`}
                            InputLabelProps={{ sx: { fontSize: "0.8rem" } }}
                          />
                        )}
                        renderTags={() => null}
                        renderOption={(props, option, { selected }) => (
                          <li {...props}>
                            <Checkbox
                              icon={
                                <CheckBoxOutlineBlankIcon fontSize="small" />
                              }
                              checkedIcon={<CheckBoxIcon fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option}
                          </li>
                        )}
                        ListboxComponent={(props) => <ul {...props} />}
                      />
                    </FormControl>
                    <div
                      style={{
                        marginTop: "4px",
                        display: "flex",
                        flexWrap: "wrap",
                      }}
                    >
                      {selectedSpecies.slice(0, 4).map((value, index) => (
                        <Chip
                          key={value}
                          label={value}
                          style={{
                            marginRight: "4px",
                            marginBottom: "4px",
                            fontSize: "0.7rem",
                          }}
                          onDelete={() => handleDeleteSpecies(index)}
                        />
                      ))}
                    </div>
                  </Grid>
                  <Grid
                    container
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    p="6px"
                  >
                    <Grid
                      item
                      xs={12}
                      sm={4}
                      sx={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Grid
                        item
                        xs={12}
                        sm={4}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontStyle: "italic",
                            marginRight: ".5px",
                            color: "black",
                          }}
                        >
                          Season:{" "}
                        </Typography>
                        <Tooltip title="Rainy" arrow>
                          <IconButton
                            onClick={() => setSelectedSeason("Rainy")}
                            color={
                              selectedSeason === "Rainy" ? "success" : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color: "#2e7d32", // Green color on hover
                              },
                            }}
                          >
                            <ThunderstormIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Dry" arrow>
                          <IconButton
                            onClick={() => setSelectedSeason("Dry")}
                            color={
                              selectedSeason === "Dry" ? "success" : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color:
                                  selectedSeason === "Dry"
                                    ? "default"
                                    : "#2e7d32",
                              },
                            }}
                          >
                            <WbSunnyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Empty" arrow>
                          <IconButton
                            onClick={() => setSelectedSeason("Empty")}
                            color={
                              selectedSeason === "Empty" ? "success" : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color:
                                  selectedSeason === "Empty"
                                    ? "#2e7d32"
                                    : "primary",
                              },
                            }}
                          >
                            <DataArrayIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontStyle: "italic",
                            marginRight: "0.5px",
                            color: "black",
                          }}
                        >
                          Control:{" "}
                        </Typography>
                        <Tooltip title="True" arrow>
                          <IconButton
                            onClick={() => setSelectedControl("True")}
                            color={
                              selectedControl === "True" ? "success" : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color:
                                  selectedControl === "True"
                                    ? "#2e7d32"
                                    : "primary",
                              },
                            }}
                          >
                            <DoneIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="False" arrow>
                          <IconButton
                            onClick={() => setSelectedControl("False")}
                            color={
                              selectedControl === "False"
                                ? "success"
                                : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color:
                                  selectedControl === "False"
                                    ? "#2e7d32"
                                    : "primary",
                              },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Empty" arrow>
                          <IconButton
                            onClick={() => setSelectedControl("Empty")}
                            color={
                              selectedControl === "Empty"
                                ? "success"
                                : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color:
                                  selectedControl === "Empty"
                                    ? "#2e7d32"
                                    : "primary",
                              },
                            }}
                          >
                            <DataArrayIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={4}
                      sx={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontStyle: "italic",
                            marginRight: "10px",
                            color: "black",
                          }}
                        >
                          Adult:{" "}
                        </Typography>
                        <Tooltip title="True" arrow>
                          <IconButton
                            onClick={() => setSelectedAdult("True")}
                            color={
                              selectedAdult === "True" ? "success" : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color:
                                  selectedAdult === "True"
                                    ? "#2e7d32"
                                    : "primary",
                              },
                            }}
                          >
                            <EmojiNatureIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="False" arrow>
                          <IconButton
                            onClick={() => setSelectedAdult("False")}
                            color={
                              selectedAdult === "False" ? "success" : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color:
                                  selectedAdult === "False"
                                    ? "#2e7d32"
                                    : "primary",
                              },
                            }}
                          >
                            <BugReportIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Empty" arrow>
                          <IconButton
                            onClick={() => setSelectedAdult("Empty")}
                            color={
                              selectedAdult === "Empty" ? "success" : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color:
                                  selectedAdult === "Empty"
                                    ? "#2e7d32"
                                    : "primary",
                              },
                            }}
                          >
                            <DataArrayIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontStyle: "italic",
                            marginRight: "5px",
                            color: "black",
                          }}
                        >
                          Larval:{" "}
                        </Typography>
                        <Tooltip title="True" arrow>
                          <IconButton
                            onClick={() => setSelectedLarval("True")}
                            color={
                              selectedLarval === "True" ? "success" : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color:
                                  selectedLarval === "True"
                                    ? "#2e7d32"
                                    : "primary",
                              },
                            }}
                          >
                            <PestControlIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="False" arrow>
                          <IconButton
                            onClick={() => setSelectedLarval("False")}
                            color={
                              selectedLarval === "False" ? "success" : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color:
                                  selectedLarval === "False"
                                    ? "#2e7d32"
                                    : "primary",
                              },
                            }}
                          >
                            <EggIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Empty" arrow>
                          <IconButton
                            onClick={() => setSelectedLarval("Empty")}
                            color={
                              selectedLarval === "Empty" ? "success" : "default"
                            }
                            sx={{
                              fontSize: "1.5rem",
                              "&:hover": {
                                color:
                                  selectedLarval === "Empty"
                                    ? "#2e7d32"
                                    : "primary",
                              },
                            }}
                          >
                            <DataArrayIcon />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={4}
                      sx={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Typography sx={{ color: "green", fontSize: 15 }}>
                        Select by Area
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontStyle: "italic",
                          marginRight: "5px",
                          color: "black",
                        }}
                      >
                        Rectangle:{" "}
                        <IconButton
                          onClick={() => toggleSelectedByArea("Box")}
                          color={
                            selectedByArea === "Box" ? "success" : "default"
                          }
                          sx={{
                            fontSize: "1.5rem",
                            "&:hover": {
                              color:
                                selectedByArea === "Box"
                                  ? "#2e7d32"
                                  : "primary",
                            },
                          }}
                        >
                          <RectangleOutlinedIcon />
                        </IconButton>
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontStyle: "italic",
                          marginRight: "5px",
                          color: "black",
                        }}
                      >
                        Circle:{" "}
                        <IconButton
                          onClick={() => toggleSelectedByArea("Circle")}
                          color={
                            selectedByArea === "Circle" ? "success" : "default"
                          }
                          sx={{
                            fontSize: "1.5rem",
                            "&:hover": {
                              color:
                                selectedByArea === "Circle"
                                  ? "#2e7d32"
                                  : "primary",
                            },
                          }}
                        >
                          <CircleOutlinedIcon />
                        </IconButton>
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontStyle: "italic",
                          marginRight: "5px",
                          color: "black",
                        }}
                      >
                        Free Hand:{" "}
                        <IconButton
                          onClick={() => toggleSelectedByArea("Polygon")}
                          color={
                            selectedByArea === "Polygon" ? "success" : "default"
                          }
                          sx={{
                            fontSize: "1.5rem",
                            "&:hover": {
                              color:
                                selectedByArea === "Polygon"
                                  ? "#2e7d32"
                                  : "primary",
                            },
                          }}
                        >
                          <FormatShapesIcon />
                        </IconButton>
                      </Typography>
                    </Grid>
                  </Grid>
                  <div className="button-container-style">
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#2e7d32",
                        "&:hover": {
                          backgroundColor: colors.grey[500], // Background color on hover
                        },
                      }}
                      size="small"
                      style={{ fontSize: "0.6rem" }}
                      onClick={() => {
                        setSelectedDisease([] as string[]);
                        setIsDiseaseSelected(false);
                        setSelectedCountry([] as string[]);
                        setIsCountrySelected(false);
                        setSelectedSpecies([] as string[]);
                        setIsSpeciesSelected(false);
                        setSelectedSeason("");
                        setIsSeasonSelected(false);
                        setSelectedAdult("");
                        setIsAdultSelected(false);
                        setSelectedControl("");
                        setIsControlSelected(false);
                        setSelectedLarval("");
                        setIsLarvalSelected(false);

                        // Reset other state variables as needed
                      }}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </Grid>
              </Box>
            </div>
          </Collapse>
        </div>

        <div className="filter-section">
          <Tooltip title={filterOpen ? "Hide Filters" : "Show Filters"} arrow>
            <IconButton
              onClick={() => setPOpen(!popen)}
              className="custom-icon-button"
              style={{ color: "white" }}
            >
              <TuneIcon />
            </IconButton>
          </Tooltip>
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
function setActive(active: any) {
  throw new Error("Function not implemented.");
}
