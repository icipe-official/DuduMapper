import {Control} from "ol/control";
import {IconButton, Tooltip} from "@mui/material";
import LayersIcon from "@mui/icons-material/Layers";
import React from "react";

export default function OverlaysButton ({overlayOpen}: {overlayOpen: boolean}) {
    return (
        <Tooltip title={overlayOpen ? "Hide Overlays" : "Show Overlays"} arrow>
            <IconButton>
                <LayersIcon/>
            </IconButton>
        </Tooltip>
    )
}