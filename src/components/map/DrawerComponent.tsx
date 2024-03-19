import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import "../map/map_drawer.css";
import OpenFilterButton from "../filters/OpenFilterButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import HelpIcon from "@mui/icons-material/Help";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import LegendToggleIcon from "@mui/icons-material/LegendToggle";

interface DrawerProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  filterOpen: boolean;

  setFilterOpen: (value: boolean) => void;

  printToScale: () => void;
  handleDownloadClick: () => void;
  legendOpen: boolean;
  setLegendOpen: (value: boolean) => void;
}

const DrawerComponent: React.FC<DrawerProps> = ({
  sidebarOpen,
  toggleSidebar,
  filterOpen,
  setFilterOpen,
  printToScale,
  handleDownloadClick,
  legendOpen,
  setLegendOpen,
}) => {
  return (
    <Box sx={{ zIndex: 1, overflow: "auto" }}>
      {sidebarOpen && (
        <div className="drawer-overlay" onClick={toggleSidebar}></div>
      )}
      <Drawer
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
        className={`drawer ${sidebarOpen ? "" : "closed"}`}
        sx={{ width: sidebarOpen ? "250px" : "55px" }}
      >
        <div>
          <List
            style={{
              width: "55px",
            }}
          >
            <ListItem button onClick={toggleSidebar}>
              <Tooltip title="Close" arrow>
                <ArrowBackIcon style={{ marginTop: "70px" }} />
              </Tooltip>
            </ListItem>
            {/* OpenFilterButton and OccurrenceFilter */}
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

            {/* Print map button */}
            <ListItem>
              <div
                className="print-dev-button"
                style={{ display: "flex", alignItems: "center" }}
              >
                <Tooltip title="Print map image" arrow>
                  <IconButton onClick={printToScale}>
                    <PrintIcon
                      style={{
                        color: "#038543",
                        fontWeight: "bold",
                        left: "10px",
                        fontSize: "1.85rem",
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
            </ListItem>

            {/*Download */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="dummy-dev-button">
                <ListItem>
                  <Tooltip title="Download" arrow>
                    <IconButton onClick={handleDownloadClick}>
                      <DownloadIcon
                        style={{
                          color: "#038543",
                          fontWeight: "bold",
                          fontSize: "1.9rem",
                          marginTop: "10px",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              </div>
            </div>
            {/* Profile */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="dummy-dev-button">
                <ListItem>
                  <Tooltip title="User Profile" arrow>
                    <IconButton>
                      <PersonIcon
                        style={{
                          color: "#038543",
                          fontWeight: "bold",
                          fontSize: "1.9rem",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              </div>
            </div>
            {/* Help */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="dummy-dev-button">
                <ListItem>
                  <Tooltip title="Help" arrow>
                    <IconButton>
                      <HelpIcon
                        style={{
                          color: "#038543",
                          fontWeight: "bold",
                          fontSize: "1.9rem",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              </div>
            </div>
            {/* Legends */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div className="dummy-dev-button">
                <ListItem>
                  <Tooltip title="Legend" arrow>
                    <IconButton onClick={() => setLegendOpen(!legendOpen)}>
                      <LegendToggleIcon
                        style={{
                          color: "white",
                          backgroundColor: "#038543",
                          fontWeight: "bold",
                          fontSize: "1.9rem",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              </div>
            </div>
          </List>
        </div>
      </Drawer>
    </Box>
  );
};

export default DrawerComponent;
