import {IconButton, Tooltip} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import React from "react";

function OpenFilterButton({filterOpen, onClick} : {filterOpen: boolean, onClick: any}) {
    return (
        <div className="filter-dev-button">
            <Tooltip title={filterOpen ? "Hide Filters" : "Show Filters"} arrow>
                <IconButton
                    className="custom-icon-button"
                    style={{color: "white"}}
                    onClick={onClick}
                >
                    <TuneIcon/>
                </IconButton>
            </Tooltip>
        </div>
    )
}
export default OpenFilterButton