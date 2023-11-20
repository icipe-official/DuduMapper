// filtersection.js
import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Grid,
  Collapse,
  Typography,
  Tooltip,
  IconButton,
  colors,
} from "@mui/material";
import FilterIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import TuneIcon from "@mui/icons-material/Tune";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WbSunnyIcon from "@mui/icons-material/WbSunny";

const FilterSection = () => {
  const [open, setOpen] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedControl, setSelectedControl] = useState("");
  const [selectedAdult, setSelectedAdult] = useState("");
  const [selectedLarval, setSelectedLarval] = useState("");

  const handleDiseaseChange = (event: { target: { value: any } }) => {
    const selectedDisease = event.target.value;
  };

  const handleCountryChange = (event: { target: { value: any } }) => {
    const selectedCountry = event.target.value;
  };

  const handleSpeciesChange = (event: { target: { value: any } }) => {
    const selectedSpecies = event.target.value;
  };

  const handleApplyFilters = () => {
    console.log("Filters Applied:", {
      selectedDisease,
      selectedCountry,
      selectedSpecies,
      selectedSeason,
      selectedControl,
      selectedAdult,
      selectedLarval,
    });
  };

  const formControlStyle = {
    marginBottom: "15px",
    minWidth: "60%",
    minHeight: "2px",
    fontSize: "5px",
    // padding: '0.3px',
  };

  const containerStyle = {
    backgroundColor: "#f4f4f4", // Add your desired gray background color
    borderRadius: "3px",
    padding: "15px",
    display: "flex",
    // flexDirection: 'column',
    alignItems: "center",
  };
  const buttonContainerStyle = {
    marginTop: "35px",
    // display: 'flex',
    // justifyContent: 'center',
    // alignItems: 'center',
    margin: "0 auto",
  };

  const buttonStyle = {
    width: "10%",
    height: "10%",
    size: "small",
    marginBottom: "10px",
    marginLeft: "5px",
    marginRight: "1px",
    paddingRight: "10px",
    fontSize: "0.5rem",
  };

  const renderButton = (
    label:
      | string
      | number
      | boolean
      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
      | Iterable<React.ReactNode>
      | React.ReactPortal
      | React.PromiseLikeOfReactNode
      | null
      | undefined,
    value: boolean,
    handleClick: React.MouseEventHandler<HTMLButtonElement> | undefined
  ) => (
    <Button
      variant="contained"
      color="success"
      onClick={handleClick}
      sx={{
        ...buttonStyle,
        backgroundColor: value === true ? "#ebbd40" : "#2e7d32", // Lighter shade of yellow for true, Darker shade of green for false
        boxShadow:
          value === true ? "0 4px 8px rgba(235, 189, 64, 0.2)" : "none", // Adjusted box shadow
        "&:hover": {
          backgroundColor: value === true ? "#d9a031" : "#255726", // Slightly darker shade of yellow for true, Slightly darker shade of green for false
        },
        "&:active": {
          backgroundColor: value === true ? "#c68d35" : "#1e4d21", // Slightly darker shade of yellow for true, Darker shade of green for false
          boxShadow:
            value === true ? "0 2px 4px rgba(235, 189, 64, 0.2)" : "none", // Adjusted box shadow on click
        },
      }}
    >
      {label}
    </Button>
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "100px",
        left: "50%",
        alignItems: "center",
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}
    >
      <Tooltip title={open ? "Hide Filters" : "Show Filters"} arrow>
        <IconButton
          onClick={() => setOpen(!open)}
          size="small"
          sx={{
            backgroundColor: "#4CAF50", // Background color when the button is not hovered or active
            color: "white", // Text color when the button is not hovered or active
            "&:hover": {
              backgroundColor: "#45a049", // Background color on hover
            },
            "&:active": {
              backgroundColor: "#4CAF50", // Background color on click
            },
          }}
        >
          <TuneIcon />
        </IconButton>
      </Tooltip>

      <Collapse in={open}>
        <Box style={containerStyle}>
          <Grid container spacing={1} style={{ marginTop: "10px" }}>
            <Grid item xs={12} sm={4}>
              <FormControl style={{ ...formControlStyle, marginRight: "10px" }}>
                <InputLabel id="disease-label" sx={{ fontSize: "0.8rem" }}>
                  Disease
                </InputLabel>
                <Select
                  labelId="disease-label"
                  id="disease-select"
                  onChange={handleDiseaseChange}
                  value={selectedDisease}
                >
                  <MenuItem value="disease1">Malaria</MenuItem>
                  <MenuItem value="disease2">Chikungunya</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl style={{ ...formControlStyle, marginRight: "10px" }}>
                <InputLabel id="country-label" sx={{ fontSize: "0.8rem" }}>
                  Country
                </InputLabel>
                <Select
                  labelId="country-label"
                  id="country-select"
                  onChange={handleCountryChange}
                  value={selectedCountry}
                >
                  <MenuItem value="country1">Kenya</MenuItem>
                  <MenuItem value="country2">Uganda</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl style={formControlStyle}>
                <InputLabel id="species-label" sx={{ fontSize: "0.8rem" }}>
                  Species
                </InputLabel>
                <Select
                  labelId="species-label"
                  id="species-select"
                  onChange={handleSpeciesChange}
                  value={selectedSpecies}
                >
                  <MenuItem value="species1">An. gambiae</MenuItem>
                  <MenuItem value="species2">An. fenestus</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              container
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              p="6px"
            >
              <Grid
                item
                xs={12}
                sm={6}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", marginRight: "8px" }}
                >
                  Season:{" "}
                </Typography>
                {renderButton("Rainy", selectedSeason === "Rainy", () =>
                  setSelectedSeason("Rainy")
                )}
                {renderButton("Dry", selectedSeason === "Dry", () =>
                  setSelectedSeason("Dry")
                )}
                {renderButton("Empty", selectedSeason === "Empty", () =>
                  setSelectedSeason("Empty")
                )}
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", marginRight: "8px" }}
                >
                  Control:{" "}
                </Typography>
                {renderButton("True", selectedControl === "True", () =>
                  setSelectedControl("True")
                )}
                {renderButton("False", selectedControl === "False", () =>
                  setSelectedControl("False")
                )}
                {renderButton("Empty", selectedControl === "Empty", () =>
                  setSelectedControl("Empty")
                )}
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", marginRight: "20px" }}
                >
                  Adult:{" "}
                </Typography>
                {renderButton("True", selectedAdult === "True", () =>
                  setSelectedAdult("True")
                )}
                {renderButton("False", selectedAdult === "False", () =>
                  setSelectedAdult("False")
                )}
                {renderButton("Empty", selectedAdult === "Empty", () =>
                  setSelectedAdult("Empty")
                )}
              </Grid>
              <Grid
                item
                xs={12}
                sm={6}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", marginRight: "15px" }}
                >
                  Larval:{" "}
                </Typography>
                {renderButton("True", selectedLarval === "True", () =>
                  setSelectedLarval("True")
                )}
                {renderButton("False", selectedLarval === "False", () =>
                  setSelectedLarval("False")
                )}
                {renderButton("Empty", selectedLarval === "Empty", () =>
                  setSelectedLarval("Empty")
                )}
              </Grid>
            </Grid>
            <div style={buttonContainerStyle}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: colors.grey[700],
                  "&:hover": {
                    backgroundColor: colors.grey[500], // Background color on hover
                  },
                }}
                size="small"
                style={{ fontSize: "0.6rem" }}
                onClick={handleApplyFilters}
              >
                Apply
              </Button>
            </div>
          </Grid>
        </Box>
      </Collapse>
    </div>
  );
};

export default FilterSection;
