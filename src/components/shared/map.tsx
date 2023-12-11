"use client";
import React, { useEffect, useRef, useState } from "react";
import { Feature, Map, View } from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import LayerGroup from "ol/layer/Group";
import OSM from "ol/source/OSM";
import { BaseLayerOptions, GroupLayerOptions } from "ol-layerswitcher";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import { bbox as bboxStrategy } from "ol/loadingstrategy.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { Pixel } from "ol/pixel";
import MapBrowserEvent from "ol/MapBrowserEvent";
import Event from "ol/events/Event";
import Popover from "@mui/material/Popover";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  geoServerBaseUrl,
  getBasemapOverlaysLayersArray,
} from "@/requests/requests";
import "./CSS/LayerSwitcherStyles.css";
import { Stroke, Fill, Style, Circle } from "ol/style";
import FilterSection from "../filters/filtersection";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Grid,
  Collapse,
  Tooltip,
  IconButton,
  colors,
  SelectChangeEvent,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import { formControlStyle, containerStyle, buttonContainerStyle, buttonStyle, renderButton } from "./CSS/filterStyle";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import DataArrayIcon from "@mui/icons-material/DataArray";
import EmojiNatureIcon from "@mui/icons-material/EmojiNature";
import BugReportIcon from "@mui/icons-material/BugReport";
import PestControlIcon from "@mui/icons-material/PestControl";
import EggIcon from "@mui/icons-material/Egg";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import { Geometry, Point } from "ol/geom";

function Newmap() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [popoverContent, setPopoverContent] = React.useState<{
    [x: string]: any;
  }>({});
  const open = Boolean(anchorEl);
  const id = open ? "feature-popover" : undefined;
  const [map, setMap] = useState<Map | undefined>(); // Specify the type using a generic type argument
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | undefined>(undefined);
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [occurrenceData, setOccurrenceData] = useState<any[]>([]);


  //filtersection
  const [newopen, setOpen] = useState(false);
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
  // console.log(selectedSpecies)
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
  const renderMultipleSelection = (selected: string | string[]) => {
    if (Array.isArray(selected)) {
      return selected.join(", ");
    }
    return selected;
  };

  //end of filters
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const handleClosePopover = () => {
    if (anchorEl) {
      anchorEl.remove(); // This removes the dummy anchor from the DOM
    }
    setAnchorEl(null);
  };
  mapRef.current = map;

  const jsonurl = "/geoserver/vector/ows?service=WFS&version=" +
    "1.0.0&request=GetFeature&typeName" +
    "=vector%3Aoccurrence&maxFeatures=1000&outputFormat=application%2Fjson"

  const speciesName = ['arabiensis', 'funestus'];
  const specFilter = `species IN ('${speciesName.join("','")}')`;

  const [colorArray, setColorArray] = useState<string[]>([
    '#648fff',
    '#785ef0',
    '#fe6100',
    '#ffb000',
    '#000000',
    '#ffffff',
    '#dc267f',
  ]);


  //  const [occurrenceSource, setOccurrenceSource] = useState<VectorSource>( 
  //   new VectorSource({
  //     format: new GeoJSON(),
  //     url:
  //       geoServerBaseUrl +
  //       "/geoserver/vector/ows?service=WFS&version=" +
  //       "1.0.0&request=GetFeature&typeName" +
  //       "=vector%3Aoccurrence&maxFeatures=50&outputFormat=application%2Fjson" 
  //      ,
  //     strategy: bboxStrategy,
  //   }) 
  // );

  // useEffect(() => {
  //   const fetchOccurrenceData = async () => {
  //     try {
  //       const response = await fetch(
  //         geoServerBaseUrl +
  //           "/geoserver/vector/ows?service=WFS&version=" +
  //           "1.0.0&request=GetFeature&typeName" +
  //           "=vector%3Aoccurrence&maxFeatures=50&outputFormat=application%2Fjson"
  //       );

  //       const data = await response.json();

  //       console.log("Fetched data:", data);
  //       const featuresArray = data.features || [];

  //     // Ensure featuresArray is an array before setting it
  //     if (Array.isArray(featuresArray)) {
  //       setOccurrenceData(featuresArray);


  //     const occurrenceSource = new VectorSource({
  //       format: new GeoJSON(),
  //       features: new GeoJSON().readFeatures(responseToGEOJSON(featuresArray), {
  //         featureProjection: 'EPSG:3857',
  //       }),
  //       strategy: bboxStrategy,
  //     });
  //     const occurrenceLayer = new VectorLayer({
  //       title: "Occurrence Layer",
  //       visible: true,
  //       preload: Infinity,
  //       source: occurrenceSource,
  //       style: new Style({
  //         image: new Circle({
  //           radius: 5,
  //           fill: new Fill({
  //             color: "red", // or any other color
  //           }),
  //         }),
  //       }),
  //     } as BaseLayerOptions);

  //     setOccurrenceLayer(occurrenceLayer);

  //   }
  //     else {
  //       console.error("Fetched data features are not an array:", data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching occurrence data:", error);
  //   }
  //   };
  //   fetchOccurrenceData();
  // }, []); 

  function responseToGEOJSON(occurrenceData: any) {
    const geoJSONPoints = (occurrenceData || []).map((d: any) => {
      const coordinates = d.geometry.coordinates;
      return {
        type: 'Feature',
        geometry: {
          type: d.geometry.type,
          coordinates: coordinates,
        },
        properties: d.properties
        
      };
    });
   
    const geoJSONFeatureCollection = {
      type: 'FeatureCollection',
      features: geoJSONPoints,
    };
    return geoJSONFeatureCollection;
  }


  const [occurrenceSource, setOccurrenceSource] = useState<VectorSource>(
    new VectorSource({
      format: new GeoJSON(),
      // Initially, provide an empty array for features
      features: new GeoJSON().readFeatures(
        responseToGEOJSON(occurrenceData)
      ),
      strategy: bboxStrategy,
    })
  );

 
  // useEffect(() => {
  //   // Update occurrenceSource when occurrenceData changes
  //   setOccurrenceSource(new VectorSource({
  //     format: new GeoJSON(),
  //     features: new GeoJSON().readFeatures(responseToGEOJSON(occurrenceData), {
  //       featureProjection: 'EPSG:4326',
  //     }),
  //     strategy: bboxStrategy,
  //   }));
  //   console.log(occurrenceSource)
  // }, [occurrenceData]);

  // const [occurrenceLayer, setOccurrenceLayer] = useState<VectorLayer<VectorSource<Geometry>>>(
  //   new VectorLayer({
  //     title: "Occurrence Layer",
  //     visible: true,
  //     preload: Infinity,
  //     source: occurrenceSource,
  //     style: new Style({
  //       image: new Circle({
  //         radius: 5,
  //         fill: new Fill({
  //           color: "red", // or any other color
  //         }),
  //       }),
  //     }),
  //   } as BaseLayerOptions)
  // );

  // const [occurrenceGroup, setOccurrenceGroup] = useState<LayerGroup>(
  //   new LayerGroup({
  //     title: "Occurrence",
  //     layers: [occurrenceLayer],
  //   } as GroupLayerOptions)
  // );


  // const [occurrenceSource, setOccurrenceSource] = useState<VectorSource | null>(null);
  // const [occurrenceLayer, setOccurrenceLayer] = useState<VectorLayer<VectorSource<Geometry>> | null>(null);
  // const [occurrenceGroup, setOccurrenceGroup] = useState<LayerGroup>(new LayerGroup());


  // const fetchOccurrenceData = async () => {
  //   try {
  //     const response = await fetch(
  //       geoServerBaseUrl +
  //       "/geoserver/vector/ows?service=WFS&version=" +
  //       "1.0.0&request=GetFeature&typeName" +
  //       "=vector%3Aoccurrence&maxFeatures=50&outputFormat=application%2Fjson"
  //     );

  //     const data = await response.json();

  //     console.log("Fetched Occurrence Data:", data);

  //     // Create a new VectorSource with the fetched data
  //     setOccurrenceSource(
  //       new VectorSource({
  //         format: new GeoJSON(),
  //         features: data.features || [], // Assuming the data structure has a 'features' property
  //         strategy: bboxStrategy,
  //       })
  //     );

  //     // const newOccurrenceLayer = new VectorLayer({
  //     //   title: "Occurrence Layer",
  //     //   visible: true,
  //     //   preload: Infinity,
  //     //   source: newOccurrenceSource,
  //     //   style: (feature: { get: (arg0: string) => any; }) => {
  //     //     const species = feature.get('species');
  //     //     const ind = selectedSpecies.indexOf(species);

  //     //     const validInd = ind >= 0 && ind < colorArray.length ? ind : 0;

  //     //     return new Style({
  //     //       image: new Circle({
  //     //         fill: new Fill({
  //     //           color: colorArray[validInd],
  //     //         }),
  //     //         stroke: new Stroke({
  //     //           color: 'rgba(255, 0, 0, 1)',
  //     //           width: 2,
  //     //         }),
  //     //         radius: 5,
  //     //       }),
  //     //     });
  //     //   },
  //     // } as BaseLayerOptions);

  //     // const newOccurrenceGroup = 
  //     //   new LayerGroup({
  //     //     title: "Occurrence",
  //     //     layers: [newOccurrenceLayer],
  //     //   } as GroupLayerOptions)


  //     // // Update the state with the new VectorSource, VectorLayer, and LayerGroup
  //     // setOccurrenceSource(newOccurrenceSource);
  //     // setOccurrenceLayer(newOccurrenceLayer);
  //     // setOccurrenceGroup(newOccurrenceGroup);

  //   } catch (error) {
  //     console.error("Error fetching occurrence data:", error);
  //   }
  // };




  // useEffect(() => {
  //   // Filter occurrenceSource based on selected species
  //   if (occurrenceSource && selectedSpecies) {
  //     const filteredFeatures = occurrenceSource.getFeatures().filter(feature => {
  //       // Assuming 'species' is the field in your GeoJSON data
  //       const speciesProperty = feature.get('species');
  //       return speciesProperty === selectedSpecies;
  //     });

  //     const filteredOccurrenceSource = new VectorSource({
  //       features: filteredFeatures,
  //     });

  //     // Update the occurrence layer with the filtered source
  //     const newOccurrenceLayer = new VectorLayer({
  //       title: "Occurrence Layer",
  //       visible: true,
  //       preload: Infinity,
  //       source: filteredOccurrenceSource,
  //       style: new Style({
  //         image: new Circle({
  //           fill: new Fill({
  //             color: "rgba(255, 0, 0, 0.5)", // Fill color
  //           }),
  //           stroke: new Stroke({
  //             color: "rgba(255, 0, 0, 1)", // Stroke color
  //             width: 2, // Stroke width
  //           }),
  //           radius: 5,
  //         }),
  //       }),
  //     } as BaseLayerOptions);

  //     // Update the occurrenceLayer state
  //     setOccurrenceLayer(newOccurrenceLayer);
  //   }
  // }, [selectedSpecies, occurrenceSource]);

  // useEffect(() => {
  //   // Update the occurrenceGroup with the new occurrenceLayer
  //   if (occurrenceLayer) {
  //     const newOccurrenceGroup = new LayerGroup({
  //       title: "Occurrence",
  //       layers: [occurrenceLayer],
  //     } as GroupLayerOptions);
  //     console.log(newOccurrenceGroup)

  //     // Update the occurrenceGroup state
  //     setOccurrenceGroup(newOccurrenceGroup);
  //   }
  // }, [occurrenceLayer]);


  // START OF STATE DECLARATION

  //'END OF STATE DECLARATION'


  // START OF URL USE EFFECT
  // useEffect(() => {

  //   const speciesFilter = selectedSpecies.length
  //   ? `species IN (${selectedSpecies.map(species => `'${encodeURIComponent(species)}'`).join(',')})`
  //   : '';
  //   const url = new URL(`${geoServerBaseUrl}/geoserver/vector/ows`);
  //   url.searchParams.set('service', 'WFS');
  //   url.searchParams.set('version', '1.0.0');
  //   url.searchParams.set('request', 'GetFeature');
  //   url.searchParams.set('typeName', 'vector:occurrence');
  //   url.searchParams.set('maxFeatures', '1000');
  //   url.searchParams.set('outputFormat', 'application/json');

  //   if (speciesFilter) {
  //     url.searchParams.set('cql_filter', speciesFilter);
  //   }

  //   const urlString: string = url.toString();
  //   console.log(urlString);

  //   occurrenceSource.setUrl(url.toString());
  //   occurrenceSource.refresh();

  //   const updatedOccurrenceSource = new VectorSource({
  //     format: new GeoJSON(),
  //     url: urlString,
  //     strategy: bboxStrategy,
  //   });
  //   console.log(updatedOccurrenceSource)

  //   if (occurrenceLayer.getSource() !== updatedOccurrenceSource) {
  //     // Update the source of the existing layer
  //     occurrenceLayer.setSource(updatedOccurrenceSource);
  //   }

  //   const updatedOccurrenceLayer = new VectorLayer({
  //     title: "Occurrence Layer",
  //     visible: true,
  //     preload: Infinity,
  //     source: updatedOccurrenceSource,
  //     style: (feature: { get: (arg0: string) => any; }) => {
  //       const species = feature.get('species');
  //       const ind = selectedSpecies.indexOf(species);


  //     //  console.log(ind);

  //      const validInd = ind >= 0 && ind < colorArray.length ? ind : 0;
  //     //  console.log('Fill Color:', colorArray[validInd]);
  //       return new Style({
  //         image: new Circle({
  //           fill: new Fill({
  //             color:  colorArray[0],
  //           }),
  //           stroke: new Stroke({
  //             color: 'rgba(255, 0, 0, 1)',
  //             width: 2,
  //           }),
  //           radius: 5,
  //         }),
  //       });

  //     }
  //   } as BaseLayerOptions);
  //   console.log(updatedOccurrenceLayer)

  //   const updatedOccurrenceGroup = new LayerGroup({
  //     title: "Occurrence",
  //     layers: [updatedOccurrenceLayer],
  //   } as GroupLayerOptions);

  //   setOccurrenceSource(updatedOccurrenceSource);
  //   setOccurrenceLayer(updatedOccurrenceLayer);
  //   setOccurrenceGroup(updatedOccurrenceGroup);

  // }, [selectedSpecies, geoServerBaseUrl,]);

  // const occurrenceLayer = new VectorLayer({
  //   title: "Occurrence Layer",
  //   visible: false,
  //   preload: Infinity,
  //   source: occurrenceSource,
  //   style: new Style({
  //     image: new Circle({
  //       fill: fill,
  //       stroke: stroke,
  //       radius: 5,
  //     }),
  //     fill: fill, 
  //     stroke: stroke,
  //   }),
  // } as BaseLayerOptions);

  // const occurrenceGroup = new LayerGroup({
  //   title: "Occurrence",
  //   layers: [occurrenceLayer],
  // } as GroupLayerOptions);

  useEffect(() => {
    const speciesColors = [
      '#648fff',
      '#785ef0',
      '#fe6100',
      '#ffb000',
      '#000000',
      '#ffffff',
      '#dc267f',
    ];

    const occurrenceSource = new VectorSource({
      format: new GeoJSON(),
      features: [],
      strategy: bboxStrategy,
    });
    const occurrenceLayer = new VectorLayer({
      title: "Occurrence Layer",
      visible: true,
      preload: Infinity,
      source: occurrenceSource,
      style: (feature: any) => {
        const species = feature.getProperties().species;
        const isSelectedSpecies = selectedSpecies.includes(species);
        const speciesIndex = selectedSpecies.indexOf(species);
        const color = speciesIndex !== -1 ? speciesColors[speciesIndex] : 'red';

        return new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({
              color: isSelectedSpecies ? color : 'red',
            }),
          }),
        });
      },
    } as BaseLayerOptions);
    occurrenceLayer.set('occurrence-data', true);

    const fetchOccurrenceData = async () => {
      try {
        const response = await fetch(
          geoServerBaseUrl +
          "/geoserver/vector/ows?service=WFS&version=" +
          "1.0.0&request=GetFeature&typeName" +
          "=vector%3Aoccurrence&maxFeatures=50&outputFormat=application%2Fjson"
        );

        const data = await response.json();

        console.log("Fetched data:", data);
        const featuresArray = data.features || [];

        if (Array.isArray(featuresArray)) {
          // Update the occurrence source with the fetched features
          occurrenceSource.clear();
          occurrenceSource.addFeatures(
            new GeoJSON().readFeatures(responseToGEOJSON(featuresArray), {
              featureProjection: 'EPSG:3857',
            })
          );
          occurrenceLayer.changed();

          setOccurrenceData(featuresArray);

          console.log(selectedSpecies)

          // const occurrenceSource = new VectorSource({
          //   format: new GeoJSON(),
          //   features: new GeoJSON().readFeatures(responseToGEOJSON(featuresArray), {
          //     featureProjection: 'EPSG:3857',
          //   }),
          //   strategy: bboxStrategy,
          // });

          // const occurrenceLayer = new VectorLayer({
          //   title: "Occurrence Layer",
          //   visible: true,
          //   preload: Infinity,
          //   source: occurrenceSource,
          //   style: (feature: any) => {
          //     const species = feature.getProperties().species;
          //     const isSelectedSpecies = selectedSpecies.includes(species);

          //     // Find the index of the species in the selectedSpecies array
          //     const speciesIndex = selectedSpecies.indexOf(species);

          //     // Use the speciesIndex to get the corresponding color from the array
          //     const color = speciesIndex !== -1 ? speciesColors[speciesIndex] : 'red';

          //     return new Style({
          //       image: new Circle({
          //         radius: 5,
          //         fill: new Fill({
          //           color: isSelectedSpecies ? color : 'red',
          //         }),
          //       }),
          //     });
          //   },
          // } as BaseLayerOptions);
          // occurrenceLayer.set('occurrence-data', true);
          // const isOccurrenceData = occurrenceLayer.get('occurrence-data');
          // console.log(isOccurrenceData); // Should log true


          getBasemapOverlaysLayersArray("basemaps").then((baseMapsArray) => {
            getBasemapOverlaysLayersArray("overlays").then((overlaysArray) => {
              const BaseMaps = new LayerGroup({
                title: "Base Maps",
                layers: baseMapsArray,
              } as GroupLayerOptions);

              const Overlays = new LayerGroup({
                title: "Overlays",
                layers: overlaysArray,
              } as GroupLayerOptions);

              // const occurrenceGroup = new LayerGroup({
              //   title: "Occurrence",
              //   layers: [occurrenceLayer],
              // } as GroupLayerOptions);
              // const occurrenceLayer = map?.getAllLayers().find((l) => l.get('occurrence-data'));

              if (BaseMaps && Overlays) {
                const initialMap = new Map({
                  target: "map-container",
                  layers: [BaseMaps, Overlays, occurrenceLayer],
                  view: new View({
                    center: [0, 0],
                    zoom: 4,
                  }),
                });

                initialMap.getLayers().clear();
                initialMap.addLayer(BaseMaps);
                initialMap.addLayer(Overlays);
                initialMap.addLayer(occurrenceLayer);

                const layerSwitcher = new LayerSwitcher();
                initialMap.addControl(layerSwitcher);
                const mapLayers = initialMap.getLayers().getArray();
                console.log("Map Layers:", mapLayers);

                const handleMapClick = (event: any) => {
                  console.log("handle map click before checking if map is defined");
                  // if (map) {
                  console.log("map defined");
                  initialMap.forEachFeatureAtPixel(
                    event.pixel,
                    (feature, layer) => {
                      if (layer === occurrenceLayer) {
                        console.log("Point clicked");
                        // Create a reference to the dummy HTML element for Popover anchor
                        const dummyAnchor = document.createElement("div");
                        dummyAnchor.style.position = "absolute";

                        // Position the dummy anchor based on the event's pixel
                        // Here you would use the map container's ID or ref to position correctly
                        dummyAnchor.style.left = `${event.pixel[0]}px`;
                        dummyAnchor.style.top = `${event.pixel[1]}px`;

                        // Append the dummy anchor to the map element
                        // Assuming mapElement.current is the container of the map
                        if (mapElement.current) {
                          mapElement.current.appendChild(dummyAnchor);
                        }

                        // Set the state for Popover content and anchor
                        setPopoverContent(feature.getProperties());
                        setAnchorEl(dummyAnchor);

                        // Return true to stop the forEach loop if needed
                        return true;
                      }
                    }
                  );
                  // }
                };

                initialMap.on("singleclick", handleMapClick);

                setMap(initialMap);
              }
            });
          });

          const layerSwitcher = new LayerSwitcher();
          if (map) {
            map.addControl(layerSwitcher);
          }
        }
      }

      catch (error) {
        console.error("Error fetching occurrence data:", error);
      }
    }
    fetchOccurrenceData();
  }, []);

  useEffect(() => {
    const greenCircleStyle = new Style({
      image: new Circle({
        radius: 5,
        fill: new Fill({
          color: 'green',
        }),
      }),
    });
    const logFilteredFeatures = () => {
      const filteredFeatures = occurrenceData.filter((feature) => {
        const species = feature.properties.species;
        return selectedSpecies.includes(species);
      });

      console.log('Filtered Features:', filteredFeatures);
    
    const existingOccurrenceLayer = map?.getLayers().getArray().find((layer) => {
      return layer.get('occurrence-data') === true;
    });
    console.log(existingOccurrenceLayer)
    if (existingOccurrenceLayer) {
      // Remove the existing occurrence layer from the map
      map?.removeLayer(existingOccurrenceLayer);
      console.log(map?.getAllLayers())
      const newOccurrenceLayer = new VectorLayer({
        title: 'Occurrence Layer',
        visible: true,
        preload: Infinity,
        source: new VectorSource({
          format: new GeoJSON(),
          features: new GeoJSON().readFeatures(responseToGEOJSON(filteredFeatures), {
            featureProjection: 'EPSG:3857',
          }),
          strategy: bboxStrategy,
        }),
        style: greenCircleStyle,
      }as BaseLayerOptions);

      newOccurrenceLayer.set('occurrence-data', true);
      newOccurrenceLayer.setZIndex(999)

      // Add the new occurrence layer to the map
      map?.addLayer(newOccurrenceLayer);
      console.log(map?.getAllLayers())
      map?.render()
    }
  }

    logFilteredFeatures();
    return () => {
      logFilteredFeatures();
    };
  
  }, [selectedSpecies, ]);

  const parentContainerStyle = {
    maxWidth: "800px", // Adjust as needed or remove for full-width responsiveness
    margin: "0 auto", // Center the container on the page
  };
  return (
    <>
      <div
        style={{ height: "calc(100vh - 120px)" }}
        ref={mapElement}
        className="map-container"
        id="map-container"
      >
        {/* <div style={parentContainerStyle}>
          <FilterSection />
        </div> */}
      </div>

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
        <Tooltip title={newopen ? "Hide Filters" : "Show Filters"} arrow>
          <IconButton
            onClick={() => setOpen(!newopen)}
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

        <Collapse in={newopen}>
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
                    <MenuItem value="gambiae">An. gambiae</MenuItem>
                    <MenuItem value="funestus">An. fenestus</MenuItem>
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
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
      // ... other props
      >
        <div>
          <Accordion
            expanded={expanded === "panel1"}
            onChange={handleChange("panel1")}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
            >
              <Typography sx={{ width: "33%", flexShrink: 0 }}>
                Species
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Mosquito species details
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{popoverContent?.notes}</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel2"}
            onChange={handleChange("panel2")}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2bh-content"
              id="panel2bh-header"
            >
              <Typography sx={{ width: "33%", flexShrink: 0 }}>
                Bionomics
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Ecological characteristics of species
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{popoverContent?.notes}</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel3"}
            onChange={handleChange("panel3")}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3bh-content"
              id="panel3bh-header"
            >
              <Typography sx={{ width: "33%", flexShrink: 0 }}>
                Site/Environment
              </Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Geographical and environmental data
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {popoverContent.geometry ? (
                  <>
                    Location: {popoverContent.geometry.layout}
                    Coordinates:{" "}
                    {popoverContent.geometry.flatCoordinates.join(", ")}
                  </>
                ) : (
                  <span>Loading or no data available...</span>
                )}
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={expanded === "panel4"}
            onChange={handleChange("panel4")}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel4bh-content"
              id="panel4bh-header"
            >
              <Typography sx={{ width: "33%", flexShrink: 0 }}>
                Period
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {popoverContent?.period_start && popoverContent?.period_end ? (
                  `Data collected from ${popoverContent.period_start} to ${popoverContent.period_end}.`
                ) : (
                  <span>Loading or no data available...</span>
                )}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </div>
      </Popover>

    </>
  );
}

export default Newmap;
