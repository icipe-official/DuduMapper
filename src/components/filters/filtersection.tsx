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
  SelectChangeEvent,
  Checkbox,
} from "@mui/material";
import FilterIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import TuneIcon from "@mui/icons-material/Tune";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import DataArrayIcon from "@mui/icons-material/DataArray";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import BugReportIcon from "@mui/icons-material/BugReport";
import PestControlIcon from "@mui/icons-material/PestControl";
import EggIcon from "@mui/icons-material/Egg";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";

const FilterSection = () => {
  const [open, setOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<string[]>([]);
  const [isDiseaseSelected, setIsDiseaseSelected] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string[]>([]);
  const [isCountrySelected, setIsCountrySelected] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [isSpeciesSelected, setIsSpeciesSelected] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [isSeasonSelected, setIsSeasonSelected] = useState(false);
  const [selectedControl, setSelectedControl] = useState("");
  const [isControlSelected, setIsControlSelected] = useState(false);
  const [selectedAdult, setSelectedAdult] = useState("");
  const [isAdultSelected, setIsAdultSelected] = useState(false);
  const [selectedLarval, setSelectedLarval] = useState("");
  const [isLarvalSelected, setIsLarvalSelected] = useState(false);

  const handleDiseaseChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValues = [...(event.target.value as string[])];
    setSelectedDisease(selectedValues);
    setIsDiseaseSelected(selectedValues.length > 0);
  };

  const handleCountryChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValues = event.target.value as string[];
    setSelectedCountry(selectedValues);
    setIsCountrySelected(selectedValues.length > 0);
  };

  const handleSpeciesChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValues = event.target.value as string[];
    setSelectedSpecies(selectedValues);
    setIsSpeciesSelected(selectedValues.length > 0);
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
    marginBottom: "5px",
    minWidth: "80%",
    minHeight: "5px",
    fontSize: "0.1rem",
    padding: "0.3px",
  };

  const containerStyle = {
    backgroundColor: "#f4f4f4", // Add your desired gray background color
    borderRadius: "3px",
    padding: "15px",
    display: "flex",
    // flexDirection: 'column',
    alignItems: "center",
    border: "1px solid #ccc",
    margin: "0 auto",
    maxWidth: "400px",
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

  const renderMultipleSelection = (selected: string | string[]) => {
    if (Array.isArray(selected)) {
      return selected.join(", ");
    }
    return selected;
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "135px",
        left: "50%",
        alignItems: "center",
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}
    >
      <Tooltip title={open ? "Hide Filters" : "Show Filters"} arrow>
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{
            width: 24,
            height: 24,
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
                <InputLabel
                  id="disease-label"
                  sx={{ fontSize: "0.8rem", display: "flex" }}
                >
                  {isDiseaseSelected ? "" : "Disease"}
                </InputLabel>
                <Select
                  labelId="disease-label"
                  id="disease-select"
                  onChange={handleDiseaseChange}
                  multiple
                  value={selectedDisease}
                  sx={{ maxWidth: "90%", shrink: "true" }}

                  // renderValue={(selected) => (selected as string[]).join(", ")}
                >
                  <MenuItem value="disease1">Malaria</MenuItem>
                  <MenuItem value="disease2">Chikungunya</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl style={{ ...formControlStyle, marginRight: "10px" }}>
                <InputLabel id="country-label" sx={{ fontSize: "0.8rem" }}>
                  {isCountrySelected ? "" : "Country"}
                </InputLabel>
                <Select
                  labelId="country-label"
                  id="country-select"
                  value={selectedCountry}
                  multiple
                  onChange={handleCountryChange}
                  sx={{ maxWidth: "90%", shrink: "true" }}
                >
                  <MenuItem value="country1">Kenya</MenuItem>
                  <MenuItem value="country2">Uganda</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl style={formControlStyle}>
                <InputLabel id="species-label" sx={{ fontSize: "0.8rem" }}>
                  {isSpeciesSelected ? "" : "Species"}
                </InputLabel>
                <Select
                  labelId="species-label"
                  id="species-select"
                  onChange={handleSpeciesChange}
                  multiple
                  value={selectedSpecies}
                  sx={{ maxWidth: "90%", shrink: "true" }}
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
                  variant="caption"
                  sx={{ fontStyle: "italic", marginRight: ".5px" }}
                >
                  Season:{" "}
                </Typography>
                <Tooltip title="Rainy" arrow>
                  <IconButton
                    onClick={() => setSelectedSeason("Rainy")}
                    color={selectedSeason === "Rainy" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color: "#2e7d32", // Green color on hover
                      },
                    }}
                  >
                    <ThunderstormIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Dry" arrow>
                  <IconButton
                    onClick={() => setSelectedSeason("Dry")}
                    color={selectedSeason === "Dry" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color: selectedSeason === "Dry" ? "default" : "#2e7d32",
                      },
                    }}
                  >
                    <WbSunnyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Empty" arrow>
                  <IconButton
                    onClick={() => setSelectedSeason("Empty")}
                    color={selectedSeason === "Empty" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedSeason === "Empty" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <DataArrayIcon />
                  </IconButton>
                </Tooltip>
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
                  variant="caption"
                  sx={{ fontStyle: "italic", marginRight: "0.5px" }}
                >
                  Control:{" "}
                </Typography>
                <Tooltip title="True" arrow>
                  <IconButton
                    onClick={() => setSelectedControl("True")}
                    color={selectedControl === "True" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedControl === "True" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <DoneIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="False" arrow>
                  <IconButton
                    onClick={() => setSelectedControl("False")}
                    color={selectedControl === "False" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedControl === "False" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Empty" arrow>
                  <IconButton
                    onClick={() => setSelectedControl("Empty")}
                    color={selectedControl === "Empty" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedControl === "Empty" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <DataArrayIcon />
                  </IconButton>
                </Tooltip>
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
                  variant="caption"
                  sx={{ fontStyle: "italic", marginRight: "10px" }}
                >
                  Adult:{" "}
                </Typography>
                <Tooltip title="True" arrow>
                  <IconButton
                    onClick={() => setSelectedAdult("True")}
                    color={selectedAdult === "True" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color: selectedAdult === "True" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <EmojiNatureIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="False" arrow>
                  <IconButton
                    onClick={() => setSelectedAdult("False")}
                    color={selectedAdult === "False" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedAdult === "False" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <BugReportIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Empty" arrow>
                  <IconButton
                    onClick={() => setSelectedAdult("Empty")}
                    color={selectedAdult === "Empty" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedAdult === "Empty" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <DataArrayIcon />
                  </IconButton>
                </Tooltip>
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
                  variant="caption"
                  sx={{ fontStyle: "italic", marginRight: "5px" }}
                >
                  Larval:{" "}
                </Typography>
                <Tooltip title="True" arrow>
                  <IconButton
                    onClick={() => setSelectedLarval("True")}
                    color={selectedLarval === "True" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedLarval === "True" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <PestControlIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="False" arrow>
                  <IconButton
                    onClick={() => setSelectedLarval("False")}
                    color={selectedLarval === "False" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedLarval === "False" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <EggIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Empty" arrow>
                  <IconButton
                    onClick={() => setSelectedLarval("Empty")}
                    color={selectedLarval === "Empty" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedLarval === "Empty" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <DataArrayIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <div style={buttonContainerStyle}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#2e7d32",
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
            <div style={buttonContainerStyle}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#2e7d32",
                  "&:hover": {
                    backgroundColor: colors.grey[500], // Background color on hover
                  },
                }}
                size="small"
                style={{ fontSize: "0.6rem" }}
                onClick={() => {
                  setSelectedDisease([] as string[]);
                  setIsDiseaseSelected(false);
                  setSelectedCountry([] as string[]);
                  setIsCountrySelected(false);
                  setSelectedSpecies([] as string[]);
                  setIsSpeciesSelected(false);
                  setSelectedSeason("");
                  setIsSeasonSelected(false);
                  setSelectedAdult("");
                  setIsAdultSelected(false);
                  setSelectedControl("");
                  setIsControlSelected(false);
                  setSelectedLarval("");
                  setIsLarvalSelected(false);

                  // Reset other state variables as needed
                }}
              >
                Clear Selection
              </Button>
            </div>
          </Grid>
        </Box>
      </Collapse>
    </div>
  );
};

export default FilterSection;
