"use client";
import React, { useEffect, useRef, useState } from "react";
import { styled, useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
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
import { Place, Map } from "@mui/icons-material";

import Collapse from "@mui/material/Collapse";
import Checkbox from "@mui/material/Checkbox";
import PeopleIcon from "@mui/icons-material/People";
import Link from "next/link";
//import HealthAndSafety  from "@mui/icons-material/HealthAndSafety";
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
//import { Button } from "@mui/material";
import NavLink from "../shared/navlink";
import { useRouter } from "next/router";
import { HealthAndSafety } from "@mui/icons-material";

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

/*const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
    marginTop: 0,
  }),
}));*/
/*
interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  backgroundColor: "white",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));*/

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

  // States for map layers and active layer name
  const [wmtsLayers, setWmtsLayers] = useState<any[]>([]);
  const [activeLayerName, setActiveLayerName] = useState<string | null>(null);

  // States for drawer and layer control UI
  const [open, setOpen] = useState(true); // default to open
  const [overlaysOpen, setOverlaysOpen] = useState(true);
  const [turkanaOpen, setTurkanaOpen] = useState(false);
  const [kenyaOpen, setKenyaOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
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
  // ── Fetch WMTS Layers (remains as in the second code) ──
  useEffect(() => {
    const fetchLayers = async () => {
      if (!geoServerBaseUrl) {
        console.error("GeoServer base URL is not set");
        return;
      }
      try {
        const layers = await fetchWMTSCapabilities();
        console.log("Fetched WMTS layers:", layers);
        setWmtsLayers(layers);
      } catch (error) {
        console.error("Error fetching capabilities:", error);
      }
    };
    fetchLayers();
  }, []);

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
  const handleTurkanaClick = () => setTurkanaOpen(!turkanaOpen);

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
        setActiveLayerName(layer.get("title"));
      } else if (activeLayerName === layer.get("title")) {
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

  const renderLayerControls = () => (
    <Collapse in={overlaysOpen} timeout="auto" unmountOnExit>
      {Object.entries(computedLayerGroups).map(([groupTitle, groupLayers]) => (
        <div key={groupTitle}>
          <ListItemButton
            onClick={() => handleGroupClick(groupTitle)}
            sx={{
              pl: 4,
              py: 1,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
              backgroundColor: expandedGroups[groupTitle]
                ? alpha(green[500], 0.1)
                : "transparent",
            }}
          >
            <ListItemIcon>
              <PeopleIcon
                style={{
                  color: expandedGroups[groupTitle] ? green[500] : "inherit",
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={groupTitle}
              primaryTypographyProps={{
                fontWeight: expandedGroups[groupTitle] ? 600 : 400,
                color: expandedGroups[groupTitle] ? green[500] : "inherit",
              }}
            />
            {expandedGroups[groupTitle] ? (
              <ChevronLeftIcon sx={{ color: green[500] }} />
            ) : (
              <ChevronRightIcon />
            )}
          </ListItemButton>
          <Collapse
            in={expandedGroups[groupTitle]}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {groupLayers.map((layer) => {
                // Find the corresponding OL layer from the map
                {
                  /*const olLayer = mapRef.current
                  ?.getLayers()
                  .getArray()
                  .find((l: any) => l.get("title") === groupTitle)
                  ?.getLayers()
                  .getArray()
                  .find((l: any) => l.get("title") === layer.title);*/
                }
                //change the above code to this
                const group = mapRef.current
                  ?.getLayers()
                  .getArray()
                  .find((l: any) => l.get("title") === groupTitle);

                const olLayer =
                  group instanceof LayerGroup
                    ? group
                        .getLayers()
                        .getArray()
                        .find((l: any) => l.get("title") === layer.title)
                    : null;

                return (
                  <ListItemButton
                    key={layer.title}
                    sx={{ pl: 8 }}
                    onClick={() => handleLayerToggle(olLayer)}
                  >
                    <Checkbox
                      edge="start"
                      checked={olLayer?.getVisible() || false}
                      tabIndex={-1}
                      color="success"
                      disableRipple
                    />
                    <ListItemText primary={layer.title} />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        </div>
      ))}
    </Collapse>
  );

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
      <Legend layerName={activeLayerName} />
      {/*inline*/}
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
              animation: spin 1s linear infinite;
              }
        
              @keyframes spin{
               0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
              }
              `}
        <div id="map" style={{ width: "100%", height: "100vh" }} />
      </style>

      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <CssBaseline />
        {/*<AppBar
          position="fixed"
          open={open}
          sx={{
            bgcolor: "white",
            margin: 0,
            padding: 0,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
          }}
        >*/}
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

          {/*<NavLink key="About" url="./about" text="About" />
          <NavLink key="Register" url="./auth/register" text="Register" />*/}
        </Toolbar>
        {/*</AppBar>*/}
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
          <List>
            {/*<ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Layer Controls" />
              </ListItemButton>
            </ListItem>*/}
            {/* <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText primary="Base Maps" />
              </ListItemButton>
            </ListItem>*/}
            {/*<ListItem disablePadding>
              <Box
                  <ListItemText
                    primary="Download Data"
                    secondary="Export map data"
                    primaryTypographyProps={{
                      fontWeight: downloadPopupOpen ? 600 : 400,
                      color: downloadPopupOpen ? green[500] : "inherit",
                    }}
                  />
                  {downloadPopupOpen ? (
                    <ChevronLeftIcon sx={{ color: green[500] }} />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </ListItemButton>        sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                }}
              >
                <ListItemButton
                  onClick={() => setDownloadPopupOpen(!downloadPopupOpen)}
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                    backgroundColor: downloadPopupOpen
                      ? alpha(green[500], 0.1)
                      : "transparent",
                  }}
                >
                  <ListItemIcon>
                    <DownloadIcon
                      sx={{ color: downloadPopupOpen ? green[500] : "inherit" }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Download Data"
                    secondary="Export map data"
                    primaryTypographyProps={{
                      fontWeight: downloadPopupOpen ? 600 : 400,
                      color: downloadPopupOpen ? green[500] : "inherit",
                    }}
                  />
                  {downloadPopupOpen ? (
                    <ChevronLeftIcon sx={{ color: green[500] }} />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </ListItemButton>
              </Box>
            </ListItem>*/}
            {/* Diseases */}
            <ListItem disablePadding>
              <ListItemButton onClick={handleDiseasesClick}>
                <ListItemIcon>
                  <HealthAndSafety />
                </ListItemIcon>
                <ListItemText primary="Diseases" />
                {diseasesOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </ListItemButton>
            </ListItem>

            {/* Leishmaniasis inside Diseases */}
            <Collapse in={diseasesOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding sx={{ pl: 2 }}>
                  <ListItemButton onClick={handleLeishClick}>
                    <ListItemIcon>
                      <BugReportIcon />
                    </ListItemIcon>
                    <ListItemText primary="Leishmaniasis" />
                    {leishOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                  </ListItemButton>
                </ListItem>

                {/*Country nesting */}
                <Collapse in={leishOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem disablePadding sx={{ pl: 4 }}>
                      <ListItemButton onClick={handleCountryClick}>
                        <ListItemIcon>
                          <Map />
                        </ListItemIcon>
                        <ListItemText primary="Country" />
                        {countryOpen ? (
                          <ChevronLeftIcon />
                        ) : (
                          <ChevronRightIcon />
                        )}
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Collapse>

                {/* Overlays inside Leishmaniasis */}
                {/*change overlays name only to Kenya*/}
                <Collapse in={countryOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItem disablePadding sx={{ pl: 4 }}>
                      <ListItemButton onClick={handleKenyaClick}>
                        <ListItemIcon>
                          <LayersIcon />
                        </ListItemIcon>
                        <ListItemText primary="Kenya" />
                        {overlaysOpen ? (
                          <ChevronLeftIcon />
                        ) : (
                          <ChevronRightIcon />
                        )}
                      </ListItemButton>
                    </ListItem>

                    {/*Turkana inside Kenya */}
                    <Collapse in={kenyaOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ pl: 6 }}>
                        <ListItem disablePadding sx={{ pl: 2 }}>
                          <ListItemButton onClick={handleTurkanaClick}>
                            <ListItemIcon>
                              <Place />
                            </ListItemIcon>
                            <ListItemText primary="Turkana" />
                            {turkanaOpen ? (
                              <ChevronLeftIcon />
                            ) : (
                              <ChevronRightIcon />
                            )}
                          </ListItemButton>
                        </ListItem>
                      </List>
                    </Collapse>

                    <Collapse in={turkanaOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ pl: 6 }}>
                        {renderLayerControls()}
                      </List>
                    </Collapse>
                  </List>
                </Collapse>
              </List>
            </Collapse>
          </List>
        </Drawer>
        {/*<Main open={open}>*/}
        {/*
          //its another form of drawer in the body enclosed
          <DrawerHeader />
          <Box
            sx={{
              //position: "fixed",
              //left: 0,
              //top: "80px",
              //zIndex: (theme) => theme.zIndex.drawer + 4,
              display: open ? "none" : "block",
              bgcolor: "white",
              //borderRadius: "0 4px 4px 0",
              //boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
              p: 1.5,
              //cursor: "pointer",
              //transition: "all 0.2s ease-in-out",
              // "&:hover": {
              // bgcolor: "rgba(0,0,0,0.04)",
              // transform: "translateX(4px)",
              //boxShadow: "4px 0 8px rgba(0,0,0,0.15)",
              // },
            }}
            //onClick={handleDrawerOpen}
          >
            <MenuIcon
              sx={{
                color: "primary.main",
                fontSize: "28px",
                display: "block",
              }}
            />
          </Box>*/}
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
        <Legend layerName={activeLayerName} />

        {/* Download Popup moved outside drawer */}
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
        {/*</Main>*/}
      </Box>
    </div>
  );
}

export default Newmap;
