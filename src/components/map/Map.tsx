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
// import DrawerComp from "./DrawerComp";
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
import Legend from "./Legend";

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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const mapRef = useRef<OlMap>();
  const mapElement = useRef<HTMLDivElement>(null);
  const [wmtsLayers, setWmtsLayers] = useState<any[]>([]);
  const [activeLayerName, setActiveLayerName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const navMenuItems = [
    <Link href="/about" key="about" style={{ margin: "0 10px" }}>
      About
    </Link>,
    <Link href="/contact" key="contact" style={{ margin: "0 10px" }}>
      Contact
    </Link>,
  ];

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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

  // Update map size when drawer opens/closes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.updateSize();
    }
  }, [open]);

  useEffect(() => {
    if (!mapElement.current || !wmtsLayers.length) return;

    console.log("Creating map with layers:", wmtsLayers);

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
          .filter((layer) => layer !== null);

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

    const layerSwitcher = new LayerSwitcher({
      startActive: true,
      groupSelectStyle: "children",
    } as any);
    initialMap.addControl(layerSwitcher);

    dynamicGroups.forEach((group) => {
      const groupLayers = group.getLayers();
      if (groupLayers) {
        groupLayers.forEach((layer: any) => {
          if (layer) {
            layer.on("change:visible", (event: any) => {
              const isVisible = event.target.getVisible();
              const layerName = event.target.get("title");

              if (isVisible) {
                setActiveLayerName(layerName);
                console.log(`Layer ${layerName} is now visible`);
              } else if (activeLayerName === layerName) {
                setActiveLayerName(null);
              }
            });
          }
        });
      }
    });

    mapRef.current = initialMap;

    return () => {
      initialMap.setTarget(undefined);
    };
  }, [wmtsLayers]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ bgcolor: "white", margin: "0", padding: "0" }}
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
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
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
          {["Layer Controls", "Base Maps", "Overlays"].map((text, index) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        <DrawerHeader /> {/* This pushes the content below the app bar */}
        <div
          ref={mapElement}
          className="map-container"
          id="map-container"
          style={{
            width: "100%",
            height: "calc(100vh - 64px)", // Adjust height to account for app bar
            position: "relative",
          }}
        ></div>
        <Legend layerName={activeLayerName} />
      </Main>
    </Box>
  );
};

export default Newmap;
