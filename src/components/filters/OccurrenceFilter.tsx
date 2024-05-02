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
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import FormatShapesIcon from "@mui/icons-material/FormatShapes";
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import ClearIcon from '@mui/icons-material/Clear';
import ChecklistIcon from '@mui/icons-material/Checklist';


interface FilterConditions {
  species?: string;
  country?: string;
  bionomics?: string;
  larvae?: string;
  adult?: string;
  season?: string;
  phenotype?: string;
  genotype?: string;
}

const reqParams = {
  service: "WFS",
  version: "1.0.0",
  request: "GetFeature",
  typeName: "basemap:countries",
  maxFeatures: 100,
  outputFormat: "application/json",
};
const COUNTRIES_API = `${GEOSERVER_BASE_PATH}/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=overlays:countries&maxFeatures=70&outputFormat=application/json`;
const getCountries = async () => {
  const res = await axios.get(COUNTRIES_API);
  return res.data;
};

export default function OccurrenceFilter({
  open,
  onCloseFilter,
  handleFilterConditions,
  onClearFilter,
  handleDrawArea,
  handleSelectedSpecies,
  onResetFilter,
}: {
  open: boolean;
  onCloseFilter: () => void;
  handleFilterConditions: any;
  onClearFilter: any;
  handleDrawArea: any;
  handleSelectedSpecies: any;
  onResetFilter: any;
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
  const [selectedByArea, setSelectedByArea] = useState<string>("");
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [bionomicsData, setBionomicsData] = useState("");
  const [insecticideControl, setInsecticideControl] = useState("");
  const [insecticideResistance, setInsecticideResistance] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [mini, setMini] = useState(false);
  const [phenotype, setPhenotype] = useState("");
  const [genotype, setGenotype] = useState("");

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

    if (bionomicsData && bionomicsData.length > 0) {
      console.log("bionomic prescence", bionomicsData);
      const bioFilter = `bionomics_present = '${bionomicsData}'`;
      filterConditions["bionomics"] = bioFilter;
    }

    // if (selectedControl && selectedControl.length > 0){
    //     const controlFilter = ``
    // }

    if (selectedLarval && selectedLarval.length > 0) {
      const larvaeFilter = `larvae = '${selectedLarval}'`;
      filterConditions["larvae"] = larvaeFilter;
    }

    if (selectedAdult && selectedAdult.length > 0) {
      const adultFilter = `adult = '${selectedAdult}'`;
      filterConditions["adult"] = adultFilter;
    }

    if (selectedSeason && selectedSeason.length > 0) {
      const seasonFilter = `season_given = '${selectedSeason}'`;
      filterConditions["season"] = seasonFilter;
    }

    if (phenotype && phenotype.length > 0){
      const phenoFilter = `ir_bioassays_present = '${phenotype}'`;
      filterConditions["phenotype"] = phenoFilter;
    }

    if (genotype && genotype.length > 0){
      const phenoFilter = `ir_genetic_mechanisms_present = '${genotype}'`;
      filterConditions["genotype"] = phenoFilter;
    }

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
    handleSelectedSpecies(values);
  };
  const clearSelectedSpecies = () => {
    setSelectedSpecies([]);
  };
  // console.log("selected country", selectedCountry);
  console.log("selected species",selectedSpecies)

  const handleCountries = (feature: any) => {
    try {
      if (!feature || !feature.geometry) {
        throw new Error("Invalid feature or missing geometry property");
      }

      console.log("Geojson", feature);

      // Assuming that geoJSONToWkt is a function that converts GeoJSON to WKT
      const wktGeoms = geoJSONToWkt(feature.geometry);

      if (!wktGeoms) {
        throw new Error("Failed to convert GeoJSON to WKT");
      }

      console.log("WKT", wktGeoms);
      if (wktGeoms.trim() === "") {
        setSelectedCountry("");
      } else {
        setSelectedCountry(wktGeoms);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const clearSelectedCountries = () => {
    setSelectedCountry("");
  };
  //Send clear filter signal to map to remove cql_filter
  const handleClearFilter = () => {
    onClearFilter();
  };
  const handleResetFilter = () => {
    onResetFilter();
  };
  const toggleMinimized = () => {
    setMinimized(!minimized);
  };

  const handleBioToggle = (value: any) => {
    if (bionomicsData === value) {
      // If the button is already selected, deselect it
      setBionomicsData("");
      handleResetFilter();
    } else {
      // Otherwise, select the button
      setBionomicsData(value);
    }
  };

  const handlePhenotypeToggle = (value: any)=>{
    if(phenotype === value){
      setPhenotype("");
      handleResetFilter();
    }else {
      setPhenotype(value)
    }
  };

  const handleGenotypeToggle = (value: any) => {
    if(genotype === value){
      setGenotype("");
      handleResetFilter();
    }else {
      setGenotype(value)
    }
  }

  const handleInsecticideToggle = (value: any) => {
    if (insecticideControl === value) {
      setInsecticideControl("");
    } else {
      setInsecticideControl(value);
    }
  };

  const handleSelection = (category: any, value: any) => {
    switch (category) {
      case "Season":
        setSelectedSeason(selectedSeason === value ? "" : value);
        if (selectedSeason === value) {
          handleResetFilter(); // Call reset filter when toggled off
        }
        break;
      case "Control":
        setSelectedControl(selectedControl === value ? "" : value);
        if (selectedControl === value) {
          handleResetFilter(); // Call reset filter when toggled off
        }
        break;
      case "Adult":
        setSelectedAdult(selectedAdult === value ? "" : value);
        if (selectedAdult === value) {
          handleResetFilter(); // Call reset filter when toggled off
        }
        break;
      case "Larval":
        setSelectedLarval(selectedLarval === value ? "" : value);
        if (selectedLarval === value) {
          handleResetFilter(); // Call reset filter when toggled off
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const filterParams: {} = composeFilterConditions();
    if (filterParams && Object.keys(filterParams).length > 0) {
      handleFilterConditions(filterParams);
    }
  }, [
    selectedSpecies,
    selectedCountry,
    selectedSeason,
    bionomicsData,
    selectedLarval,
    selectedAdult,
    selectedSeason,
    phenotype,
    genotype,
  ]);

  const toggleSelectedByArea = (shape: string) => {
    if (selectedByArea === "") {
      handleDrawArea(shape);
      setSelectedByArea(shape);
    } else if (selectedByArea != shape && selectedByArea != "") {
      handleDrawArea(shape);
      setSelectedByArea(shape);
    } else {
      handleDrawArea("");
      setSelectedByArea("");
    }
  };
  return (
    <div className={`filter-dev-section ${mini ? 'minimized' : ''}`}>
      {open && (
        <Box
          sx={{ width: 450, m: 3 }}
        >
          {/* <Tooltip title= {mini?"Maximize":"Minimize"} arrow>
           <IconButton
            onClick={() => setMini(!mini)}
            sx={{
              position: "absolute",
              top: "5px",
              right: "40px",
              marginBottom: "15px",
            
            }}
          >
            {mini ? <OpenInFullIcon /> : <CloseFullscreenIcon />}
          </IconButton>
          </Tooltip>
          <Tooltip title="Close" arrow>
          <IconButton
            onClick={onCloseFilter}
            sx={{
              position: "absolute",
              top: "5px",
              right: "5px",
              marginBottom: "15px",
             
            }}
          >
            <CloseIcon />
          </IconButton>
          </Tooltip> */}

          {mini && (
            <Tooltip title="Maximize" arrow>
              <IconButton
                onClick={() => setMini(false)}
                sx={{
                  position: "absolute",
                  top: "5px",
                  right: "40px",
                  marginBottom: "15px",
                  // width: "100%",
                  zIndex: 1000,
                  "&:hover": { backgroundColor: "rgba(0, 128, 0, 0.8)" },
                }}
              >
                <OpenInFullIcon sx={{ width: "100%" }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Render your existing filter content when not minimized */}
          {!mini && (
            <>
              <Tooltip title={mini ? "Maximize" : "Minimize"} arrow>
                <IconButton
                  onClick={() => setMini(!mini)}
                  sx={{
                    position: "absolute",
                    top: "5px",
                    right: "40px",
                    marginBottom: "15px",
                  }}
                >
                  {mini ? <OpenInFullIcon /> : <CloseFullscreenIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Close" arrow>
                <IconButton
                  onClick={onCloseFilter}
                  sx={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    marginBottom: "15px",
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>

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
                      InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
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
                      InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                      // placeholder="Select Species"
                    />
                  )}
                  onChange={(event, values) => {
                    // Check if values are null or an empty array
                    if (!values || values.length === 0) {
                      handleSpecies([]);
                      handleResetFilter();
                    } else {
                      handleSpecies(values);
                    }
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={12}>
              <FormControl fullWidth style={{ width: "100%" }}>
                <Autocomplete
                  //multiple
                  id="filter-by-country"
                  open={openCountries}
                  value={selectedCountry}
                  onOpen={() => {
                    setOpenCountries(true);
                  }}
                  onClose={() => {
                    setOpenCountries(false);
                  }}
                  //isOptionEqualToValue={(option, value) => option === value}
                  getOptionLabel={(option) => (option as any).properties.name}
                  getOptionKey={(option) => (option as any).id}
                  options={countriesOptions}
                  loading={isFetchingCountries}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={`Countries`}
                      variant="filled"
                      InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
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
                  onChange={(event, values) => {
                    // Check if values are null or an empty array
                    if (!values || values.length === 0) {
                      // clearSelectedCountries();// Clear selected countries
                      setSelectedCountry("");
                      handleResetFilter(); // Clear filter associated with countries
                    } else {
                      handleCountries(values); // Update selected countries
                    }
                  }}
                />
              </FormControl>
            </Grid>
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ paddingLeft: "17px" }}
                >
                  <Grid item xs={12} sm={4} md={12}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontStyle: "italic",
                        marginRight: "5px",
                        color: "#555",
                        fontSize: 15,
                        fontWeight: "550",
                      }}
                    >
                      Bionomics Data:
                    </Typography>
                    <Grid container direction="row" alignItems="center">
                      <Grid item xs={4} textAlign="center">
                        <Button
                          variant="contained"
                          onClick={() => handleBioToggle("true")}
                          fullWidth
                          sx={{
                            display: "flex",
                            fontSize: "0.7rem",
                            flexDirection: "column",
                            justifyContent: "center",
                            padding: "6px 12px",
                            marginBottom: "2px",
                            color: bionomicsData === "true" ? "89C6A7" : "text.primary",
                            backgroundColor: bionomicsData === "true" ? "success.light" : "background.default",
                            "&:hover": {
                              backgroundColor: bionomicsData === "true" ? "#ebbd40" : "background.default",
                            },
                          }}
                        >
                          <LinkIcon />
                          True
                        </Button>
                      </Grid>
                      <Grid item xs={4} textAlign="center">
                        <Button
                          variant="contained"
                          onClick={() => handleBioToggle("false")}
                          fullWidth
                          sx={{
                            display: "flex",
                            fontSize: "0.7rem",
                            flexDirection: "column",
                            justifyContent: "center",
                            padding: "6px 12px",
                            marginBottom: "2px",
                            color: bionomicsData === "false" ? "89C6A7" : "text.primary",
                            backgroundColor: bionomicsData === "false" ? "success.light" : "background.default",
                            "&:hover": {
                              backgroundColor: bionomicsData === "false" ? "#ebbd40" : "background.default",
                            },
                          }}
                        >
                          <LinkOffIcon />
                          False
                        </Button>
                      </Grid>
                      <Grid item xs={4} textAlign="center">
                        {/* Empty Icon Button */}
                        <Button
                          variant="contained"

                          onClick={() => handleBioToggle("null")}
                          fullWidth
                          sx={{
                            display: "flex",
                            fontSize: "0.7rem",
                            flexDirection: "column",
                            justifyContent: "center",
                            padding: "6px 12px",
                            marginBottom: "2px",
                            color: bionomicsData === "null" ? "89C6A7" : "text.primary",
                            backgroundColor: bionomicsData === "null" ? "success.light" : "background.default",
                            "&:hover": {
                              backgroundColor: bionomicsData === "null" ? "#ebbd40" : "background.default",
                            },
                          }}
                        >
                          <DataArrayIcon />
                          Empty
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
            </Grid>
               
                {/* <Typography
                  sx={{
                    color: "#2e7d32",
                    fontSize: 17,
                    mt: 4,
                    fontWeight: "550",
                    marginLeft: '20px',
                  }}
                >
                  Insecicide Resistence
                </Typography>

                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ paddingLeft: "17px" }}
                >
                 
                  <Grid item xs={12} sm={3} md={6}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontStyle: "italic",
                        marginRight: "5px",
                        color: "#555",
                        fontSize: 15,
                        fontWeight: "550",
                      }}
                    >
                      Phenotype:
                    </Typography>
                    <Grid container direction="row" alignItems="center">
                      <Grid item xs={3} textAlign="center">
                        <Button
                          variant="contained"
                          onClick={() => handlePhenotypeToggle("true")}
                          fullWidth
                          sx={{
                            display: "flex",
                            fontSize: "0.7rem",
                            flexDirection: "column",
                            justifyContent: "center",
                            padding: "6px 12px",
                            marginBottom: "2px",
                            color: phenotype === "true" ? "89C6A7" : "text.primary",
                            backgroundColor: phenotype === "true" ? "success.light" : "background.default",
                            "&:hover": {
                              backgroundColor: phenotype === "true" ? "#ebbd40" : "background.default",
                            },
                          }}
                        >
                          <LinkIcon />
                          True
                        </Button>
                      </Grid>
                      <Grid item xs={3} textAlign="center">
                        <Button
                          variant="contained"
                          onClick={() => handlePhenotypeToggle("false")}
                          fullWidth
                          sx={{
                            display: "flex",
                            fontSize: "0.7rem",
                            flexDirection: "column",
                            justifyContent: "center",
                            padding: "6px 12px",
                            marginBottom: "2px",
                            color: phenotype === "false" ? "89C6A7" : "text.primary",
                            backgroundColor: phenotype === "false" ? "success.light" : "background.default",
                            "&:hover": {
                              backgroundColor: phenotype === "false" ? "#ebbd40" : "background.default",
                            },
                          }}
                        >
                          <LinkOffIcon />
                          False
                        </Button>
                      </Grid>
                      <Grid item xs={3} textAlign="center">
                    
                        <Button
                          variant="contained"

                          onClick={() => handlePhenotypeToggle("null")}
                          fullWidth
                          sx={{
                            display: "flex",
                            fontSize: "0.7rem",
                            flexDirection: "column",
                            justifyContent: "center",
                            padding: "6px 12px",
                            marginBottom: "2px",
                            color: bionomicsData === "null" ? "89C6A7" : "text.primary",
                            backgroundColor: bionomicsData === "null" ? "success.light" : "background.default",
                            "&:hover": {
                              backgroundColor: bionomicsData === "null" ? "#ebbd40" : "background.default",
                            },
                          }}
                        >
                          <DataArrayIcon />
                          Empty
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                   
                  <Grid item xs={12} sm={4} md={6}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontStyle: "italic",
                        marginRight: "5px",
                        color: "#555",
                        fontSize: 15,
                        fontWeight: "550",
                      }}
                    >
                      Genotype:
                    </Typography>
                    <Grid container direction="row" alignItems="center">
                      <Grid item xs={3} textAlign="center">
                        <Button
                          variant="contained"
                          onClick={() => handleGenotypeToggle("true")}
                          fullWidth
                          sx={{
                            display: "flex",
                            fontSize: "0.7rem",
                            flexDirection: "column",
                            justifyContent: "center",
                            padding: "6px 12px",
                            marginBottom: "2px",
                            color: genotype === "true" ? "89C6A7" : "text.primary",
                            backgroundColor: genotype === "true" ? "success.light" : "background.default",
                            "&:hover": {
                              backgroundColor: genotype === "true" ? "#ebbd40" : "background.default",
                            },
                          }}
                        >
                          <LinkIcon />
                          True
                        </Button>
                      </Grid>
                      <Grid item xs={3} textAlign="center">
                        <Button
                          variant="contained"
                          onClick={() => handleGenotypeToggle("false")}
                          fullWidth
                          sx={{
                            display: "flex",
                            fontSize: "0.7rem",
                            flexDirection: "column",
                            justifyContent: "center",
                            padding: "6px 12px",
                            marginBottom: "2px",
                            color: genotype === "false" ? "89C6A7" : "text.primary",
                            backgroundColor: genotype === "false" ? "success.light" : "background.default",
                            "&:hover": {
                              backgroundColor: genotype === "false" ? "#ebbd40" : "background.default",
                            },
                          }}
                        >
                          <LinkOffIcon />
                          False
                        </Button>
                      </Grid>
                      <Grid item xs={3} textAlign="center">
                        
                        <Button
                          variant="contained"

                          onClick={() => handleGenotypeToggle("null")}
                          fullWidth
                          sx={{
                            display: "flex",
                            fontSize: "0.7rem",
                            flexDirection: "column",
                            justifyContent: "center",
                            padding: "6px 12px",
                            marginBottom: "2px",
                            color: bionomicsData === "null" ? "89C6A7" : "text.primary",
                            backgroundColor: bionomicsData === "null" ? "success.light" : "background.default",
                            "&:hover": {
                              backgroundColor: bionomicsData === "null" ? "#ebbd40" : "background.default",
                            },
                          }}
                        >
                          <DataArrayIcon />
                          Empty
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                    </Grid>
                  */}
               

                <Grid item xs={12} sm={4} md={12}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontStyle: "italic",
                      marginRight: "5px",
                      color: "#555",
                      fontSize: 15,
                      fontWeight: "550",
                    }}
                  >
                    Insecticide Resistance:
                  </Typography>
                  <Grid container direction="row" alignItems="center">
                    <Grid item xs={3} textAlign="center">
                      <Button
                        variant="contained"
                        onClick={() => setInsecticideResistance("phenotypic")}
                        fullWidth
                        sx={{
                          display: "flex",
                          fontSize: "0.7rem",
                          flexDirection: "column",
                          justifyContent: "center",
                          padding: "8px 12px",
                          marginBottom: "2px",
                          color:
                            insecticideResistance === "phenotypic"
                              ? "89C6A7"
                              : "text.primary",
                          backgroundColor:
                            insecticideResistance === "phenotypic"
                              ? "success.light"
                              : "background.default",
                          "&:hover": {
                            backgroundColor:
                              insecticideResistance === "phenotypic"
                                ? "#ebbd40"
                                : "background.default",
                          },
                        }}
                      >
                        <FingerprintIcon />
                        Phenotypic
                      </Button>
                    </Grid>
                    <Grid item xs={3} textAlign="center">
                      <Button
                        variant="contained"
                        onClick={() => setInsecticideResistance("genotypic")}
                        fullWidth
                        sx={{
                          display: "flex",
                          fontSize: "0.7rem",
                          flexDirection: "column",
                          justifyContent: "center",
                          padding: "8px 12px",
                          marginBottom: "2px",
                          color:
                            insecticideResistance === "genotypic"
                              ? "89C6A7"
                              : "text.primary",
                          backgroundColor:
                            insecticideResistance === "genotypic"
                              ? "success.light"
                              : "background.default",
                          "&:hover": {
                            backgroundColor:
                              insecticideResistance === "genotypic"
                                ? "#ebbd40"
                                : "background.default",
                          },
                        }}
                      >
                        <HourglassEmptyIcon />
                        Genotypic
                      </Button>
                    </Grid>
                    <Grid item xs={3} textAlign="center">
                      <Button
                        variant="contained"
                        onClick={() => setInsecticideResistance("empty")}
                        fullWidth
                        sx={{
                          display: "flex",
                          fontSize: "0.7rem",
                          flexDirection: "column",
                          justifyContent: "center",
                          padding: "8px 12px",
                          marginBottom: "2px",
                          color:
                            insecticideResistance === "empty"
                              ? "89C6A7"
                              : "text.primary",
                          backgroundColor:
                            insecticideResistance === "empty"
                              ? "success.light"
                              : "background.default",
                          "&:hover": {
                            backgroundColor:
                              insecticideResistance === "empty"
                                ? "#ebbd40"
                                : "background.default",
                          },
                        }}
                      >
                        <DataArrayIcon />
                        Empty
                      </Button>
                    </Grid>
                    {/* New Buttons */}
                    <Grid item xs={3} textAlign="center">
                      <Button
                        variant="contained"
                        onClick={() => setInsecticideResistance("none")}
                        fullWidth
                        sx={{
                          display: "flex",
                          fontSize: "0.7rem",
                          flexDirection: "column",
                          justifyContent: "center",
                          padding: "8px 12px",
                          marginBottom: "2px",
                          color:
                            insecticideResistance === "none"
                              ? "89C6A7"
                              : "text.primary",
                          backgroundColor:
                            insecticideResistance === "none"
                              ? "success.light"
                              : "background.default",
                          "&:hover": {
                            backgroundColor:
                              insecticideResistance === "none"
                                ? "#ebbd40"
                                : "background.default",
                          },
                        }}
                      >
                        <ClearIcon />
                        None
                      </Button>
                    </Grid>
                    <Grid item xs={3} textAlign="center">
                      <Button
                        variant="contained"
                        onClick={() => setInsecticideResistance("both")}
                        fullWidth
                        sx={{
                          display: "flex",
                          fontSize: "0.7rem",
                          flexDirection: "column",
                          justifyContent: "center",
                          padding: "8px 12px",
                          marginBottom: "2px",
                          color:
                            insecticideResistance === "both"
                              ? "89C6A7"
                              : "text.primary",
                          backgroundColor:
                            insecticideResistance === "both"
                              ? "success.light"
                              : "background.default",
                          "&:hover": {
                            backgroundColor:
                              insecticideResistance === "both"
                                ? "#ebbd40"
                                : "background.default",
                          },
                        }}
                      >
                        <ChecklistIcon />
                        Both
                      </Button>
                    </Grid>
                  </Grid>
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
                    fontWeight: "550",
                  }}
                >
                  Season:
                </Typography>
                <Tooltip title="Rainy" arrow>
                  <IconButton
                    onClick={() => handleSelection("Season", "wet")}
                    color={selectedSeason === "wet" ? "success" : "default"}
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
                    onClick={() => handleSelection("Season", "dry")}
                    color={selectedSeason === "dry" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color: selectedSeason === "dry" ? "default" : "#2e7d32",
                      },
                    }}
                  >
                    <WbSunnyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cross" arrow>
                  <IconButton
                    onClick={() => handleSelection("Season", "cross")}
                    color={selectedSeason === "cross" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedSeason === "cross" ? "#2e7d32" : "primary",
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
                    fontWeight: "550",
                  }}
                >
                  Control:
                </Typography>
                <Tooltip title="True" arrow>
                  <IconButton
                    onClick={() => handleSelection("Control", "true")}
                    color={selectedControl === "true" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedControl === "true" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <DoneIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="False" arrow>
                  <IconButton
                    onClick={() => handleSelection("Control", "false")}
                    color={selectedControl === "false" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedControl === "false" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Empty" arrow>
                  <IconButton
                    onClick={() => handleSelection("Control", "empty")}
                    color={selectedControl === "empty" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedControl === "empty" ? "#2e7d32" : "primary",
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
                    fontWeight: "550",
                  }}
                >
                  Adult:
                </Typography>
                <Tooltip title="True" arrow>
                  <IconButton
                    onClick={() => handleSelection("Adult", "true")}
                    color={selectedAdult === "true" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color: selectedAdult === "true" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <EmojiNatureIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="False" arrow>
                  <IconButton
                    onClick={() => handleSelection("Adult", "false")}
                    color={selectedAdult === "false" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedAdult === "false" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <BugReportIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Empty" arrow>
                  <IconButton
                    onClick={() => handleSelection("Adult", "empty")}
                    color={selectedAdult === "empty" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedAdult === "empty" ? "#2e7d32" : "primary",
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
                    fontWeight: "550",
                  }}
                >
                  Larval:
                </Typography>
                <Tooltip title="True" arrow>
                  <IconButton
                    onClick={() => handleSelection("Larval", "true")}
                    color={selectedLarval === "true" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedLarval === "true" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <PestControlIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="False" arrow>
                  <IconButton
                    onClick={() => handleSelection("Larval", "false")}
                    color={selectedLarval === "false" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedLarval === "false" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <EggIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Empty" arrow>
                  <IconButton
                    onClick={() => handleSelection("Larval", "null")}
                    color={selectedLarval === "null" ? "success" : "default"}
                    sx={{
                      fontSize: "1.5rem",
                      "&:hover": {
                        color:
                          selectedLarval === "null" ? "#2e7d32" : "primary",
                      },
                    }}
                  >
                    <DataArrayIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Typography
                sx={{
                  color: "#2e7d32",
                  fontSize: 17,
                  mt: 4,
                  fontWeight: "550",
                }}
              >
                Select by area
              </Typography>
              <Grid
                container
                rowSpacing={8}
                direction="row"
                sx={{ flexDirection: "row" }}
              >
                <Grid
                  item
                  // xs={12}
                  // sm={12}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontStyle: "italic",
                      marginRight: "5px",
                      color: "black",
                      fontSize: ".9rem",
                    }}
                  >
                    Circle:{" "}
                    <IconButton
                      onClick={() => toggleSelectedByArea("Circle")}
                      color={
                        selectedByArea === "Circle" ? "success" : "default"
                      }
                      sx={{
                        "&:hover": {
                          color:
                            selectedByArea === "Circle" ? "#2e7d32" : "primary",
                        },
                      }}
                    >
                      <CircleOutlinedIcon />
                    </IconButton>
                  </Typography>
                </Grid>
                <Grid
                  item
                  // xs={12}
                  // sm={12}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontStyle: "italic",
                      marginRight: "5px",
                      color: "black",
                      fontSize: ".9rem",
                    }}
                  >
                    Polygon:{" "}
                    <IconButton
                      onClick={() => toggleSelectedByArea("Polygon")}
                      color={
                        selectedByArea === "Polygon" ? "success" : "default"
                      }
                      sx={{
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
            </Grid>
            <div className="button-container-style">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#2e7d32",
                  "&:hover": {
                    backgroundColor: "#ebbd40",
                    // Background color on hover
                  },
                }}
                size="small"
                style={{ fontSize: "0.7rem" }}
                onClick={() => {
                  setSelectedDisease([] as string[]);
                  setIsDiseaseSelected(false);
                  setSelectedCountry("");
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
                  setSelectedByArea("");
                  handleClearFilter();
                  clearSelectedCountries();
                  setBionomicsData("");
                  setInsecticideResistance("");
                  // Reset other state variables as needed
                }}
              >
                Clear Selection
              </Button>
            </div>
          </Grid>
          </>
      )}
        </Box>
      )}
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
