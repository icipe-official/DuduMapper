// filtersection.js
import React, { useState } from "react";
import "./filterSectionStyles.css";
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
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Autocomplete,
  TextField,
} from "@mui/material";
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
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

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

  const handleDiseaseChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: string[]
  ) => {
    const selectedValues = [...value];
    setSelectedDisease(selectedValues);
    setIsDiseaseSelected(selectedValues.length > 0);
  };
  const handleCountryChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: string[]
  ) => {
    const selectedValues = [...value];
    setSelectedCountry(selectedValues);
    setIsCountrySelected(selectedValues.length > 0);
  };

  const handleSpeciesChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: string[]
  ) => {
    const selectedValues = [...value];
    setSelectedSpecies(selectedValues);
    setIsSpeciesSelected(selectedValues.length > 0);
  };
  const handleDeleteDisease = (index: number) => {
    const newSelectedDisease = [...selectedDisease];
    newSelectedDisease.splice(index, 1);
    setSelectedDisease(newSelectedDisease);
    setIsDiseaseSelected(newSelectedDisease.length > 0);
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
    // alignItems: "center",
    // border: "1px solid #ccc",
    // margin: "0 auto",
    //  maxWidth: "980px",
    width: 500,
    marginLeft: 350,
    position: "absolute",
    top: -25,
  };
  const buttonContainerStyle = {
    marginTop: "35px",
    // display: 'flex',
    // justifyContent: 'center',
    // alignItems: 'center',
    width: "auto",
    margin: "0 auto",
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
        top: "180px",
        left: "20px",
        alignItems: "center",
        transform: "translateX(0%)",
        zIndex: 1000,
      }}
    >
      <Tooltip title={open ? "Hide Filters" : "Show Filters"} arrow>
        <IconButton
          onClick={() => setOpen(!open)}
          className="custom-icon-button"
        >
          <TuneIcon />
        </IconButton>
      </Tooltip>

      <Collapse in={open}>
        <div className="flex-container">
          <Box className="container-style">
            <Grid
              container
              spacing={1}
              style={{ marginTop: "10px", display: "flex" }}
            >
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <Autocomplete
                    multiple
                    id="disease-select"
                    options={["Malaria", "Chikungunya"]}
                    value={selectedDisease}
                    onChange={(event, value) =>
                      handleDiseaseChange(event, value)
                    }
                    getOptionLabel={(option) => option}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={`Disease (${selectedDisease.length} selected)`}
                        InputLabelProps={{ sx: { fontSize: "0.8rem" } }}
                      />
                    )}
                    renderTags={() => null}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option}
                      </li>
                    )}
                    ListboxComponent={(props) => <ul {...props} />}
                  />
                </FormControl>
                <div
                  style={{
                    marginTop: "4px",
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                >
                  {selectedDisease.map((value, index) => (
                    <Chip
                      key={value}
                      label={value}
                      style={{
                        marginRight: "4px",
                        marginBottom: "4px",
                        fontSize: "0.7rem",
                      }}
                      onDelete={() => handleDeleteDisease(index)}
                    />
                  ))}
                </div>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <Autocomplete
                    multiple
                    id="country-select"
                    options={[
                      "Kenya",
                      "Uganda",
                      "Nigeria",
                      "Botswana",
                      "Cameroon",
                    ]}
                    value={selectedCountry}
                    onChange={(event, value) =>
                      handleCountryChange(event, value)
                    }
                    getOptionLabel={(option) => option}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={`Country (${selectedCountry.length} selected)`}
                        InputLabelProps={{ sx: { fontSize: "0.8rem" } }}
                      />
                    )}
                    renderTags={() => null}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option}
                      </li>
                    )}
                    ListboxComponent={(props) => <ul {...props} />}
                  />
                </FormControl>
                <div
                  style={{
                    marginTop: "4px",
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                >
                  {selectedCountry.slice(0, 4).map((value, index) => (
                    <Chip
                      key={value}
                      label={value}
                      style={{
                        marginRight: "4px",
                        marginBottom: "4px",
                        fontSize: "0.7rem",
                      }}
                      onDelete={() => handleDeleteCountry(index)}
                    />
                  ))}
                </div>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <Autocomplete
                    multiple
                    id="species-select"
                    options={[
                      "An.gambiae",
                      "An.fenestus",
                      "An.arabiensis",
                      "An.coluzzi",
                      "An.coustani",
                    ]}
                    value={selectedSpecies}
                    onChange={(event, value) =>
                      handleSpeciesChange(event, value)
                    }
                    getOptionLabel={(option) => option}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={`Species (${selectedSpecies.length} selected)`}
                        InputLabelProps={{ sx: { fontSize: "0.8rem" } }}
                      />
                    )}
                    renderTags={() => null}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option}
                      </li>
                    )}
                    ListboxComponent={(props) => <ul {...props} />}
                  />
                </FormControl>
                <div
                  style={{
                    marginTop: "4px",
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                >
                  {selectedSpecies.slice(0, 4).map((value, index) => (
                    <Chip
                      key={value}
                      label={value}
                      style={{
                        marginRight: "4px",
                        marginBottom: "4px",
                        fontSize: "0.7rem",
                      }}
                      onDelete={() => handleDeleteSpecies(index)}
                    />
                  ))}
                </div>
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
                  sm={4}
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
                          color:
                            selectedSeason === "Dry" ? "default" : "#2e7d32",
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
                      color={
                        selectedControl === "False" ? "success" : "default"
                      }
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
                      color={
                        selectedControl === "Empty" ? "success" : "default"
                      }
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
                          color:
                            selectedAdult === "True" ? "#2e7d32" : "primary",
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
              {/* <div style={buttonContainerStyle}>
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
            </div> */}
              <div className="button-container-style">
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
        </div>
      </Collapse>
    </div>
  );
};

export default FilterSection;
