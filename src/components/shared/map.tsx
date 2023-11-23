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
<<<<<<< HEAD
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Event from 'ol/events/Event';
import Popover from '@mui/material/Popover';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
<<<<<<< HEAD
=======
import MapBrowserEvent from "ol/MapBrowserEvent";
import Event from "ol/events/Event";
import Popover from "@mui/material/Popover";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
>>>>>>> 5045140 (added changes to styling)
import {
  geoServerBaseUrl,
  getBasemapOverlaysLayersArray,
} from "@/requests/requests";
import "./CSS/LayerSwitcherStyles.css";
import { Stroke, Fill, Style, Circle } from "ol/style";
<<<<<<< HEAD
=======
import FilterSection from "../filters/filtersection";
<<<<<<< HEAD



>>>>>>> e495101 (adding filter component)
=======
import FilterSection from "../filters/filtersection";
>>>>>>> 5045140 (added changes to styling)
=======
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Grid,
  Collapse,
  Tooltip,
  IconButton,
  colors,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import { formControlStyle, containerStyle, buttonContainerStyle, buttonStyle, renderButton } from "./CSS/filterStyle";

>>>>>>> 28960c2 (filter style)
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
  

  //filtersection
  const [newopen, setOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedControl, setSelectedControl] = useState("");
  const [selectedAdult, setSelectedAdult] = useState("");
  const [selectedLarval, setSelectedLarval] = useState("");
  const handleDiseaseChange = (event: { target: { value: any } }) => {
    const selectedDiseaseValue = event.target.value;
    setSelectedDisease(selectedDiseaseValue);
    
  };
  console.log(selectedDisease)

  const handleCountryChange = (event: { target: { value: any } }) => {
    const selectedCountry = event.target.value;
  };

  const handleSpeciesChange = (event: { target: { value: any } }) => {
    const selectedSpeciesValue = event.target.value as string;
    setSelectedSpecies(selectedSpeciesValue)
    console.log(selectedSpeciesValue)
    handleApplyFilters()
  };
  console.log(selectedSpecies)
  const handleApplyFilters = () => {
    console.log("Filters Applied:", {
      selectedDisease,
      selectedCountry,
      selectedSpecies,
      selectedSeason,
      selectedControl,
      selectedAdult,
      selectedLarval,
    });
  };
  
  //end of filters
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleClosePopover = () => {
    if (anchorEl) {
      anchorEl.remove(); // This removes the dummy anchor from the DOM
    }
    setAnchorEl(null);
  };
  mapRef.current = map;

  const speciesName = ['arabiensis','funestus'];
  const specFilter = `species IN ('${speciesName.join("','")}')`;

  
  // const occurrenceSource = new VectorSource({
  //   format: new GeoJSON(),
  //   url:
  //     geoServerBaseUrl +
  //     "/geoserver/vector/ows?service=WFS&version=" +
  //     "1.0.0&request=GetFeature&typeName" +
  //     "=vector%3Aoccurrence&maxFeatures=1000&outputFormat=application%2Fjson" +
  //     (selectedSpecies? `&cql_filter=${encodeURIComponent(selectedSpecies)}`:''),
  //   strategy: bboxStrategy,
  // })

  const [occurrenceSource, setOccurrenceSource] = useState(
    new VectorSource({
      format: new GeoJSON(),
      url:
        geoServerBaseUrl +
        "/geoserver/vector/ows?service=WFS&version=" +
        "1.0.0&request=GetFeature&typeName" +
        "=vector%3Aoccurrence&maxFeatures=1000&outputFormat=application%2Fjson",
      strategy: bboxStrategy,
    })
  );

  useEffect(() => {
    console.log(selectedSpecies)
    const updatedOccurrenceSource = new VectorSource({
      format: new GeoJSON(),
      url:
        geoServerBaseUrl +
        "/geoserver/vector/ows?service=WFS&version=" +
        "1.0.0&request=GetFeature&typeName" +
        "=vector%3Aoccurrence&maxFeatures=1000&outputFormat=application%2Fjson" +
        (selectedSpecies ? `&cql_filter=species=${encodeURIComponent(selectedSpecies)}` : ''),
      strategy: bboxStrategy,
    });

    setOccurrenceSource(updatedOccurrenceSource);
  }, [selectedSpecies]);

  const fill = new Fill({
    color: "rgba(2,2,2,1)",
  });
  const stroke = new Stroke({
    color: "#222",
    width: 1.25,
  });

  const occurrenceLayer = new VectorLayer({
    title: "Occurrence Layer",
    visible: false,
    preload: Infinity,
    source: occurrenceSource,
    style: new Style({
      image: new Circle({
        fill: fill,
        stroke: stroke,
        radius: 5,
      }),
      fill: fill,
      stroke: stroke,
    }),
  } as BaseLayerOptions);

  const occurrenceGroup = new LayerGroup({
    title: "Occurrence",
<<<<<<< HEAD
    layers: [occurrenceLayer],
=======
    layers: [siteLayer, occurrenceLayer],
>>>>>>> e495101 (adding filter component)
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

                    // Position the dummy anchor based on the event's pixel
                    // Here you would use the map container's ID or ref to position correctly
                    dummyAnchor.style.left = `${event.pixel[0]}px`;
                    dummyAnchor.style.top = `${event.pixel[1]}px`;

                    // Append the dummy anchor to the map element
                    // Assuming mapElement.current is the container of the map
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
  }, []);

  const parentContainerStyle = {
    maxWidth: "800px", // Adjust as needed or remove for full-width responsiveness
    margin: "0 auto", // Center the container on the page
  };
  return (
    <>
      <div
        style={{ height: "calc(100vh - 120px)" }}
        ref={mapElement}
        className="map-container"
        id="map-container"
      >
<<<<<<< HEAD
            <FilterSection />
      </div>    
=======
        <div style={parentContainerStyle}>
          <FilterSection />
        </div>
      </div>
>>>>>>> 5045140 (added changes to styling)

      <div
      style={{
        position: "absolute",
        top: "100px",
        left: "50%",
        alignItems: "center",
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}
    >
      <Tooltip title={newopen ? "Hide Filters" : "Show Filters"} arrow>
        <IconButton
          onClick={() => setOpen(!newopen)}
          size="small"
          sx={{
            backgroundColor: "#4CAF50", // Background color when the button is not hovered or active
            color: "white", // Text color when the button is not hovered or active
            "&:hover": {
              backgroundColor: "#45a049", // Background color on hover
            },
            "&:active": {
              backgroundColor: "#4CAF50", // Background color on click
            },
          }}
        >
          <TuneIcon />
        </IconButton>
      </Tooltip>

      <Collapse in={newopen}>
        <Box style={containerStyle}>
          <Grid container spacing={1} style={{ marginTop: "10px" }}>
            <Grid item xs={12} sm={4}>
              <FormControl style={{ ...formControlStyle, marginRight: "10px" }}>
                <InputLabel id="disease-label" sx={{ fontSize: "0.8rem" }}>
                  Disease
                </InputLabel>
                <Select
                  labelId="disease-label"
                  id="disease-select"
                  onChange={handleDiseaseChange}
                  value={selectedDisease}
                >
                  <MenuItem value="Malaria">Malaria</MenuItem>
                  <MenuItem value="Chikungunya">Chikungunya</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl style={{ ...formControlStyle, marginRight: "10px" }}>
                <InputLabel id="country-label" sx={{ fontSize: "0.8rem" }}>
                  Country
                </InputLabel>
                <Select
                  labelId="country-label"
                  id="country-select"
                  onChange={handleCountryChange}
                  value={selectedCountry}
                >
                  <MenuItem value="country1">Kenya</MenuItem>
                  <MenuItem value="country2">Uganda</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl style={formControlStyle}>
                <InputLabel id="species-label" sx={{ fontSize: "0.8rem" }}>
                  Species
                </InputLabel>
                <Select
                  labelId="species-label"
                  id="species-select"
                  onChange={handleSpeciesChange}
                  value={selectedSpecies}
                >
                  <MenuItem value="gambiae">An. gambiae</MenuItem>
                  <MenuItem value="funestus">An. funestus</MenuItem>
                </Select>
              </FormControl>
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
                sm={6}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", marginRight: "8px" }}
                >
                  Season:{" "}
                </Typography>
                {renderButton("Rainy", selectedSeason === "Rainy", () =>
                  setSelectedSeason("Rainy")
                )}
                {renderButton("Dry", selectedSeason === "Dry", () =>
                  setSelectedSeason("Dry")
                )}
                {renderButton("Empty", selectedSeason === "Empty", () =>
                  setSelectedSeason("Empty")
                )}
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
                  variant="body2"
                  sx={{ fontStyle: "italic", marginRight: "8px" }}
                >
                  Control:{" "}
                </Typography>
                {renderButton("True", selectedControl === "True", () =>
                  setSelectedControl("True")
                )}
                {renderButton("False", selectedControl === "False", () =>
                  setSelectedControl("False")
                )}
                {renderButton("Empty", selectedControl === "Empty", () =>
                  setSelectedControl("Empty")
                )}
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
                  variant="body2"
                  sx={{ fontStyle: "italic", marginRight: "20px" }}
                >
                  Adult:{" "}
                </Typography>
                {renderButton("True", selectedAdult === "True", () =>
                  setSelectedAdult("True")
                )}
                {renderButton("False", selectedAdult === "False", () =>
                  setSelectedAdult("False")
                )}
                {renderButton("Empty", selectedAdult === "Empty", () =>
                  setSelectedAdult("Empty")
                )}
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
                  variant="body2"
                  sx={{ fontStyle: "italic", marginRight: "15px" }}
                >
                  Larval:{" "}
                </Typography>
                {renderButton("True", selectedLarval === "True", () =>
                  setSelectedLarval("True")
                )}
                {renderButton("False", selectedLarval === "False", () =>
                  setSelectedLarval("False")
                )}
                {renderButton("Empty", selectedLarval === "Empty", () =>
                  setSelectedLarval("Empty")
                )}
              </Grid>
            </Grid>
            <div style={buttonContainerStyle}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: colors.grey[700],
                  "&:hover": {
                    backgroundColor: colors.grey[500], // Background color on hover
                  },
                }}
                size="small"
                style={{ fontSize: "0.6rem" }}
                onClick={handleApplyFilters}
              >
                Apply
              </Button>
            </div>
          </Grid>
        </Box>
      </Collapse>
    </div>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        // ... other props
      >
        <div>
          <Accordion
            expanded={expanded === "panel1"}
            onChange={handleChange("panel1")}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
            >
              <Typography sx={{ width: "33%", flexShrink: 0 }}>
                Species
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Mosquito species details
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{popoverContent?.notes}</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel2"}
            onChange={handleChange("panel2")}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2bh-content"
              id="panel2bh-header"
            >
              <Typography sx={{ width: "33%", flexShrink: 0 }}>
                Bionomics
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Ecological characteristics of species
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{popoverContent?.notes}</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel3"}
            onChange={handleChange("panel3")}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3bh-content"
              id="panel3bh-header"
            >
              <Typography sx={{ width: "33%", flexShrink: 0 }}>
                Site/Environment
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Geographical and environmental data
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {popoverContent.geometry ? (
                  <>
                    Location: {popoverContent.geometry.layout}
                    Coordinates:{" "}
                    {popoverContent.geometry.flatCoordinates.join(", ")}
                  </>
                ) : (
                  <span>Loading or no data available...</span>
                )}
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel4"}
            onChange={handleChange("panel4")}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel4bh-content"
              id="panel4bh-header"
            >
              <Typography sx={{ width: "33%", flexShrink: 0 }}>
                Period
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {popoverContent?.period_start && popoverContent?.period_end ? (
                  `Data collected from ${popoverContent.period_start} to ${popoverContent.period_end}.`
                ) : (
                  <span>Loading or no data available...</span>
                )}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </div>
      </Popover>
      
    </>
  );
}

export default Newmap;
