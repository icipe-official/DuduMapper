"use client";
import React, {useEffect, useRef, useState} from "react";
import {Map, View} from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import LayerGroup from "ol/layer/Group";
import {BaseLayerOptions, GroupLayerOptions} from "ol-layerswitcher";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import {bbox as bboxStrategy} from "ol/loadingstrategy.js";
import {Vector as VectorLayer} from "ol/layer.js";
import {
    geoServerBaseUrl,
    getBasemapOverlaysLayersArray,
} from "@/api/requests";
import {Stroke, Fill, Style, Circle} from "ol/style";
import "../shared/CSS/LayerSwitcherStyles.css";
import OccurrencePopup from "../popup/OccurrenceDrawer";
import FilterSection from "../filters/filtersection";
import {IconButton, Tooltip} from "@mui/material";
import "../filters/filterSectionStyles.css";
import "../filters/filter_section_dev.css";
import TuneIcon from "@mui/icons-material/Tune";
import {QueryClient, QueryClientProvider, useQuery, useQueryClient} from "@tanstack/react-query";
import OccurrenceFilter from "@/components/filters/OccurrenceFilter";
import TimeSlider from "@/components/filters/TimeSlider";
import OpenFilterButton from "@/components/filters/OpenFilterButton";
import { features } from "process";

const queryClient = new QueryClient();

const OCCURRENCE_API = `${geoServerBaseUrl}/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector:occurrence&maxFeatures=10000&outputFormat=application/json`;
const getOccurrences = async (queryKey) => {
    console.log(queryKey[1])
    const params: string = queryKey[1]
    if (params) {
        console.log('Filtering occurrence on: ', params)
        const url = `${OCCURRENCE_API}&cql_filter=${params}`;
        console.log(url)
        const response = await fetch(url)
        return response.json();
    }
    console.log('Loading all occurrence')
    const response = await fetch(`${OCCURRENCE_API}`)
    return response.json();
}

function Newmap() {
    const queryClient = useQueryClient();
    const mapRef = useRef<Map>()
    const [popoverContent, setPopoverContent] = React.useState<{
        [x: string]: any;
    }>({});
    const [map, setMap] = useState<Map | undefined>(); // Specify the type using a generic type argument
    const mapElement = useRef<HTMLDivElement>(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [showOccurrencePopup, setShowOccurrencePopup] = useState(false);
    const [filterConditionsObj, setFilterConditionsObj] = useState({})
    const [cqlFilter, setCqlFilter] = useState(null)
    const [selectedSpecies, setSelectedSpecies] = useState([])
    const [occurrences, setOccurrences] = useState<any[]>([]);

    const [speciesColors, setSpeciesColors] = useState<string[]>([
        '#dc267f',
        '#648fff',
        '#785ef0',
        '#fe6100',
        '#ffb000',
        '#000000',
        '#ffffff',
      ]);
    

    const [occurrenceSource, setOccurrenceSource] = useState(
        new VectorSource({
            format: new GeoJSON(),
            features: [],
            strategy: bboxStrategy,
        })
    );

    const {
        status,
        data: occurrenceData,
        isError,
        error,
        isFetching,
    } = useQuery({
        queryKey: ["occurrences", cqlFilter], //Example CQl filter species IN ('gambie', 'finiestus', 'fini') AND WITHIN (the_geom, MULTIPOLYGON((22,22,223,223))) AND adult =true AND season=dry
        //queryFn: getOccurrences
        queryFn: ({queryKey}) => getOccurrences(queryKey)
    });

    // creating feature array
   const featureArray = occurrenceData?.features || [];
   console.log('featureArray',featureArray)

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


    useEffect(() => {
        if (Object.keys(filterConditionsObj).length === 0) {
            return;
        }
        //join the filter conditions into one string using the AND CQL clause conditions and add the date filter
        let filterConditions: string [] = Object.values(filterConditionsObj)
        filterConditions = filterConditions.filter(c => c)
        const cql_filter = filterConditions.join(' AND ');
        setCqlFilter(cql_filter)
    }, [filterConditionsObj]);

    const updateFilterConditions = (conditions: {}) => {
        setFilterConditionsObj({
                ...filterConditionsObj,
                species: conditions['species'] ,
                country: conditions['country']
            }
        )
    }

    const handleSelectedSpecies = (selectedSpecies: any) => {
        setSelectedSpecies(selectedSpecies);
      };

    const handleTimeChange = (startYear: number, endYear: number) => {
        const condition = `start_year >= ${startYear} AND end_year <= ${endYear} `
        setFilterConditionsObj({
                ...filterConditionsObj,
                period: condition
            }
        )
    };

    if (isFetching) {
        console.log('Loading occurrences...') //Implement a progress bar as Toast
    }
    if (isError) {
        console.log('Error', error) //TODO implement Toast
    }

    if (status === 'success') {
        const total = occurrenceData['totalFeatures']
        const returned = occurrenceData['numberReturned']
        console.log(`${returned} out of ${total} features`)

        occurrenceSource?.clear()
        occurrenceSource?.addFeatures(
            new GeoJSON().readFeatures(responseToGEOJSON(featureArray),
                {
                    featureProjection: 'EPSG:3857'
                })
        )
        
        // setOccurrences(featureArray)
    }
    

    const fill = new Fill({
        color: "rgba(2,255,2,1)",
    });
    const stroke = new Stroke({
        color: "#222",
        width: 1.25,
    });

    const colorArray = [
        '#648fff',
        '#785ef0',
        '#fe6100',
        '#ffb000',
        '#000000',
        '#ffffff',
        '#dc267f',
      ];
  
    const occurrenceLayer = new VectorLayer({
        title: "Occurrence Layer",
        visible: true,
        preload: Infinity,
        source: occurrenceSource,
        style: new Style({
            image: new Circle({
                fill: fill,
                stroke: stroke,
                radius: 8,
            }),
            fill: fill,
            stroke: stroke,
        }),
    } as BaseLayerOptions);
    occurrenceLayer.set('occurrence-data', true);

    // const occurrenceGroup = new LayerGroup({
    //     title: "Occurrence",
    //     layers: [occurrenceLayer],
    // } as GroupLayerOptions);

    const handleClosePopup = () => {
        setShowOccurrencePopup(false);
    };


    useEffect(() => {
        getBasemapOverlaysLayersArray("basemaps").then((baseMapsArray) => {
            getBasemapOverlaysLayersArray("overlays").then((overlaysArray) => {
                const BaseMaps = new LayerGroup({
                    title: "Basemaps",
                    layers: baseMapsArray,
                } as GroupLayerOptions);

                const Overlays = new LayerGroup({
                    title: "Labels",
                    layers: overlaysArray,
                } as GroupLayerOptions);

                if (BaseMaps) {
                    if (Overlays) {
                        const initialMap = new Map({
                            target: "map-container",
                            layers: [BaseMaps, Overlays, occurrenceLayer],
                            view: new View({
                                center: [0, 0],
                                zoom: 4,
                            }),
                        });
                        const layerSwitcher = new LayerSwitcher();
                        initialMap.addControl(layerSwitcher);
                        initialMap.on("singleclick", handleMapClick);
                        mapRef.current = initialMap;
                        setMap(initialMap);
                    }
                }
            });
        });
    }, []);

    const handleMapClick = (event: any) => {
        console.log("Map single click triggered");
        mapRef.current?.forEachFeatureAtPixel(
            event.pixel,
            (feature, layer) => {
                if (layer === occurrenceLayer) {
                    console.log("Point clicked");

                    setPopoverContent(feature.getProperties());
                    setShowOccurrencePopup(true);
                    // Return true to stop the forEach loop if needed
                    return true;
                }
            }
        );
    };

    useEffect(() => {
        console.log('use inarun')

        const defaultStyle = new Style({
            image: new Circle({
                fill: fill,
                stroke: stroke,
                radius: 8,
            }),
            fill: fill,
            stroke: stroke,
        })

        const getFeatureStyle = (feature: any) => {
            const species = feature.getProperties().species;
            const speciesIndex = selectedSpecies.indexOf(species);


            if (speciesIndex !== -1) {
                if (speciesIndex < speciesColors.length) {
                    // If the species is selected and color exists in the array, use it
                    return new Style({
                        image: new Circle({
                            radius: 8,
                            stroke: new Stroke({
                                color: 'black',
                                width: 1.25,
                            }),
                            fill: new Fill({
                                color: speciesColors[speciesIndex],
                            }),
                        }),
                    });
                } else {
                    // If the species is selected but exceeds color array length, add a new color to the array
                    const newColor = getRandomColor();
                    setSpeciesColors((prevColors) => [...prevColors, newColor]);
                    return new Style({
                        image: new Circle({
                            radius: 8,
                            stroke: new Stroke({
                                color: 'black',
                                width: 1.25,
                            }),
                            fill: new Fill({
                                color: newColor,
                            }),
                        }),
                    });
                }
            }

            // Default style for unselected species
            return defaultStyle;
        };

        const getRandomColor = () => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);

            return `rgb(${r},${g},${b})`;
        };

        const filteredData = occurrenceData?.features.filter((feature): feature is { properties: { species: string } } => {
            const species = feature.properties.species.trim(); // Assuming species is a string
            return species && selectedSpecies.includes(species);
        }) || [];

        console.log('filtered species', filteredData)

        const existingOccurrenceLayer = map?.getLayers().getArray().find((layer) => {
            return layer.get('occurrence-data') === true;
        });


        if (existingOccurrenceLayer && existingOccurrenceLayer instanceof VectorLayer) {
            const occurrenceSource = existingOccurrenceLayer.getSource();

            const existingLegendControl = map?.getControls().getArray().find(control => control.get('name') === 'legend');
            if (existingLegendControl) {
                map?.removeControl(existingLegendControl);
            }

            if (selectedSpecies.length === 0) {
                // If no species selected, show the original data with default style
                occurrenceSource.clear();
                occurrenceSource.addFeatures(new GeoJSON().readFeatures(responseToGEOJSON(featureArray), {
                    featureProjection: 'EPSG:3857',
                }).map(feature => {
                    feature.setStyle(defaultStyle);
                    return feature;
                }));
            } else {
                // Update the occurrence source with the filtered features and apply styles
                occurrenceSource.clear();
                const filteredData = occurrenceData?.features.filter((feature): feature is { properties: { species: string } } => {
                    const species = feature.properties.species.trim(); // Assuming species is a string
                    return species && selectedSpecies.includes(species);
                }) || [];

                console.log('Filtered Features:', filteredData);

                occurrenceSource.clear();
                occurrenceSource.addFeatures(new GeoJSON().readFeatures(responseToGEOJSON(filteredData), {
                    featureProjection: 'EPSG:3857',
                }).map(feature => {
                    feature.setStyle(getFeatureStyle(feature));
                    return feature;
                }));
            }

            // Refresh the map
            map?.render();
        }

        const createLegendDiv = () => {
            const legendContainer = document.createElement('div');
            legendContainer.className = 'legend-container';
            legendContainer.style.position = 'absolute';
            legendContainer.style.bottom = '16px';
            legendContainer.style.right = '16px';
            legendContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            legendContainer.style.padding = '8px';
            legendContainer.style.border = '1px solid #ccc';
            legendContainer.style.borderRadius = '5px';

            const legendTitle = document.createElement('div');
            legendTitle.style.textDecoration = 'underline';
            legendTitle.style.fontWeight = 'bold';
            legendTitle.textContent = 'Legend';

            legendContainer.appendChild(legendTitle);

            selectedSpecies.forEach((species, index) => {
                const legendItem = document.createElement('div');
                legendItem.style.fontStyle = 'italic';
                legendItem.style.fontWeight = 'bold';
                legendItem.style.color = speciesColors[index];
                legendItem.textContent = `an. ${species}`;

                legendContainer.appendChild(legendItem);
            });

            return legendContainer;
        };

        const legendDiv = createLegendDiv();
        document.body.appendChild(legendDiv);
        // Set the occurrenceSource state with initial features


        return () => {
            if (document.body.contains(legendDiv)) {
                document.body.removeChild(legendDiv);
              }
        };

    }, [selectedSpecies])

    return (
        <div style={{display: 'flex', height: 'calc(100vh - 70px)'}}>
            <div
                style={{flexGrow: 1, width: showOccurrencePopup ? '70%' : '100%'}}
                ref={mapElement}
                className="map-container"
                id="map-container"
            >
                <div className="filter-dev-button">
                    <OpenFilterButton filterOpen={filterOpen} onClick={() => setFilterOpen(!filterOpen)}/>
                </div>
                <div>
                    {filterOpen &&
                        <OccurrenceFilter open={filterOpen} handleFilterConditions={updateFilterConditions}
                                        handleSelectedSpecies={handleSelectedSpecies}/>}

                </div>
            </div>

            {showOccurrencePopup && (
                <OccurrencePopup
                    id={'feature_popover'}
                    handleClose={handleClosePopup}
                    popoverContent={popoverContent}
                />
            )}
            <div>
                <TimeSlider onChange={handleTimeChange}/>
            </div>

        </div>
    );
}

export default Newmap;
