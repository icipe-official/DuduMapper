"use client";
import React, { useEffect, useRef, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
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
import { useMediaQuery } from "@mui/material";
import Link from "next/link"; // Ensure this is imported correctly
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
import { geoServerBaseUrl, fetchWMTSCapabilities } from "@/api/requests";
import { fromLonLat } from "ol/proj";
import { getTopLeft, getWidth } from "ol/extent";
import { Options as LayerGroupOptions } from "ol/layer/Group";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Collapse } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import LayersIcon from "@mui/icons-material/Layers";
import MapIcon from "@mui/icons-material/Map";
import FolderIcon from "@mui/icons-material/Folder";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import DownloadPopup from "./DownloadPopup";
import Button from "@mui/material/Button";
import { Download } from "lucide-react";
import Legend from "./Legend";
import { green } from "@mui/material/colors";
import ProgressBar from "./ProgressBar";
import CircularProgress from "@mui/material";
//import MapWithLoader from "./MapWithLoader";
//import page from "./page";
//map component progressbar
/*
const NewMap = () => {
  const [countdown, setCountdown] = useState(5); // Start from 3 seconds
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setLoading(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Decrease every 1 second

    return () => clearInterval(timer);
  }, []);
  // Define NewMap inside MapComponent

  return (
    <Box sx={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Show countdown before map loads /}
      {loading ? (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <Typography variant="h4">Loading map in {countdown}...</Typography>
        </Box>
      ) : (
        <Box id="map-container" sx={{ width: "100%", height: "100%" }}>
          {/* Your map component should render here /}
        </Box>
      )}
    </Box>
  );
};
*/
// we take over the map component
const drawerWidth = 240;

// Styled Main component for map container

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
  }),
}));

// AppBar styling
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
//reverse

// Drawer Header
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

// Projection and matrix calculations
const projection4326 = getProjection("EPSG:4326");
const projectionExtent4326 = projection4326?.getExtent();
const size4326 = projectionExtent4326
  ? getWidth(projectionExtent4326) / 256
  : 0;
const resolutions4326 = projectionExtent4326
  ? Array.from({ length: 19 }, (_, z) => size4326 / Math.pow(2, z))
  : [];
const matrixIds4326 = Array.from({ length: 19 }, (_, z) => `EPSG:4326:${z}`);

const Newmap = () => {
  const theme = useTheme();
  const mapRef = useRef<OlMap>();
  const mapElement = useRef<HTMLDivElement>(null);
  const [wmtsLayers, setWmtsLayers] = useState<any[]>([]);
  const [activeLayerName, setActiveLayerName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [overlaysOpen, setOverlaysOpen] = useState(false);
  const [layerGroups, setLayerGroups] = useState<Record<string, any[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [downloadPopupOpen, setDownloadPopupOpen] = useState(false);
  const [cqlFilter, setCqlFilter] = useState<string | null>(null);

  const handleLayerSelection = (layer: any) => {
    const filter = `layer_name='${layer.get("title")}'`; // Example filter
    setCqlFilter(filter);
  };

  // Handle drawer states

  // const [downloadPopupOpen, setDownloadPopupOpen] = useState(false);
  // const [cqlFilter, setCqlFilter] = useState<string | null>(null);
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleOverlaysClick = () => setOverlaysOpen(!overlaysOpen);

  // Handle group expansion
  const handleGroupClick = (groupTitle: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupTitle]: !prev[groupTitle],
    }));
  };

  // Handle layer visibility
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

  useEffect(() => {
    const fetchLayers = async () => {
      if (!geoServerBaseUrl) {
        console.error("GeoServer base URL is not set");
        return;
      }

      try {
        const layers = await fetchWMTSCapabilities();
        setWmtsLayers(layers);

        // Organize layers by group
        const groupedLayers = layers.reduce(
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

        setLayerGroups(groupedLayers);
      } catch (error) {
        console.error("Error fetching capabilities:", error);
      }
    };

    fetchLayers();
  }, []);
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.updateSize();
    }
  }, [open]);

  useEffect(() => {
    if (!mapElement.current || !wmtsLayers.length) return;

    const dynamicGroups = Object.entries(layerGroups).map(
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
        });
      }
    );

    const osmLayer = new TileLayer({
      source: new OSM(),
      properties: {
        title: "OpenStreetMap",
        type: "base",
      },
    });

    const initialMap = new OlMap({
      target: mapElement.current,
      layers: [
        new LayerGroup({
          properties: {
            title: "Base Maps",
          },
          layers: [osmLayer],
        }),
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
  }, [wmtsLayers, layerGroups]);

  const renderLayerControls = () => (
    <Collapse in={overlaysOpen} timeout="auto" unmountOnExit>
      {Object.entries(layerGroups).map(([groupTitle, groupLayers]) => (
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
                  color: expandedGroups[groupTitle] ? green[500] : "inherit", // Green when expanded, default otherwise
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={groupTitle}
              primaryTypographyProps={{
                fontWeight: expandedGroups[groupTitle] ? 600 : 400,
                color: expandedGroups[groupTitle]
                  ? green[500] // Green text when expanded
                  : "inherit", // default color otherwise
              }}
            />
            {expandedGroups[groupTitle] ? (
              <ExpandLess style={{ color: green[500] }} />
            ) : (
              <ExpandMore />
            )}
          </ListItemButton>
          <Collapse
            in={expandedGroups[groupTitle]}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {groupLayers.map((layer) => {
                const olLayer = mapRef.current
                  ?.getLayers()
                  .getArray()
                  .find((l: any) => l.get("title") === groupTitle)
                  ?.getLayers()
                  .getArray()
                  .find((l: any) => l.get("title") === layer.title);

                const isVisible = olLayer?.getVisible() || false;

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        sx={{ bgcolor: "white", margin: "0", padding: "0" }}
      >
        <Toolbar>
          <IconButton
            //color="inherit"
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
          {/* <Button
            variant="contained"
            color="primary"
            onClick={() => setDownloadPopupOpen(true)}
            sx={{ ml: 2 }}
          >
            Open Download
          </Button> */}
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            // position: "relative",
          },
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
                    sx={{
                      color: downloadPopupOpen ? green[500] : "inherit",
                    }}
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
                  <ExpandLess sx={{ color: green[500] }} />
                ) : (
                  <ExpandMore />
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
                <Box sx={{ padding: " 200px", transition: "all 0.3s ease" }}>
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
              {overlaysOpen ? <ExpandLess /> : <ExpandMore />}
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
        />

        <Legend layerName={activeLayerName} />
      </Main>
    </Box>
  );
};

export default Newmap;
