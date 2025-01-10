import React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import HelpIcon from "@mui/icons-material/Help";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import OpenFilterButton from "../filters/OpenFilterButton";
import Newmap from "./Map"; // Import the OpenLayers map component
import dynamic from "next/dynamic";

// const drawerWidth = 240;

const MapWrapper = dynamic(() => import("./MapWrapper"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

const drawerWidth = 240; // Define drawerWidth here

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

// const closedMixin = (theme: Theme): CSSObject => ({
//   transition: theme.transitions.create("width", {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.enteringScreen,
//   }),
//   overflowX: "hidden",
// });

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean; // state
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

interface DrawerComponentProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  filterOpen: boolean;
  setFilterOpen: (value: boolean) => void;
  printToScale: () => void;
  handleDownloadClick: () => void;
}

export function DrawerComponent({
  sidebarOpen,
  toggleSidebar,
  filterOpen,
  setFilterOpen,
  printToScale,
  handleDownloadClick,
}: DrawerComponentProps) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(sidebarOpen);

  const handleDrawerOpen = () => {
    setOpen(true);
    toggleSidebar();
  };

  const handleDrawerClose = () => {
    setOpen(false);
    toggleSidebar();
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={sidebarOpen}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={[{ marginRight: 5 }, sidebarOpen && { display: "none" }]}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Map Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={sidebarOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="filter-dev-button">
                <OpenFilterButton
                  filterOpen={filterOpen}
                  onClick={() => setFilterOpen(!filterOpen)}
                />
              </div>
            </div>
          </ListItem>

          <ListItem>
            <div
              className="print-dev-button"
              style={{ display: "flex", alignItems: "center" }}
            >
              <IconButton onClick={printToScale}>
                <PrintIcon
                  style={{
                    color: "#038543",
                    fontWeight: "bold",
                    fontSize: "1.85rem",
                  }}
                />
              </IconButton>
            </div>
          </ListItem>

          <ListItem>
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={handleDownloadClick}>
                <DownloadIcon
                  style={{
                    color: "#038543",
                    fontWeight: "bold",
                    fontSize: "1.9rem",
                  }}
                />
              </IconButton>
            </div>
          </ListItem>

          <ListItem>
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconButton>
                <PersonIcon
                  style={{
                    color: "#038543",
                    fontWeight: "bold",
                    fontSize: "1.9rem",
                  }}
                />
              </IconButton>
            </div>
          </ListItem>

          <ListItem>
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconButton>
                <HelpIcon
                  style={{
                    color: "#038543",
                    fontWeight: "bold",
                    fontSize: "1.9rem",
                  }}
                />
              </IconButton>
            </div>
          </ListItem>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: "64px", // AppBar height
          marginLeft: open ? `${drawerWidth}px` : 0,
          width: open ? `calc(100% - ${drawerWidth}px)` : "100%",
          height: "calc(100vh - 64px)", // Full height minus AppBar
        }}
      >
        <MapWrapper />
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <MapWrapper />
      </Box>
    </Box>
  );
}

export default DrawerComponent;
