import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Stack,
  Card,
  CardHeader,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CardMedia from "@mui/material/CardMedia";

const LEGEND_URL2 =
  "http://4.221.32.87:8080/geoserver/overlays/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image/png&width=10&height=20&layer=LAYER_NAME&LEGEND_OPTIONS=fontSize:6;fontAntiAliasing:true;dpi:200";

interface OverlaysLegendProps {
  isOpen: boolean;
  onClose: () => void;
  overlays: string[];
  resolution: number;
  speciesLegendDiv: any;
}

const OverlaysLegend: React.FC<OverlaysLegendProps> = ({
  isOpen,
  onClose,
  overlays,
  resolution,
  speciesLegendDiv,
}) => {
  function legendUrl(overlay: string) {
    return LEGEND_URL2.replace("LAYER_NAME", overlay);
  }

  return (
    <Box
      className={`download-popup ${isOpen ? "open" : "closed"}`}
      sx={{
        //display: "flex",
        alignItems: "flex-start",
        m: 1,
        position: "absolute",
        top: "50%",
        left: "15%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        borderRadius: "6px ",
        p: 1,
        height: "auto",
         width: 200,
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: "5px",
          right: "5px",
          marginBottom: "15px",
        }}
      >
        <CloseIcon />
      </IconButton>
      <Stack
        spacing={2}
        sx={{ mt: 5, overflow: "scroll", height: 394, width: "100%" }}
      >
        {speciesLegendDiv && (
          <Box>
            <Stack spacing={2}>
              <h4 style={{ color: "green" }}>Species Legend</h4>
              <div
                style={{
                  width: "95%",
                  marginLeft: 25,
                  marginTop: "10px",
                  textAlign: "left",
                  justifyContent: "center",
                }}
              >
                {speciesLegendDiv}
              </div>
            </Stack>
          </Box>
        )}
        {overlays && (
          <div>
            <h4 style={{ color: "green", width: "100%" }}>Overlays Legend</h4>
            <Stack spacing={2}>
              {overlays.map((item, index) => (
                <div key={index}>
                  <p style={{ color: "red" }}>{item}</p>
                  <img
                    style={{ width: "30%" }}
                    src={legendUrl(item)}
                    alt="Legend"
                  />
                </div>
              ))}
            </Stack>
          </div>
        )}
      </Stack>
    </Box>
  );
};

export default OverlaysLegend;
