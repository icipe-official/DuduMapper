import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Collapse,
  FormControl,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  colors,
} from "@mui/material";
import { GEOSERVER_BASE_PATH } from "@/lib/constants";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { geoJSONToWkt } from "betterknown";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import DataArrayIcon from "@mui/icons-material/DataArray";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import BugReportIcon from "@mui/icons-material/BugReport";
import PestControlIcon from "@mui/icons-material/PestControl";
import EggIcon from "@mui/icons-material/Egg";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";

interface FilterConditions {
  species?: string;
  country?: string;
}

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
  onClearFilter,
}: {
  open: boolean;
  handleFilterConditions: any;
  onClearFilter: any;
}) {
  const queryClient = useQueryClient();
  // const [open, setOpen] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [openCountries, setOpenCountries] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>();
  const [selectedDisease, setSelectedDisease] = useState<string[]>([]);
  const [isDiseaseSelected, setIsDiseaseSelected] = useState(false);
  const [isCountrySelected, setIsCountrySelected] = useState(false);
  const [isSpeciesSelected, setIsSpeciesSelected] = useState(false);
  const [countriesOptions, setCountriesOptions] = useState<[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [isSeasonSelected, setIsSeasonSelected] = useState(false);
  const [selectedControl, setSelectedControl] = useState("");
  const [isControlSelected, setIsControlSelected] = useState(false);
  const [selectedAdult, setSelectedAdult] = useState("");
  const [isAdultSelected, setIsAdultSelected] = useState(false);
  const [selectedLarval, setSelectedLarval] = useState("");
  const [isLarvalSelected, setIsLarvalSelected] = useState(false);

  const {
    isFetching: isFetchingCountries,
    data: countriesData,
    isError: countriesError,
    status: countriesStatus,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });

  const composeFilterConditions = (): {} => {
    const filterConditions: FilterConditions = {};

    if (selectedSpecies && selectedSpecies.length > 0) {
      console.log("Selected Species", selectedSpecies);
      const arrayOfSpecies: string[] = String(selectedSpecies).split(",");
      const quotedSpecies = `'${arrayOfSpecies.join("', '")}'`;
      const speciesFilter: string = `species IN(${quotedSpecies}) `;
      filterConditions["species"] = speciesFilter;
    }

    if (selectedCountry && selectedCountry.length > 0) {
      console.log("Selected Countries", selectedCountry);
      const cFilter = ` WITHIN(the_geom, ${selectedCountry})`;
      filterConditions["country"] = cFilter;
    }
    // if (selectedSeason && selectedSeason.length > 0) {
    //   console.log("Selected Season", selectedSeason);
    //   const cFilter = ` `;
    // }

    //season, larvae, adult,
    return filterConditions;
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
  const handleDiseaseChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: string[]
  ) => {
    const selectedValues = [...value];
    setSelectedDisease(selectedValues);
    setIsDiseaseSelected(selectedValues.length > 0);
  };

  const handleSpecies = (values: React.SetStateAction<string[]>) => {
    setSelectedSpecies(values);
    setIsSpeciesSelected(Boolean(values));
  };

  const handleCountries = (feature: any) => {
    //const simplifiedGeoms = simplifyGeometry(feature) //Simplification is skipped, we might use bbox instead on country boundary
    console.log("Geojson", feature);
    const wktGeoms = geoJSONToWkt(feature.geometry); //changing geojson geometry to well know text representation
    console.log("WKT", feature.geometry);
    setSelectedCountry(wktGeoms);
  };

  //Send clear filter signal to map to remove cql_filter
  const handleClearFilter = () => {
    onClearFilter();
  };

  useEffect(() => {
    const filterParams: {} = composeFilterConditions();
    if (filterParams && Object.keys(filterParams).length > 0) {
      handleFilterConditions(filterParams);
    }
  }, [selectedSpecies, selectedCountry, selectedSeason]);

  return (
    <div className="filter-dev-section">
      <Collapse in={open}>
        <Box
          // className="container-style"
          // direction="column"
          // spacing={3}
          sx={{ width: 450, m: 3 }}
          // divider={<Divider orientation="horizontal" flexItem />}
        >
          <Grid
            container
            spacing={2}
            style={{
              marginTop: "10px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Grid item xs={12} sm={4} md={12}>
              <FormControl fullWidth>
                {/* <Box width="100%"> */}
                <Autocomplete
                  fullWidth
                  multiple
                  id="disease-select"
                  options={["Malaria", "Chikungunya"]} //needs to change
                  freeSolo
                  filterSelectedOptions
                  value={selectedDisease}
                  onChange={(event, value) => handleDiseaseChange(event, value)}
                  getOptionLabel={(option) => option}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="filled"
                      label={`Disease (${selectedDisease.length} selected)`}
                      InputLabelProps={{ sx: { fontSize: "0.8rem" } }}
                      style={{ width: "100%" }}
                    />
                  )}
                />
                {/* </Box> */}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={12}>
              <FormControl fullWidth style={{ width: "100%" }}>
                <Autocomplete
                  multiple
                  id="species-filter"
                  options={speciesList.map(
                    (species) => species.properties.species
                  )}
                  freeSolo
                  value={selectedSpecies}
                  limitTags={4}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="filled"
                      label={`Species (${selectedSpecies.length} selected)`}
                      InputLabelProps={{ sx: { fontSize: "0.8rem" } }}
                      // placeholder="Select Species"
                    />
                  )}
                  onChange={(event, values) => handleSpecies(values)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={12}>
              <FormControl fullWidth style={{ width: "100%" }}>
                <Autocomplete
                  //multiple
                  id="filter-by-country"
                  open={openCountries}
                  //value={selectedCountry}
                  onOpen={() => {
                    setOpenCountries(true);
                  }}
                  onClose={() => {
                    setOpenCountries(false);
                  }}
                  //isOptionEqualToValue={(option, value) => option === value}
                  getOptionLabel={(option) => option["properties"]["name"]}
                  getOptionKey={(option) => option["properties"]["id"]}
                  options={countriesOptions}
                  loading={isFetchingCountries}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`Countries`}
                      variant="filled"
                      InputLabelProps={{ sx: { fontSize: "0.8rem" } }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {isFetchingCountries ? (
                              <CircularProgress color="inherit" size={10} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                  onChange={(event, value) => handleCountries(value)}
                />
              </FormControl>
            </Grid>
            <Grid
              container
              alignItems="center"
              direction="row"
              justifyContent="space-between"
              p="45px"
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
                    fontSize: "0.98rem",
                  }}
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
                  sx={{
                    fontStyle: "italic",
                    marginRight: "0.5px",
                    fontSize: "1rem",
                  }}
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
                  sx={{
                    fontStyle: "italic",
                    marginRight: "10px",
                    fontSize: "1rem",
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
                  sx={{
                    fontStyle: "italic",
                    marginRight: "5px",
                    fontSize: "1rem",
                  }}
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
            <div className="button-container-style">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#2e7d32",
                  "&:hover": {
                    backgroundColor: colors.grey[500],
                    // Background color on hover
                  },
                }}
                size="small"
                style={{ fontSize: "0.7rem" }}
                onClick={() => {
                  setSelectedDisease([] as string[]);
                  setIsDiseaseSelected(false);
                  setSelectedCountry('');
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
                  handleClearFilter();
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
}

const speciesList = [
  {
    type: "Feature",
    id: "vector_info.1",
    geometry: null,
    properties: {
      species: "arabiensis",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.2",
    geometry: null,
    properties: {
      species: "bwambae",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.3",
    geometry: null,
    properties: {
      species: "carnevalei",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.4",
    geometry: null,
    properties: {
      species: "coluzzii",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.5",
    geometry: null,
    properties: {
      species: "culicifacies",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.6",
    geometry: null,
    properties: {
      species: "faini",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.7",
    geometry: null,
    properties: {
      species: "funestus",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.8",
    geometry: null,
    properties: {
      species: "FUNESTUS COMPLEX",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.9",
    geometry: null,
    properties: {
      species: "labranchiae",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.10",
    geometry: null,
    properties: {
      species: "melas",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.11",
    geometry: null,
    properties: {
      species: "merus",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.12",
    geometry: null,
    properties: {
      species: "moucheti",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.13",
    geometry: null,
    properties: {
      species: "multicolor",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.14",
    geometry: null,
    properties: {
      species: "nili",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.15",
    geometry: null,
    properties: {
      species: "pharoensis",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.16",
    geometry: null,
    properties: {
      species: "pseudopunctipennis",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.17",
    geometry: null,
    properties: {
      species: "quadriannulatus",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.18",
    geometry: null,
    properties: {
      species: "quadriannulatus sp. B",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.19",
    geometry: null,
    properties: {
      species: "quadrimaculatus",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.20",
    geometry: null,
    properties: {
      species: "sergentii",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.21",
    geometry: null,
    properties: {
      species: "stephensi",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.22",
    geometry: null,
    properties: {
      species: "Test123",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.23",
    geometry: null,
    properties: {
      species: "gambiae",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.24",
    geometry: null,
    properties: {
      species: "GAMBIAE COMPLEX",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.25",
    geometry: null,
    properties: {
      species: "gambiae (S/M, 1)",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.26",
    geometry: null,
    properties: {
      species: "gambiae s.s.",
      vector: "Mosquito",
    },
  },
  {
    type: "Feature",
    id: "vector_info.27",
    geometry: null,
    properties: {
      species: "flavirostris",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.28",
    geometry: null,
    properties: {
      species: "barberellus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.29",
    geometry: null,
    properties: {
      species: "n.a.",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.30",
    geometry: null,
    properties: {
      species: "marshalli",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.31",
    geometry: null,
    properties: {
      species: "gambiae (Forest)",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.32",
    geometry: null,
    properties: {
      species: "minimus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.33",
    geometry: null,
    properties: {
      species: "dirus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.34",
    geometry: null,
    properties: {
      species: "annularis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.35",
    geometry: null,
    properties: {
      species: "aconitus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.36",
    geometry: null,
    properties: {
      species: "gambiae (S/M)",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.37",
    geometry: null,
    properties: {
      species: "cinereus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.38",
    geometry: null,
    properties: {
      species: "melas ",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.39",
    geometry: null,
    properties: {
      species: "coustani",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.40",
    geometry: null,
    properties: {
      species: "squamosus-cydippis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.41",
    geometry: null,
    properties: {
      species: "mascarensis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.42",
    geometry: null,
    properties: {
      species: "flavicosta",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.43",
    geometry: null,
    properties: {
      species: "brunnipes",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.44",
    geometry: null,
    properties: {
      species: "maculipalpis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.45",
    geometry: null,
    properties: {
      species: "grassei",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.46",
    geometry: null,
    properties: {
      species: "rivulorum",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.47",
    geometry: null,
    properties: {
      species: "gambiae  (S/M)",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.48",
    geometry: null,
    properties: {
      species: "squamosus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.49",
    geometry: null,
    properties: {
      species: "ziemanni",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.50",
    geometry: null,
    properties: {
      species: "albimanus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.51",
    geometry: null,
    properties: {
      species: "darlingi",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.52",
    geometry: null,
    properties: {
      species: "anthropophagus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.53",
    geometry: null,
    properties: {
      species: "sinensis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.54",
    geometry: null,
    properties: {
      species: "NILI COMPLEX",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.55",
    geometry: null,
    properties: {
      species: "squasmous",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.56",
    geometry: null,
    properties: {
      species: "ziemani",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.57",
    geometry: null,
    properties: {
      species: "marshallii",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.58",
    geometry: null,
    properties: {
      species: "paludis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.59",
    geometry: null,
    properties: {
      species: "rufipes",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.60",
    geometry: null,
    properties: {
      species: "hancocki",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.61",
    geometry: null,
    properties: {
      species: "sacharovi",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.62",
    geometry: null,
    properties: {
      species: "implexus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.63",
    geometry: null,
    properties: {
      species: "abscurus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.64",
    geometry: null,
    properties: {
      species: "smithii",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.65",
    geometry: null,
    properties: {
      species: "namibiensis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.66",
    geometry: null,
    properties: {
      species: "domicola",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.67",
    geometry: null,
    properties: {
      species: "marshalii",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.68",
    geometry: null,
    properties: {
      species: "demeilloni",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.69",
    geometry: null,
    properties: {
      species: "gibbinsi",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.70",
    geometry: null,
    properties: {
      species: "pretoriensis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.71",
    geometry: null,
    properties: {
      species: "gambiae (S)",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.72",
    geometry: null,
    properties: {
      species: "wellcomei",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.73",
    geometry: null,
    properties: {
      species: "tenebrosus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.74",
    geometry: null,
    properties: {
      species: "ovengensis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.75",
    geometry: null,
    properties: {
      species: "longipalpis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.76",
    geometry: null,
    properties: {
      species: "christyi",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.77",
    geometry: null,
    properties: {
      species: "atroparvus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.78",
    geometry: null,
    properties: {
      species: "dthali",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.79",
    geometry: null,
    properties: {
      species: "rhodesiensis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.80",
    geometry: null,
    properties: {
      species: "rupicolus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.81",
    geometry: null,
    properties: {
      species: "garnhami",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.82",
    geometry: null,
    properties: {
      species: "harperi",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.83",
    geometry: null,
    properties: {
      species: "farauti",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.84",
    geometry: null,
    properties: {
      species: "maculatus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.85",
    geometry: null,
    properties: {
      species: "barbirostris",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.86",
    geometry: null,
    properties: {
      species: "balabacensis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.87",
    geometry: null,
    properties: {
      species: "subpictus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.88",
    geometry: null,
    properties: {
      species: "campestris",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.89",
    geometry: null,
    properties: {
      species: "fluviatilis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.90",
    geometry: null,
    properties: {
      species: "pulcherrimus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.91",
    geometry: null,
    properties: {
      species: "leucosphyrus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.92",
    geometry: null,
    properties: {
      species: "nigerrimus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.93",
    geometry: null,
    properties: {
      species: "nuneztovari",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.94",
    geometry: null,
    properties: {
      species: "aquasalis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.95",
    geometry: null,
    properties: {
      species: "albitarsis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.96",
    geometry: null,
    properties: {
      species: "marajoara",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.97",
    geometry: null,
    properties: {
      species: "sundaicus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.98",
    geometry: null,
    properties: {
      species: "parensis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.99",
    geometry: null,
    properties: {
      species: "freetownensis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.100",
    geometry: null,
    properties: {
      species: "superpictus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.101",
    geometry: null,
    properties: {
      species: "cydippis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.102",
    geometry: null,
    properties: {
      species: "messeae",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.103",
    geometry: null,
    properties: {
      species: "leesoni",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.104",
    geometry: null,
    properties: {
      species: "coustani ",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.105",
    geometry: null,
    properties: {
      species: "gambiae (Form M)",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.106",
    geometry: null,
    properties: {
      species: "gambiae (Form S)",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.107",
    geometry: null,
    properties: {
      species: "na",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.108",
    geometry: null,
    properties: {
      species: "punctimacula",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.109",
    geometry: null,
    properties: {
      species: "gambiae / coluzzii",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.110",
    geometry: null,
    properties: {
      species: "argyritarsis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.111",
    geometry: null,
    properties: {
      species: "cruzii",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.112",
    geometry: null,
    properties: {
      species: "bellator",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.113",
    geometry: null,
    properties: {
      species: "cinereus ",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.114",
    geometry: null,
    properties: {
      species: "claviger ",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.115",
    geometry: null,
    properties: {
      species: "gambiae  ",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.116",
    geometry: null,
    properties: {
      species: "christi",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.117",
    geometry: null,
    properties: {
      species: "punctulatus",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.118",
    geometry: null,
    properties: {
      species: "koliensis",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.180",
    geometry: null,
    properties: {
      species: "source provides rtemperature data",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.181",
    geometry: null,
    properties: {
      species: "d'thali",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.182",
    geometry: null,
    properties: {
      species: "rupicola",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.183",
    geometry: null,
    properties: {
      species: "chrysti",
      vector: null,
    },
  },

  {
    type: "Feature",
    id: "vector_info.202",
    geometry: null,
    properties: {
      species: "rivulorum  ",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.206",
    geometry: null,
    properties: {
      species: "pauliani",
      vector: null,
    },
  },
  {
    type: "Feature",
    id: "vector_info.207",
    geometry: null,
    properties: {
      species: "radama",
      vector: null,
    },
  },
];
