"use client"
import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import "./CSS/LayerSwitcherStyles.css";
import LayerGroup from "ol/layer/Group";
import SourceOSM from "ol/source/OSM";
import OSM from "ol/source/OSM";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import VectorTileSource from "ol/source/VectorTile";
import VectorTileLayer from "ol/layer/VectorTile";
import MVT from "ol/format/MVT";
import { BaseLayerOptions, GroupLayerOptions } from "ol-layerswitcher";
import "ol/ol.css";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import { bbox as bboxStrategy } from "ol/loadingstrategy.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import { geoServerBaseUrl } from "@/requests/requests";
import { Pixel } from "ol/pixel";
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Event from 'ol/events/Event';
import Popover from '@mui/material/Popover';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';



function Newmap() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [popoverContent, setPopoverContent] = React.useState<{ [x: string]: any }>({});
  const open = Boolean(anchorEl);
  const id = open ? 'feature-popover' : undefined;
  console.log("geoServerBaseUrl: " + geoServerBaseUrl);
  const [map, setMap] = useState<Map | undefined>(); // Specify the type using a generic type argument
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | undefined>(undefined);
  const [expanded, setExpanded] = React.useState<string | false>(false);

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

  var style_simple = new Style({
    fill: new Fill({
      color: "#e1e1e1",
    }),
    stroke: new Stroke({
      color: "#f6f6f6",
      width: 1,
    }),
  });

  var siteStyle = new Style({
    fill: new Fill({
      color: "#db1e2a",
    }),
    stroke: new Stroke({
      color: "#fafafa",
      width: 1,
    }),
  });

  var occurrenceStyle = new Style({
    fill: new Fill({
      color: "#ff9e17",
    }),
    stroke: new Stroke({
      color: "#fafafa",
      width: 1,
    }),
  });

  var style_borders = new Style({
    stroke: new Stroke({
      color: "#fafafa",
      width: 2,
    }),
  });

  var style_water = new Style({
    fill: new Fill({
      color: "#87CEEB",
    }),
    stroke: new Stroke({
      color: "#87CEEB",
      width: 1,
    }),
  });

  const osm = new TileLayer({
    title: "OSM",
    type: "base",
    visible: false,
    source: new OSM(),
  } as BaseLayerOptions);

  const land = new VectorTileLayer({
    title: "Land",
    type: "base",
    visible: true,
    preload: Infinity,
    source: new VectorTileSource({
      maxZoom: 18,
      format: new MVT(),
      url:
        geoServerBaseUrl +
        "/geoserver/gwc/service/tms/1.0.0/" +
        "basemap:land@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
    }),
    style: style_simple,
  } as BaseLayerOptions);

  var glaciated_areas = new VectorTileLayer({
    title: "Glaciated Areas",
    visible: true,
    preload: Infinity,
    source: new VectorTileSource({
      maxZoom: 18,
      format: new MVT(),
      url:
        geoServerBaseUrl +
        "/geoserver/gwc/service/tms/1.0.0/" +
        "basemap:glaciated_areas@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
    }),
  } as BaseLayerOptions);

  const Oceans = new VectorTileLayer({
    title: "Ocean",
    type: "base",
    visible: true,
    preload: Infinity,
    source: new VectorTileSource({
      maxZoom: 18,
      format: new MVT(),
      url:
        geoServerBaseUrl +
        "/geoserver/gwc/service/tms/1.0.0/" +
        "basemap:ocean@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
    }),
    style: style_water,
  } as BaseLayerOptions);

  const Lakes = new VectorTileLayer({
    title: "Lakes",
    type: "base",
    visible: true,
    preload: Infinity,
    source: new VectorTileSource({
      maxZoom: 18,
      format: new MVT(),
      url:
        geoServerBaseUrl +
        "/geoserver/gwc/service/tms/1.0.0/" +
        "basemap:lakes@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
    }),
    style: style_water,
  } as BaseLayerOptions);

  const countries_boundary_lines = new VectorTileLayer({
    title: "Country Borders",
    type: "base",
    visible: true,
    preload: Infinity,
    source: new VectorTileSource({
      maxZoom: 18,
      format: new MVT(),
      url:
        geoServerBaseUrl +
        "/geoserver/gwc/service/tms/1.0.0/" +
        "basemap:countries_boundary_lines@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
    }),
    style: style_borders,
  } as BaseLayerOptions);

  const antarctic_ice_shelves = new VectorTileLayer({
    title: "Antarctic Ice Shelves",
    type: "base",
    visible: true,
    preload: Infinity,
    source: new VectorTileSource({
      maxZoom: 18,
      format: new MVT(),
      url:
        geoServerBaseUrl +
        "/geoserver/gwc/service/tms/1.0.0/" +
        "basemap:antarctic_ice_shelves@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
    }),
    style: style_water,
  } as BaseLayerOptions);

  const rivers_lake_centerlines = new VectorTileLayer({
    title: "Rivers Lake Centerlines",
    type: "base",
    visible: true,
    preload: Infinity,
    source: new VectorTileSource({
      maxZoom: 18,
      format: new MVT(),
      url:
        geoServerBaseUrl +
        "/geoserver/gwc/service/tms/1.0.0/" +
        "basemap:rivers_lake_centerlines@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
    }),
    style: style_water,
  } as BaseLayerOptions);

  const coastline = new VectorTileLayer({
    title: "Coastline",
    type: "base",
    visible: true,
    preload: Infinity,
    source: new VectorTileSource({
      maxZoom: 18,
      format: new MVT(),
      url:
        geoServerBaseUrl +
        "/geoserver/gwc/service/tms/1.0.0/" +
        "basemap:coastline@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
    }),
    style: style_water,
  } as BaseLayerOptions);

  const populated_places = new VectorTileLayer({
    title: "Populated Places",
    type: "base",
    visible: false,
    preload: Infinity,
    source: new VectorTileSource({
      maxZoom: 18,
      format: new MVT(),
      url:
        geoServerBaseUrl +
        "/geoserver/gwc/service/tms/1.0.0/" +
        "basemap:populated_places@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
    }),
  } as BaseLayerOptions);

  const vectorSource = new VectorSource({
    format: new GeoJSON(),
    url:
      geoServerBaseUrl +
      "/geoserver/vector/ows?service=WFS&version=1.0.0&" +
      "request=GetFeature&typeName=vector%3Aoccurrence&maxFeatures=50&" +
      "outputFormat=application%2Fjson",
    strategy: bboxStrategy,
  });

  const occurrenceSource = new VectorSource({
    format: new GeoJSON(),
    url:
      geoServerBaseUrl +
      "/geoserver/vector/ows?service=WFS&version=" +
      "1.0.0&request=GetFeature&typeName" +
      "=vector%3Aoccurrence&maxFeatures=50&outputFormat=application%2Fjson",
    strategy: bboxStrategy,
  });

  const siteLayer = new VectorLayer({
    title: "Site",
    visible: false,
    preload: Infinity,
    source: vectorSource,
    // style: siteStyle,
  } as BaseLayerOptions);

  const occurrenceLayer = new VectorLayer({
    title: "Occurrence",
    visible: false,
    preload: Infinity,
    source: occurrenceSource,
    // style: occurrenceStyle,
  } as BaseLayerOptions);

  const baseMaps = new LayerGroup({
    title: "BASE MAPS",
    layers: [
      Oceans,
      land,
      glaciated_areas,
      antarctic_ice_shelves,
      Lakes,
      countries_boundary_lines,
      rivers_lake_centerlines,
      coastline,
      populated_places,
      osm,
    ],
  } as GroupLayerOptions);

  const Overlays = new LayerGroup({
    title: "OVERLAYS",
    layers: [glaciated_areas],
  } as GroupLayerOptions);

  const occurrenceGroup = new LayerGroup({
    title: "Occurence",
    layers: [siteLayer, occurrenceLayer],
  } as GroupLayerOptions);

  useEffect(() => {
    if (!mapElement.current) return;

    const initialMap = new Map({
      target: mapElement.current,
      layers: [baseMaps, Overlays, occurrenceGroup],
      view: new View({
        center: [0, 0],
        zoom: 4,
      }),
    });


    const handleMapClick = (event: any) => {
      initialMap.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
        if (layer === occurrenceLayer) {
          // Create a reference to the dummy HTML element for Popover anchor
          const dummyAnchor = document.createElement('div');
          dummyAnchor.style.position = 'absolute';

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
      });
    };


    const layerSwitcher = new LayerSwitcher();
    initialMap.addControl(layerSwitcher);



    initialMap.on('singleclick', handleMapClick);
    setMap(initialMap);
  }, []);

  return (
    <>
      <div
        style={{ height: "calc(100vh - 120px)" }}
        ref={mapElement}
        className="map-container"
        id="map-container"
      >
      </div>



      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
      // ... other props
      >

        <div>
          <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1bh-content"
              id="panel1bh-header"
            >
              <Typography sx={{ width: '33%', flexShrink: 0 }}>
                Species
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>Mosquito species details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {popoverContent?.notes}
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2bh-content"
              id="panel2bh-header"
            >
              <Typography sx={{ width: '33%', flexShrink: 0 }}>Bionomics</Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Ecological characteristics of species
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {popoverContent?.notes}
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3bh-content"
              id="panel3bh-header"
            >
              <Typography sx={{ width: '33%', flexShrink: 0 }}>
                Site/Environment
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Geographical and environmental data
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {popoverContent.geometry ? (
                  <>
                    Location: {popoverContent.geometry.layout}
                    Coordinates: {popoverContent.geometry.flatCoordinates.join(', ')}
                  </>
                ) : (
                  <span>Loading or no data available...</span>
                )}
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel4bh-content"
              id="panel4bh-header"
            >
              <Typography sx={{ width: '33%', flexShrink: 0 }}>
                Period
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {popoverContent?.start_month && popoverContent?.start_year && popoverContent?.end_month && popoverContent?.end_year ? (
                  `Data collected from ${popoverContent.start_month}/${popoverContent.start_year} to ${popoverContent.end_month}/${popoverContent.end_year}.`
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
