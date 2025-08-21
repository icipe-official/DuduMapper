{
  /*"use client";
import React, { useEffect, useRef, useState } from "react";
import { styled, useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import BugReportIcon from "@mui/icons-material/BugReport";
import LayersIcon from "@mui/icons-material/Layers";
import {
  Place,
  Map,
  CalendarMonth,
  DateRange,
  ModelTraining,
  Download,
} from "@mui/icons-material";

import Collapse from "@mui/material/Collapse";
import Checkbox from "@mui/material/Checkbox";
import PeopleIcon from "@mui/icons-material/People";
import Link from "next/link";

import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";

import { Map as OlMap, Tile, View } from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import LayerGroup from "ol/layer/Group";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import Collection from "ol/Collection";
import OSM from "ol/source/OSM";
import { get as getProjection } from "ol/proj";
import { getTopLeft, getWidth } from "ol/extent";
import { geoServerBaseUrl, fetchWMTSCapabilities } from "@/app/api/requests";
import Legend from "./Legend";
import { green } from "@mui/material/colors";
import DownloadPopup from "./DownloadPopup";
import { Options as LayerGroupOptions } from "ol/layer/Group";
import { FaGlobe, FaMapMarkerAlt } from "react-icons/fa";

import { HealthAndSafety } from "@mui/icons-material";
import { Button } from "@mui/material";

// ─── Constants & Styled Components ────────────────────────────────────────────

//const drawerWidth = 240;
//dragging drawer logic implemetation
const useDrawerDrag = () => {
  const [width, setWidth] = React.useState(240);
  const [dragging, setDragging] = React.useState(false);
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const maxWidth = window.innerWidth * 0.5;
      const newWidth = Math.min(Math.max(240, e.clientX), maxWidth);
      setWidth(newWidth);
    };
    const stopDragging = () => setDragging(false);
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", stopDragging);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, [dragging]);
  const drawerWidth = () => width;
  const startDragging = () => setDragging(true);

  return { drawerWidth, startDragging };
};

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

// For WMTS, using EPSG:4326
const projection4326 = getProjection("EPSG:4326");
const projectionExtent4326 = projection4326?.getExtent();
const size4326 = projectionExtent4326
  ? getWidth(projectionExtent4326) / 256
  : 0;
const resolutions4326 = projectionExtent4326
  ? Array.from({ length: 19 }, (_, z) => size4326 / Math.pow(2, z))
  : [];
const matrixIds4326 = Array.from({ length: 19 }, (_, z) => `EPSG:4326:${z}`);

// ─── Component ───────────────────────────────────────────────────────────────

function Newmap() {
  //drag effect
  const { drawerWidth, startDragging } = useDrawerDrag();
  const theme = useTheme();
  const mapRef = useRef<OlMap>();

  const mapElement = useRef<HTMLDivElement>(null);

  // Add these new state variables after your existing ones
  const [populationOpen, setPopulationOpen] = useState(false);
  const [predictiveModelsOpen, setPredictiveModelsOpen] = useState(false);
  //fetch country and county
  const [expandedCountry, setExpandedCountry] = useState<
    Record<string, boolean>
  >({});
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedModelTypes, setExpandedModelTypes] = useState<
    Record<string, boolean>
  >({});
  // Add these new state variables
  const [genericModelsOpen, setGenericModelsOpen] = useState(false);
  const [datedModelsOpen, setDatedModelsOpen] = useState(false);
  //from database
  const [genericModelMetadata, setGenericModelMetadata] = useState<
    GenericModelMetadata[]
  >([]);
  //skip if generic is dated in database
  const genericMetadataNames = new Set(
    genericModelMetadata.map((m) => m.name || m.title)
  );

  // Add these new handlers
  const handleGenericModelsClick = () =>
    setGenericModelsOpen(!genericModelsOpen);

  const handleDatedModelsClick = () => setDatedModelsOpen(!datedModelsOpen);
  // States for map layers and active layer name
  const [wmtsLayers, setWmtsLayers] = useState<any[]>([]);
  const [activeLayerName, setActiveLayerName] = useState<string | null>(null);
  const [activeTitleName, setActiveTitleName] = useState<string | null>(null);

  // States for drawer and layer control UI
  const [open, setOpen] = useState(true); // default to open
  const [overlaysOpen, setOverlaysOpen] = useState(true);
  const [turkanaOpen, setTurkanaOpen] = useState(false);
  const [kenyaOpen, setKenyaOpen] = useState(false);
  const [yearsOpen, setYearsOpen] = useState(false);
  const [monthsOpen, setMonthsOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [downloadPopupOpen, setDownloadPopupOpen] = useState(false);
  const [cqlFilter, setCqlFilter] = useState<string | null>(null);

  //loading const tracks
  const [isLoading, setIsLoading] = useState(true);
  const [tilesLoading, setTilesLoading] = useState(0);
  const mapInitializedRef = useRef(false);
  // Component state
  const [leishOpen, setLeishOpen] = useState(false);

  const [diseasesOpen, setDiseasesOpen] = useState(false);
  const handleDiseasesClick = () => setDiseasesOpen(!diseasesOpen);

  const handleLeishClick = () => {
    setLeishOpen(!leishOpen);
  };
  const handleCountryClick = () => {
    setCountryOpen(!countryOpen);
  };
  const handleKenyaClick = () => {
    setKenyaOpen(!kenyaOpen);
  };
  const handleTurkanaClick = () => setTurkanaOpen(!turkanaOpen);

  const handlePopulationClick = () => setPopulationOpen(!populationOpen);
  const handlePredictiveModelsClick = () => {
    console.log(
      "Predictive Models clicked, current state:",
      predictiveModelsOpen
    );

    setPredictiveModelsOpen(!predictiveModelsOpen);
  };

  const handleYearClick = (year: string) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };
  //handle for county and country
  const handleCountry = (country: string) => {
    setExpandedCountry((prev) => ({
      ...prev,
      [country]: !prev[country],
    }));
  };
  const handleCounty = (county: string) => {
    setExpandedCountry((prev) => ({
      ...prev,
      [county]: !prev[county],
    }));
  };
  const handleMonthClick = (year: string, month: string) => {
    const key = `${year}-${month}`;
    console.log("Month clicked:", key);
    setExpandedMonths((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleModelTypeClick = (
    year: string,
    month: string,
    modelType: string
  ) => {
    const key = `${year}-${month}-${modelType}`;
    console.log("Model type clicked:", key);
    setExpandedModelTypes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // utility functions for layer classification
  const extractYear = (layerName: string): string | null => {
    const yearMatch = layerName.match(/\b(20\d{2})\b/);
    if (yearMatch) return yearMatch[1];

    // fallback logic for IDW models that have a month but no year
    //will remove this fallback after
    if (
      layerName.toLowerCase().includes("idw_model") &&
      extractMonth(layerName)
    ) {
      return "2024"; // fallback assumption
    }

    return null;
  };

  const extractMonth = (layerName: string): string | null => {
    const monthsMap: { [key: string]: string } = {
      JAN: "January",
      FEB: "February",
      MAR: "March",
      APR: "April",
      MAY: "May",
      JUN: "June",
      JUL: "July",
      AUG: "August",
      SEP: "September",
      OCT: "October",
      NOV: "November",
      DEC: "December",
      dec: "Dec",
    };

    const upperLayerName = layerName.toUpperCase();
    for (const abbr in monthsMap) {
      if (upperLayerName.includes(abbr)) {
        return monthsMap[abbr]; // Always return capitalized short form e.g. "Dec"
      }
    }
    return null;
  };

  // Updated classification functions
  const extractModelType = (layerName: string): string | null => {
    const modelTypes = ["AdaBoost"]; //AdaBoost", "CMP_Model", "GPR_Model", "GAM_Model];
    const lowerLayerName = layerName.toLowerCase();

    // Check for exact model type matches first
    const exactMatch = modelTypes.find((model) =>
      lowerLayerName.includes(model.toLowerCase())
    );

    if (exactMatch) return exactMatch;

    // Check for other model patterns

    //if (lowerLayerName.includes("idw_model")) return "DEC_IDW_Model";
    if (lowerLayerName.includes("vl")) return "VL";
    //if (lowerLayerName.match(/\bmay\s?2025\b/i)) return "Dated_Model";

    return null;
  };

  const isPopulationLayer = (layerName: string): boolean => {
    return layerName.toLowerCase().includes("population");
  };

  const isPredictiveModelLayer = (layerName: string): boolean => {
    const modelType = extractModelType(layerName);
    return !!modelType; // Any layer with a model type is a predictive model
  };
  //from database
  interface GenericModelMetadata {
    name: string;
    title: string;
    year: string;
    month: string;
    modelType: string;
    displayName: string;
  }
  // Updated organization structure
  interface Layer {
    title?: string;
    name?: string;
    displayName?: string;
    group?: {
      groupTitle?: string;
    };
    supportedCRS?: string;
    matrixSet?: string;
    // Add other properties as needed
  }
  //interface for country and county
  interface LocationData {
    diseaseCategory: string;
    diseaseName: string;
    countryName: string;
    countyName: string;
  }
  interface OrganizedLayers {
    [key: string]: any;
    population: Layer[];
    predictiveModels: {
      generic: Layer[]; // Models without dates
      dated: Record<string, Record<string, Record<string, Layer[]>>>; // Year > Month > ModelType > Layers
    };
  }

  const organizeLayersByStructure = (layers: Layer[]): OrganizedLayers => {
    const organized: OrganizedLayers = {
      population: [],
      predictiveModels: {
        generic: [],
        dated: {},
      },
    };

    console.log("STARTING LAYER ORGANIZATION");
    console.log("Total layers to process:", layers.length);

    //from geoserver
    layers.forEach((layer, index) => {
      const identifier = layer.displayName || layer.title || layer.name || "";
      console.log(`\n--- Processing Layer ${index + 1}/${layers.length} ---`);
      console.log("Layer identifier:", identifier);

      if (isPopulationLayer(identifier)) {
        console.log("Adding to population:", identifier);
        organized.population.push(layer);
        return;
      }

      if (isPredictiveModelLayer(identifier)) {
        const year = extractYear(identifier);
        const month = extractMonth(identifier);
        const modelType = extractModelType(identifier);

        console.log("Extracted metadata:");
        console.log("- Year:", year);
        console.log("- Month:", month);
        console.log("- Model Type:", modelType);

        if (year && month && modelType) {
          // Dated model
          console.log(" Adding to dated predictive models:", identifier);

          if (!organized.predictiveModels.dated[year]) {
            organized.predictiveModels.dated[year] = {};
            console.log(`Created year group: ${year}`);
          }
          if (!organized.predictiveModels.dated[year][month]) {
            organized.predictiveModels.dated[year][month] = {};
            console.log(`Created month group: ${year}-${month}`);
          }
          if (!organized.predictiveModels.dated[year][month][modelType]) {
            organized.predictiveModels.dated[year][month][modelType] = [];
            console.log(
              `Created model type group: ${year}-${month}-${modelType}`
            );
          }

          organized.predictiveModels.dated[year][month][modelType].push(layer);
          console.log(`Added dated layer to: ${year}-${month}-${modelType}`);
        } else if (modelType) {
          // Generic model (no date info)
          //also checking if model is present from db, then skips to post it here
          if (!genericMetadataNames.has(identifier)) {
            console.log("Adding to generic models", identifier);
            //present line for pushing if check from geoserver only
            organized.predictiveModels.generic.push(layer);
          } else {
            console.log("Skipping generic models:", identifier);
          }
        }
      } else {
        console.log(" Layer doesn't match any category:", identifier);
      }
    });

    console.log("\n=== FINAL ORGANIZATION RESULTS ===");
    console.log("Population layers count:", organized.population.length);
    console.log(
      "Generic models count:",
      organized.predictiveModels.generic.length
    );
    console.log(
      "Dated models years:",
      Object.keys(organized.predictiveModels.dated)
    );
    //from database, choosing generic model for now
    genericModelMetadata.forEach((meta) => {
      const getMonthName = (monthNumber: number): string => {
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return monthNames[monthNumber - 1] || "Invalid MONTH";
      };

      const matchingLayer = layers.find(
        (layer) => layer.name === meta.name || layer.title === meta.title
      );

      if (matchingLayer) {
        //const { year, month, modelType } = meta;
        const year = meta.year;
        const modelType = meta.modelType;
        const month = getMonthName(parseInt(meta.month));

        if (!organized.predictiveModels.dated[year]) {
          organized.predictiveModels.dated[year] = {};
        }
        if (!organized.predictiveModels.dated[year][month]) {
          organized.predictiveModels.dated[year][month] = {};
        }
        if (!organized.predictiveModels.dated[year][month][modelType]) {
          organized.predictiveModels.dated[year][month][modelType] = [];
        }

        organized.predictiveModels.dated[year][month][modelType].push(
          matchingLayer
        );
      }
    });

    return organized;
  };
  // Fetch location data from database
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const res = await fetch("/api/vectorRiskData"); // Create this API endpoint
        const data = await res.json();
        setLocationData(data);
      } catch (err) {
        console.error("Error fetching location data from DB:", err);
      }
    };

    fetchLocationData();
  }, []);
  const organizeLocationData = (loactionData: LocationData[]) => {
    const organized: Record<
      string,
      Record<string, Record<string, string[]>>
    > = {};

    loactionData.forEach((item) => {
      const { diseaseCategory, diseaseName, countryName, countyName } = item;

      if (!organized[diseaseCategory]) {
        organized[diseaseCategory] = {};
      }
      if (!organized[diseaseCategory][diseaseName]) {
        organized[diseaseCategory][diseaseName] = {};
      }
      if (!organized[diseaseCategory][diseaseName][countryName]) {
        organized[diseaseCategory][diseaseName][countryName] = [];
      }

      if (
        !organized[diseaseCategory][diseaseName][countryName].includes(
          countyName
        )
      ) {
        organized[diseaseCategory][diseaseName][countryName].push(countyName);
      }
    });

    return organized;
  };
  //lets try to handleTrurkana layers click
  //fetch from database
  useEffect(() => {
    const fetchGenericModelsFromDB = async () => {
      try {
        const res = await fetch("/api/vectorRiskData");
        const data = await res.json();
        setGenericModelMetadata(data);
      } catch (err) {
        console.error("Error fetching generic models from DB:", err);
      }
    };

    fetchGenericModelsFromDB();
  }, []);

  // ── Fetch WMTS Layers (remains as in the second code) ──
  useEffect(() => {
    //wait untl displayName loads

    if (!genericModelMetadata.length) return;
    const fetchLayers = async () => {
      if (!geoServerBaseUrl) {
        console.error("GeoServer base URL is not set");
        return;
      }

      try {
        const layers = await fetchWMTSCapabilities();
        //lets try to merge this with db for fetching
        const mergedb = layers.map((layer) => {
          const meta = genericModelMetadata.find(
            (meta) => meta.name === layer.name || meta.title === layer.title
          );

          return {
            ...layer,
            displayName: meta?.displayName || layer.title,
          };
        });
        //changed from layes to mergedb
        setWmtsLayers(mergedb);
      } catch (error) {
        console.error("Error fetching capabilities:", error);
      }
    };
    fetchLayers();
  }, [genericModelMetadata]);

  // ── Initialize the Map (same as your second code) ──
  useEffect(() => {
    if (!mapElement.current || !wmtsLayers.length) return;

    console.log("Creating map with layers:", wmtsLayers);

    // Group layers by their group membership
    const layersByGroup = wmtsLayers.reduce(
      (groups: Record<string, any[]>, layer: any) => {
        const groupTitle = layer.group?.groupTitle || "Ungrouped";
        if (!groups[groupTitle]) {
          groups[groupTitle] = [];
        }
        groups[groupTitle].push(layer);
        return groups;
      },
      {}
    );

    // Create dynamic groups for the map
    const dynamicGroups = Object.entries(layersByGroup).map(
      ([groupTitle, groupLayers]) => {
        const layers = groupLayers
          .map((layer) => {
            const projectionToUse = getProjection(layer.supportedCRS);
            if (!projectionToUse) {
              console.warn(
                `Projection ${layer.supportedCRS} not found for layer ${layer.name}`
              );
              return null;
            }
            return new TileLayer({
              properties: {
                title: layer.title,
                displayName: layer.displayName,
                type: "overlay",
              },
              visible: false,
              source: new WMTS({
                url: `${geoServerBaseUrl}/geoserver/gwc/service/wmts`,
                layer: layer.name,
                matrixSet: layer.matrixSet,
                format: "image/png",
                projection: projectionToUse,
                tileGrid: new WMTSTileGrid({
                  origin: [-180.0, 90.0],
                  resolutions: [
                    0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125,
                    0.02197265625, 0.010986328125, 0.0054931640625,
                    0.00274658203125, 0.001373291015625, 0.0006866455078125,
                    0.00034332275390625, 0.000171661376953125,
                    0.0000858306884765625,
                  ],
                  matrixIds: Array.from(
                    { length: 14 },
                    (_, i) => `EPSG:4326:${i}`
                  ),
                  tileSize: [256, 256],
                  extent: [-180.0, -90.0, 180.0, 90.0],
                }),
                style: "",
                wrapX: true,
                tileLoadFunction: (tile: any, src: string) => {
                  console.log("Loading tile from:", src);
                  const img = tile.getImage();
                  img.onerror = () => {
                    console.error("Tile load error:", src);
                  };
                  img.onload = () => {
                    console.log("Tile loaded successfully:", src);
                  };
                  img.src = src;
                },
              }),
            });
          })

          .filter((layer): layer is TileLayer<any> => layer !== null);

        return new LayerGroup({
          properties: {
            title: groupTitle,
            type: "group",
          },
          layers: new Collection(layers),
        } as LayerGroupOptions);
      }
    );

    // Create base OSM layer
    const osmSource = new OSM();
    const osmLayer = new TileLayer({
      source: new OSM(),
      properties: {
        title: "OpenStreetMap",
        type: "base",
      },
    });
    //loading events
    const incrementLoading = () => {
      if (mapInitializedRef.current) {
        setTilesLoading((prev) => prev + 1);
      }
    };

    const decrementLoading = () => {
      if (mapInitializedRef.current) {
        setTilesLoading((prev) => prev - 1);
      }
    };

    osmSource.on("tileloadstart", incrementLoading);
    osmSource.on("tileloadend", decrementLoading);
    osmSource.on("tileloaderror", decrementLoading);
    // Initialize the map with the groups
    const initialMap = new OlMap({
      target: mapElement.current,
      layers: [
        new LayerGroup({
          properties: { title: "Base Maps" },
          layers: [osmLayer],
        } as LayerGroupOptions),
        ...dynamicGroups,
      ],
      view: new View({
        projection: "EPSG:4326",
        center: [37.9062, -1.2921],
        zoom: 6,
        minZoom: 0,
        maxZoom: 13,
        extent: [-180.0, -90.0, 180.0, 90.0],
      }),
    });
    //one-time event handler
    const handleInitialLoad = () => {
      // Give a small delay to ensure base tiles are loaded
      setTimeout(() => {
        console.log("Map initial render complete - hiding loader");
        setIsLoading(false);

        // Now we can start tracking individual tile loads
        mapInitializedRef.current = true;
      }, 1000);
    };

    // Listen for the map's first render
    initialMap.once("rendercomplete", handleInitialLoad);
    mapRef.current = initialMap;
    return () => {
      osmSource.un("tileloadstart", incrementLoading);
      osmSource.un("tileloadend", decrementLoading);
      osmSource.un("tileloaderror", decrementLoading);
      initialMap.setTarget(undefined);
    };
  }, [wmtsLayers]);

  // ── Drawer & Layer Control Handlers ──

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleOverlaysClick = () => setOverlaysOpen(!overlaysOpen);

  const handleGroupClick = (groupTitle: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  const handleLayerToggle = (layer: any) => {
    if (layer) {
      const newVisibility = !layer.getVisible();
      layer.setVisible(newVisibility);
      if (newVisibility) {
        setActiveLayerName(layer.get("displayName") || layer.get("title"));
        setActiveTitleName(layer.get("title"));
      } else if (
        activeLayerName === layer.get("displayName") ||
        activeLayerName === layer.get("title")
      ) {
        setActiveLayerName(null);
      }
    }
  };

  // Compute grouping for the drawer (using the same logic as in map initialization)
  const computedLayerGroups = wmtsLayers.reduce(
    (groups: Record<string, any[]>, layer: any) => {
      const groupTitle = layer.group?.groupTitle || "Ungrouped";
      if (!groups[groupTitle]) {
        groups[groupTitle] = [];
      }
      groups[groupTitle].push(layer);
      return groups;
    },
    {}
  );

  const renderLayerControls = () => {
    const organized = organizeLayersByStructure(wmtsLayers);
    const locationStructure = organizeLocationData(locationData);

    const layerMeta = {
      diseaseCategory: "Diseases",
      diseaseName: "  Visceral Leishmaniasis",
      countryName: "Kenya",
      countyName: " Turkana",
    };

    return (
      <Collapse in={overlaysOpen} timeout="auto" unmountOnExit>
        <List>
          {/* Diseases */
}

{
  /*Object.entries(locationStructure).map(
            ([diseaseCategory, diseases]) => (
              <React.Fragment key={diseaseCategory}>*
          <ListItemButton onClick={handleDiseasesClick}>
            <ListItemIcon>
              <HealthAndSafety />
            </ListItemIcon>
            <ListItemText primary={layerMeta.diseaseCategory} />
            {diseasesOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </ListItemButton>

          <Collapse in={diseasesOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Visceral Leishmaniasis */
}
{
  /*Object.entries(locationStructure).map(
                      ([diseaseName, country]) => (
                        <React.Fragment key={diseaseName}>*
              <ListItemButton onClick={handleLeishClick} sx={{ pl: 2 }}>
                <ListItemIcon>
                  <BugReportIcon />
                </ListItemIcon>
                <ListItemText primary={layerMeta.diseaseName} />
                {leishOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </ListItemButton>

              <Collapse in={leishOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {/* Kenya *
                  {Object.entries(locationStructure).map(
                    ([countryName, county]) => (
                      <React.Fragment key={countryName}>
                        <ListItemButton
                          onClick={handleKenyaClick}
                          sx={{ pl: 4 }}
                        >
                          <ListItemIcon>
                            <LayersIcon />
                          </ListItemIcon>
                          <ListItemText primary={countryName} />
                          {kenyaOpen ? (
                            <ChevronLeftIcon />
                          ) : (
                            <ChevronRightIcon />
                          )}
                        </ListItemButton>

                        <Collapse in={kenyaOpen} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {/* Turkana *
                            {Object.entries(locationStructure).map(
                              ([countyName, county]) => (
                                <React.Fragment key={countyName}>
                                  {" "}
                                  <ListItemButton
                                    onClick={handleTurkanaClick}
                                    sx={{ pl: 6 }}
                                  >
                                    <ListItemIcon>
                                      <Place />
                                    </ListItemIcon>
                                    <ListItemText primary={countyName} />
                                    {turkanaOpen ? (
                                      <ChevronLeftIcon />
                                    ) : (
                                      <ChevronRightIcon />
                                    )}
                                  </ListItemButton>
                                  <Collapse
                                    in={turkanaOpen}
                                    timeout="auto"
                                    unmountOnExit
                                  >
                                    {/* Dated Predictive Models *
                                    {Object.entries(
                                      organized.predictiveModels.dated
                                    ).map(([year, months]) => (
                                      <React.Fragment key={year}>
                                        <ListItemButton
                                          sx={{ pl: 8 }}
                                          onClick={() => handleYearClick(year)}
                                        >
                                          <ListItemIcon>
                                            <DateRange />
                                          </ListItemIcon>
                                          <ListItemText primary={year} />
                                          {expandedYears[year] ? (
                                            <ChevronLeftIcon />
                                          ) : (
                                            <ChevronRightIcon />
                                          )}
                                        </ListItemButton>

                                        <Collapse
                                          in={expandedYears[year]}
                                          timeout="auto"
                                          unmountOnExit
                                        >
                                          {Object.entries(months).map(
                                            ([month, modelTypes]) => {
                                              const monthKey = `${year}-${month}`;
                                              return (
                                                <React.Fragment key={monthKey}>
                                                  <ListItemButton
                                                    sx={{ pl: 10 }}
                                                    onClick={() =>
                                                      handleMonthClick(
                                                        year,
                                                        month
                                                      )
                                                    }
                                                  >
                                                    <ListItemIcon>
                                                      <CalendarMonth />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                      primary={month}
                                                    />
                                                    {expandedMonths[
                                                      monthKey
                                                    ] ? (
                                                      <ChevronLeftIcon />
                                                    ) : (
                                                      <ChevronRightIcon />
                                                    )}
                                                  </ListItemButton>

                                                  <Collapse
                                                    in={
                                                      expandedMonths[monthKey]
                                                    }
                                                    timeout="auto"
                                                    unmountOnExit
                                                  >
                                                    {Object.entries(
                                                      modelTypes
                                                    ).map(
                                                      ([modelType, layers]) => {
                                                        return (
                                                          <React.Fragment
                                                            key={`${year}-${month}-${modelType}`}
                                                          >
                                                            {layers.map(
                                                              (layer) => {
                                                                const group =
                                                                  mapRef.current
                                                                    ?.getLayers()
                                                                    .getArray()
                                                                    .find(
                                                                      (l) =>
                                                                        l.get(
                                                                          "title"
                                                                        ) ===
                                                                        (layer
                                                                          .group
                                                                          ?.groupTitle ||
                                                                          "Ungrouped")
                                                                    );

                                                                const olLayer =
                                                                  group instanceof
                                                                  LayerGroup
                                                                    ? group
                                                                        .getLayers()
                                                                        .getArray()
                                                                        .find(
                                                                          (l) =>
                                                                            l.get(
                                                                              "displayName"
                                                                            ) ===
                                                                              layer.displayName ||
                                                                            l.get(
                                                                              "title"
                                                                            ) ===
                                                                              layer.title
                                                                        )
                                                                    : null;

                                                                return (
                                                                  <ListItemButton
                                                                    key={
                                                                      layer.displayName ||
                                                                      layer.title
                                                                    }
                                                                    sx={{
                                                                      pl: 12,
                                                                    }}
                                                                    onClick={() =>
                                                                      handleLayerToggle(
                                                                        olLayer
                                                                      )
                                                                    }
                                                                  >
                                                                    <Checkbox
                                                                      edge="start"
                                                                      checked={
                                                                        olLayer?.getVisible() ||
                                                                        false
                                                                      }
                                                                      tabIndex={
                                                                        -1
                                                                      }
                                                                      color="success"
                                                                      disableRipple
                                                                    />
                                                                    <ListItemText
                                                                      primary={
                                                                        layer.displayName ||
                                                                        layer.title ||
                                                                        layer.name ||
                                                                        "Untitled Layer"
                                                                      }
                                                                    />
                                                                  </ListItemButton>
                                                                );
                                                              }
                                                            )}
                                                          </React.Fragment>
                                                        );
                                                      }
                                                    )}
                                                  </Collapse>
                                                </React.Fragment>
                                              );
                                            }
                                          )}
                                        </Collapse>
                                      </React.Fragment>
                                    ))}

                                    {/* Generic Predictive Models *
                                    <ListItemButton
                                      sx={{ pl: 8 }}
                                      onClick={handleGenericModelsClick}
                                    >
                                      <ListItemIcon>
                                        <LayersIcon />
                                      </ListItemIcon>

                                      <ListItemText primary="Generic Models" />
                                      {genericModelsOpen ? (
                                        <ChevronLeftIcon />
                                      ) : (
                                        <ChevronRightIcon />
                                      )}
                                    </ListItemButton>
                                    <Collapse
                                      in={genericModelsOpen}
                                      timeout="auto"
                                      unmountOnExit
                                    >
                                      <List component="div" disablePadding>
                                        {organized.predictiveModels.generic.map(
                                          (layer) => {
                                            const group = mapRef.current
                                              ?.getLayers()
                                              .getArray()
                                              .find(
                                                (l) =>
                                                  l.get("title") ===
                                                  (layer.group?.groupTitle ||
                                                    "Ungrouped")
                                              );

                                            const olLayer =
                                              group instanceof LayerGroup
                                                ? group
                                                    .getLayers()
                                                    .getArray()
                                                    .find(
                                                      (l) =>
                                                        l.get("displayName") ===
                                                          layer.displayName ||
                                                        l.get("title") ===
                                                          layer.title
                                                    )
                                                : null;

                                            return (
                                              <ListItemButton
                                                key={
                                                  layer.displayName ||
                                                  layer.title
                                                }
                                                sx={{ pl: 10 }}
                                                onClick={() =>
                                                  handleLayerToggle(olLayer)
                                                }
                                              >
                                                <Checkbox
                                                  edge="start"
                                                  checked={
                                                    olLayer?.getVisible() ||
                                                    false
                                                  }
                                                  tabIndex={-1}
                                                  color="success"
                                                  disableRipple
                                                />
                                                <ListItemText
                                                  primary={
                                                    layer.displayName ||
                                                    layer.title ||
                                                    layer.name ||
                                                    "Unnamed"
                                                  }
                                                />
                                              </ListItemButton>
                                            );
                                          }
                                        )}
                                      </List>
                                    </Collapse>

                                    {/* Population Layers *
                                    <ListItemButton
                                      sx={{ pl: 8 }}
                                      onClick={handlePopulationClick}
                                    >
                                      <ListItemIcon>
                                        <PeopleIcon />
                                      </ListItemIcon>
                                      <ListItemText primary="Population Data" />
                                      {populationOpen ? (
                                        <ChevronLeftIcon />
                                      ) : (
                                        <ChevronRightIcon />
                                      )}
                                    </ListItemButton>
                                    <Collapse
                                      in={populationOpen}
                                      timeout="auto"
                                      unmountOnExit
                                    >
                                      <List component="div" disablePadding>
                                        {organized.population.map((layer) => {
                                          const group = mapRef.current
                                            ?.getLayers()
                                            .getArray()
                                            .find(
                                              (l) =>
                                                l.get("title") ===
                                                (layer.group?.groupTitle ||
                                                  "Ungrouped")
                                            );

                                          const olLayer =
                                            group instanceof LayerGroup
                                              ? group
                                                  .getLayers()
                                                  .getArray()
                                                  .find(
                                                    (l) =>
                                                      l.get("title") ===
                                                      layer.title
                                                  )
                                              : null;

                                          return (
                                            <ListItemButton
                                              key={layer.title}
                                              sx={{ pl: 10 }}
                                              onClick={() =>
                                                handleLayerToggle(olLayer)
                                              }
                                            >
                                              <Checkbox
                                                edge="start"
                                                checked={
                                                  olLayer?.getVisible() || false
                                                }
                                                tabIndex={-1}
                                                color="success"
                                                disableRipple
                                              />
                                              <ListItemText
                                                primary={layer.title}
                                              />
                                            </ListItemButton>
                                          );
                                        })}
                                      </List>
                                    </Collapse>
                                  </Collapse>
                                </React.Fragment>
                              )
                            )}
                          </List>
                        </Collapse>
                      </React.Fragment>
                    )
                  )}
                </List>
              </Collapse>
            </List>
          </Collapse>
        </List>
      </Collapse>
    );
  };

  // ── Render ──
  return (
    <div
      style={{
        //display: "flex",
        height: "calc(100vh - 70px)",
        position: "relative",
      }}
    >
      <div
        style={{ flexGrow: 1, position: "relative" }}
        ref={mapElement}
        className="map-container"
        id="map-container"
      >
        {(isLoading || tilesLoading > 0) && ( //spinner
          <div className="map-loader">
            <FaGlobe
              size={25}
              color="rgb(65, 126, 113)"
              className="globe icon-spinner"
            />
          </div>
        )}
      </div>
      <Legend layerName={activeTitleName} />
      {/*inline*
      <style>
        {`
              .map-loader{
              position :fixed;
              top : 50%;
              left :50%;
              transform : translate ( -50%, -30%);
              
              }
        
              .icon-spinner{
              display : inline-block;
              animation: spinner 1s infinite linear , colorCycle 2s linear infinite;
              }
              @keyframes spinner {
              0%   { transform: rotate(0deg); } 
              100% { transform: rotate(360deg); }
              }
        
              @keyframes colorCycle {
  0%   { color: green; }
  100%  { color: blue; }
   }
}
              `}
        <div id="map" style={{ width: "100%", height: "100vh" }} />
      </style>

      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <CssBaseline />

        <Toolbar>
          <IconButton
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              mr: 2,
              ...(open && { display: "none" }),
              bgcolor: "rgba(0,0,0,0.04)",
              //color: "rgb(34,148,90)",
              width: "40px",
              height: "40px",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "8px",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 10px 12px  rgb(34,148,90)",
                background: "rgb(41, 77, 58)",
              },
            }}
          >
            <MenuIcon
              sx={{
                fontSize: "24px",
                color: "rgb(34,148,90)",
                fontWeight: "bold",
              }}
            />
          </IconButton>
        </Toolbar>
        {/*</AppBar>*
        <Drawer
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 3,
            width: drawerWidth(),
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth(),
              boxSizing: "border-box",
              borderRight: "1px solid rgba(0,0,0,0.1)",
              boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <div
            onMouseDown={startDragging}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 6,
              height: "100%",
              cursor: "ew-resize",
              zIndex: 999,
            }}
          />
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "ltr" ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>{renderLayerControls()}</List>
          <List sx={{ pl: 2 }}>
            <ListItem disablePadding>
              {" "}
              <Download />
              <ListItemButton
                sx={{
                  color: downloadPopupOpen ? green[600] : "inherit",
                  pl: 4,
                }}
                onClick={() => setDownloadPopupOpen(true)}
              >
                <ListItemText primary="Download Map Data" />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>

        <div
          ref={mapElement}
          className="map-container"
          id="map-container"
          style={{
            //flexGrow: 1,
            display: "flex",
            width: "100%",
            height: "calc(100vh - 64px",
            position: "relative",
          }}
        ></div>
        <Legend layerName={activeTitleName} />
        {/* Download Popup moved outside drawer *
        <Dialog
          open={downloadPopupOpen}
          onClose={() => setDownloadPopupOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxHeight: "80vh",
              overflow: "auto",
            },
          }}
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Download Map Data</Typography>
              <Typography variant="body1">Select a filter:</Typography>
              <SearchIcon />

              <IconButton onClick={() => setDownloadPopupOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <DownloadPopup
              isOpen={downloadPopupOpen}
              onClose={() => setDownloadPopupOpen(false)}
              cqlFilter={cqlFilter || ""}
            />
          </DialogContent>
        </Dialog>
        {/*</Main>*
      </Box>
    </div>
  );


export default Newmap;
*/
}
