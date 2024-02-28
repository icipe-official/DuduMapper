import { IconButton, Tooltip } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import React from "react";

function OpenFilterButton({
  filterOpen,
  onClick,
}: {
  filterOpen: boolean;
  onClick: any;
}) {
  return (
    <div className="filter-dev-button">
      <Tooltip title={filterOpen ? "Hide Filters" : "Show Filters"} arrow>
        <IconButton
          className="custom-icon-button"
          style={{ color: "#f4f4f4" }}
          onClick={onClick}
        >
          <TuneIcon style={{ fontSize: "1.7rem" }} />
        </IconButton>
      </Tooltip>
    </div>
  );
}
export default OpenFilterButton;
