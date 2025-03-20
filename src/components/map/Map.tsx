
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
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import Collapse from "@mui/material/Collapse";
import Checkbox from "@mui/material/Checkbox";
import FolderIcon from "@mui/icons-material/Folder";
import Link from "next/link";

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
import { geoServerBaseUrl, fetchWMTSCapabilities } from "@/api/requests";
import Legend from "./Legend";
import { green } from "@mui/material/colors";
import DownloadPopup from "./DownloadPopup";
import { Options as LayerGroupOptions } from "ol/layer/Group";

// ─── Constants & Styled Components ────────────────────────────────────────────

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
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
}));

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
}));

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
  const theme = useTheme();
  const mapRef = useRef<OlMap>();
  const mapElement = useRef<HTMLDivElement>(null);

  // States for map layers and active layer name
  const [wmtsLayers, setWmtsLayers] = useState<any[]>([]);
  const [activeLayerName, setActiveLayerName] = useState<string | null>(null);

  // States for drawer and layer control UI
  const [open, setOpen] = useState(true); // default to open
  const [overlaysOpen, setOverlaysOpen] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [downloadPopupOpen, setDownloadPopupOpen] = useState(false);
  const [cqlFilter, setCqlFilter] = useState<string | null>(null);

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
    const osmLayer = new TileLayer({
      source: new OSM(),
      properties: {
        title: "OpenStreetMap",
        type: "base",
      },
    });

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


    mapRef.current = initialMap;
    return () => {
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
              <FolderIcon
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
                const olLayer = mapRef.current
                  ?.getLayers()
                  .getArray()
                  .find((l: any) => l.get("title") === groupTitle)
                  ?.getLayers()
                  .getArray()
                  .find((l: any) => l.get("title") === layer.title);
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
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        sx={{ bgcolor: "white", margin: 0, padding: 0 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, mt: "6px" }}>
            <Link href="/">
              <picture>
                <img
                  src={"/Animals-Mosquito-icon.png"}
                  style={{ maxHeight: "70px", cursor: "pointer" }}
                  alt="Dudu Mapper logo"
                />
              </picture>
            </Link>
          </Box>
          <Typography variant="h6" noWrap component="div">
            Dudumapper
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 3,
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
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
        <Box
          sx={{
            display: "flex",

            justifyContent: "flex-start",
            alignItems: "center",
            pl: 2,
            mb: 1,
            mt: -4.7,
          }}
        >
          <Link href="/">
            <picture>
              <img
                src={"/Animals-Mosquito-icon.png"}
                style={{ maxHeight: "70px", cursor: "pointer" }}
                alt="Dudu Mapper logo"
              />
            </picture>
          </Link>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Layer Controls" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Base Maps" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                mb: downloadPopupOpen ? 2 : 0,
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
                  <InboxIcon
                    sx={{ color: downloadPopupOpen ? green[500] : "inherit" }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary="Download"
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
              <Collapse
                in={downloadPopupOpen}
                timeout="auto"
                unmountOnExit
                sx={{
                  position: "relative",
                  zIndex: 1,
                  backgroundColor: "background.paper",
                  borderRadius: 1,
                  boxShadow: downloadPopupOpen ? 1 : 0,
                  mt: 0.5,
                  mb: downloadPopupOpen ? 2 : 0,
                }}
              >
                <Box sx={{ padding: "200px", transition: "all 0.3s ease" }}>
                  <DownloadPopup
                    isOpen={downloadPopupOpen}
                    onClose={() => setDownloadPopupOpen(false)}
                    cqlFilter={cqlFilter || ""}
                  />
                </Box>
              </Collapse>
            </Box>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleOverlaysClick}>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Overlays" />
              {overlaysOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </ListItemButton>
          </ListItem>
          {renderLayerControls()}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <div
          ref={mapElement}
          className="map-container"
          id="map-container"
          style={{
            width: "100%",
            height: "calc(100vh - 64px)",
            position: "relative",
          }}
        ></div>
        <Legend layerName={activeLayerName} />
      </Main>
    </Box>
  );
}

export default Newmap;
