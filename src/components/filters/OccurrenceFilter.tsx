import React, { useEffect, useState } from "react";
import "./filterSectionStyles.css";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Grid,
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
import { countryList, speciesList } from "./filterUtils";
import { CircularProgress, Collapse, Stack } from "@mui/material";
import { GEOSERVER_BASE_PATH } from "@/lib/constants";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import wellknown from "wellknown";
import { simplify } from "@turf/turf";
import FormatShapesIcon from "@mui/icons-material/FormatShapes";
import RectangleOutlinedIcon from "@mui/icons-material/RectangleOutlined";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import Map from "ol/Map";
import { Draw } from "ol/interaction";

const reqParams = {
  service: "WFS",
  version: "1.0.0",
  request: "GetFeature",
  typeName: "basemap:countries",
  maxFeatures: 100,
  outputFormat: "application/json",
};
const COUNTRIES_API = `${GEOSERVER_BASE_PATH}/geoserver/basemap/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=basemap:countries&maxFeatures=100&outputFormat=application/json`;
const getCountries = async () => {
  const res = await axios.get(COUNTRIES_API);
  return res.data;
};

export default function OccurrenceFilter({
  open,
  handleFilterConditions,
  handleSelectedSpecies,
  handleDrawArea,
}: {
  open: boolean;
  handleFilterConditions: any;
  handleDrawArea: any;
  handleSelectedSpecies: any;
}) {
  const queryClient = useQueryClient();
  const [selectedSpecies, setSelectedSpecies] = useState<string>([]);
  const [openCountries, setOpenCountries] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countriesOptions, setCountriesOptions] = useState<[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string[]>([]);
  const [isDiseaseSelected, setIsDiseaseSelected] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string[]>([]);
  const [isCountrySelected, setIsCountrySelected] = useState(false);
  const [isSpeciesSelected, setIsSpeciesSelected] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [isSeasonSelected, setIsSeasonSelected] = useState(false);
  const [selectedControl, setSelectedControl] = useState("");
  const [isControlSelected, setIsControlSelected] = useState(false);
  const [selectedAdult, setSelectedAdult] = useState("");
  const [isAdultSelected, setIsAdultSelected] = useState(false);
  const [selectedLarval, setSelectedLarval] = useState("");
  const [isLarvalSelected, setIsLarvalSelected] = useState(false);
  const [selectedByArea, setSelectedByArea] = useState<string>("");
  const [enableAreaMode, setEnableAreaMode] = useState(false);

  const {
    isFetching: isFetchingCountries,
    data: countriesData,
    isError: countriesError,
    status: countriesStatus,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });

  const composeFilterConditions = (): string[] => {
    const filterConditions = [];
    if (selectedSpecies && selectedSpecies.length > 0) {
      console.log("Selected Species", selectedSpecies);
      const arrayOfSpecies: string[] = String(selectedSpecies).split(","); //
      const quotedSpecies = `'${arrayOfSpecies.join("', '")}'`;
      const speciesFilter: string = `species IN(${quotedSpecies}) `;

      filterConditions.push(speciesFilter);
    }
    if (selectedCountries && selectedCountries.length > 0) {
      console.log("Selected Countries", selectedCountries);
      const cFilter = ` WITHIN(the_geom, ${selectedCountries})`;
      filterConditions.push(cFilter);
    }

    //season, larvae, adult,
    return filterConditions;
  };

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

  const handleDeleteDisease = (index: number) => {
    const newSelectedDisease = [...selectedDisease];
    newSelectedDisease.splice(index, 1);
    setSelectedDisease(newSelectedDisease);
    setIsDiseaseSelected(newSelectedDisease.length > 0);
  };
  const handleDeleteCountry = (index: number) => {
    const newSelectedCountry = [...selectedCountry];
    newSelectedCountry.splice(index, 1);
    setSelectedCountry(newSelectedCountry);
    setIsCountrySelected(newSelectedCountry.length > 0);
  };

  const handleDeleteSpecies = (index: number) => {
    const newSelectedSpecies = [...selectedSpecies];
    newSelectedSpecies.splice(index, 1);
    setSelectedSpecies(newSelectedSpecies);
    setIsSpeciesSelected(newSelectedSpecies.length > 0);
  };

  const toggleSelectedByArea = (shape: string) => {
    // if (selectedByArea === "") {
    //   //setEnableAreaMode(true);
    //   setSelectedByArea(shape);
    // } else if (selectedByArea != shape && selectedByArea != "") {
    //   //setEnableAreaMode(true);
    //   setSelectedByArea(shape);
    // } else {
    //   //setEnableAreaMode(false);
    //   setSelectedByArea("");
    // }
    setSelectedByArea(shape);
    handleDrawArea(shape);
  };

  useEffect(() => {
    let active = true;

    if (countriesStatus === "success") {
      setCountriesOptions(countriesData.features);
    }
    return () => {
      active = false;
    };
  }, [isFetchingCountries]);

  const handleSpecies = (values) => {
    setSelectedSpecies(values);
  };

  const simplifyGeometry = (geometry) => {
    const options = { tolerance: 0.1, highQuality: false };
    return simplify(geometry, options);
  };

  const handleCountries = (values) => {
    const simplifiedGeoms = values.map((value) =>
      simplifyGeometry(value.geometry)
    );
    const wktGeoms = simplifiedGeoms.map((geom) => wellknown.stringify(geom)); // changing geojson geometry to well know text representation
    //TODO handle multiple countries
    setSelectedCountries(wktGeoms);
  };

  useEffect(() => {
    const filterParams = composeFilterConditions();
    handleFilterConditions(filterParams);
    if (selectedSpecies.length > 0) {
      handleSelectedSpecies(selectedSpecies);
    }
  }, [selectedSpecies, selectedCountries]);

  return (
    <div className="filter-section">
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
                    id="asynchronous-demo"
                    multiple
                    open={openCountries}
                    onOpen={() => {
                      setOpenCountries(true);
                    }}
                    onClose={() => {
                      setOpenCountries(false);
                    }}
                    //isOptionEqualToValue={(option, value) => option === value}
                    getOptionLabel={(option) => option["properties"]["name"]}
                    getOptionKey={(option) => option.properties.id}
                    options={countriesOptions}
                    loading={isFetchingCountries}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Countries"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {isFetchingCountries ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                    onChange={(event, values) => handleCountries(values)}
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
                    //multiple
                    id="species-filter"
                    options={speciesList.map(
                      (species) => species.properties.species
                    )}
                    freeSolo
                    limitTags={3}
                    filterSelectedOptions
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="filled"
                        label="Species"
                        placeholder="Select Species"
                      />
                    )}
                    onChange={(event, values) => handleSpecies(values)}
                  />
                </FormControl>
                <div
                  style={{
                    marginTop: "4px",
                    display: "flex",
                    flexWrap: "wrap",
                  }}
                ></div>
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
                    flexDirection: "row",
                    alignItems: "center",
                  }}
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
                      sx={{
                        fontStyle: "italic",
                        marginRight: ".5px",
                        color: "black",
                      }}
                    >
                      Season:{" "}
                    </Typography>
                    <Tooltip title="Rainy" arrow>
                      <IconButton
                        onClick={() => setSelectedSeason("Rainy")}
                        color={
                          selectedSeason === "Rainy" ? "success" : "default"
                        }
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
                        color={
                          selectedSeason === "Empty" ? "success" : "default"
                        }
                        sx={{
                          fontSize: "1.5rem",
                          "&:hover": {
                            color:
                              selectedSeason === "Empty"
                                ? "#2e7d32"
                                : "primary",
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
                      sx={{
                        fontStyle: "italic",
                        marginRight: "0.5px",
                        color: "black",
                      }}
                    >
                      Control:{" "}
                    </Typography>
                    <Tooltip title="True" arrow>
                      <IconButton
                        onClick={() => setSelectedControl("True")}
                        color={
                          selectedControl === "True" ? "success" : "default"
                        }
                        sx={{
                          fontSize: "1.5rem",
                          "&:hover": {
                            color:
                              selectedControl === "True"
                                ? "#2e7d32"
                                : "primary",
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
                              selectedControl === "False"
                                ? "#2e7d32"
                                : "primary",
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
                              selectedControl === "Empty"
                                ? "#2e7d32"
                                : "primary",
                          },
                        }}
                      >
                        <DataArrayIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
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
                      sx={{
                        fontStyle: "italic",
                        marginRight: "10px",
                        color: "black",
                      }}
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
                        color={
                          selectedAdult === "False" ? "success" : "default"
                        }
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
                        color={
                          selectedAdult === "Empty" ? "success" : "default"
                        }
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
                      sx={{
                        fontStyle: "italic",
                        marginRight: "5px",
                        color: "black",
                      }}
                    >
                      Larval:{" "}
                    </Typography>
                    <Tooltip title="True" arrow>
                      <IconButton
                        onClick={() => setSelectedLarval("True")}
                        color={
                          selectedLarval === "True" ? "success" : "default"
                        }
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
                        color={
                          selectedLarval === "False" ? "success" : "default"
                        }
                        sx={{
                          fontSize: "1.5rem",
                          "&:hover": {
                            color:
                              selectedLarval === "False"
                                ? "#2e7d32"
                                : "primary",
                          },
                        }}
                      >
                        <EggIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Empty" arrow>
                      <IconButton
                        onClick={() => setSelectedLarval("Empty")}
                        color={
                          selectedLarval === "Empty" ? "success" : "default"
                        }
                        sx={{
                          fontSize: "1.5rem",
                          "&:hover": {
                            color:
                              selectedLarval === "Empty"
                                ? "#2e7d32"
                                : "primary",
                          },
                        }}
                      >
                        <DataArrayIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  sx={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ color: "green", fontSize: 15 }}>
                    Select by Area
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontStyle: "italic",
                      marginRight: "5px",
                      color: "black",
                    }}
                  >
                    Rectangle:{" "}
                    <IconButton
                      onClick={() => toggleSelectedByArea("Box")}
                      color={selectedByArea === "Box" ? "success" : "default"}
                      sx={{
                        fontSize: "1.5rem",
                        "&:hover": {
                          color:
                            selectedByArea === "Box" ? "#2e7d32" : "primary",
                        },
                      }}
                    >
                      <RectangleOutlinedIcon />
                    </IconButton>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontStyle: "italic",
                      marginRight: "5px",
                      color: "black",
                    }}
                  >
                    Circle:{" "}
                    <IconButton
                      onClick={() => toggleSelectedByArea("Circle")}
                      color={
                        selectedByArea === "Circle" ? "success" : "default"
                      }
                      sx={{
                        fontSize: "1.5rem",
                        "&:hover": {
                          color:
                            selectedByArea === "Circle" ? "#2e7d32" : "primary",
                        },
                      }}
                    >
                      <CircleOutlinedIcon />
                    </IconButton>
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontStyle: "italic",
                      marginRight: "5px",
                      color: "black",
                    }}
                  >
                    Free Hand:{" "}
                    <IconButton
                      onClick={() => toggleSelectedByArea("Polygon")}
                      color={
                        selectedByArea === "Polygon" ? "success" : "default"
                      }
                      sx={{
                        fontSize: "1.5rem",
                        "&:hover": {
                          color:
                            selectedByArea === "Polygon"
                              ? "#2e7d32"
                              : "primary",
                        },
                      }}
                    >
                      <FormatShapesIcon />
                    </IconButton>
                  </Typography>
                </Grid>
              </Grid>
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
}
