"use client";
import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
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
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Event from 'ol/events/Event';
import Popover from '@mui/material/Popover';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  geoServerBaseUrl,
  getBasemapOverlaysLayersArray,
} from "@/requests/requests";
import "./CSS/LayerSwitcherStyles.css";
import { Stroke, Fill, Style, Circle } from "ol/style";
function Newmap() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [popoverContent, setPopoverContent] = React.useState<{ [x: string]: any }>({});
  const open = Boolean(anchorEl);
  const id = open ? 'feature-popover' : undefined;
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

  const occurrenceSource = new VectorSource({
    format: new GeoJSON(),
    url:
      geoServerBaseUrl +
      "/geoserver/vector/ows?service=WFS&version=" +
      "1.0.0&request=GetFeature&typeName" +
      "=vector%3Aoccurrence&maxFeatures=50&outputFormat=application%2Fjson",
    strategy: bboxStrategy,
  });

  const fill = new Fill({
    color: 'rgba(2,2,2,1)',
  });
  const stroke = new Stroke({
    color: '#222',
    width: 1.25,
  });

  const occurrenceLayer = new VectorLayer({
    title: "Occurrence Layer",
    visible: false,
    preload: Infinity,
    source: occurrenceSource,
    style: new Style({
      image: new Circle({
        fill: fill,
        stroke: stroke,
        radius: 5,
      }),
      fill: fill,
      stroke: stroke,
    })
  } as BaseLayerOptions);

  const occurrenceGroup = new LayerGroup({
    title: "Occurrence",
    layers: [occurrenceLayer],
  } as GroupLayerOptions);

  useEffect(() => {
    getBasemapOverlaysLayersArray('basemaps').then((baseMapsArray) => {
      getBasemapOverlaysLayersArray('overlays').then((overlaysArray) => {
        const BaseMaps = new LayerGroup({
          title: "Base Maps",
          layers: baseMapsArray,
        } as GroupLayerOptions);

        const Overlays = new LayerGroup({
          title: "Overlays",
          layers: overlaysArray,
        } as GroupLayerOptions);

        if (BaseMaps) {
          if (Overlays) {
            const initialMap = new Map({
              target: "map-container",
              layers: [BaseMaps, Overlays, occurrenceGroup],
              view: new View({
                center: [0, 0],
                zoom: 4,
              }),
            });
            const layerSwitcher = new LayerSwitcher();
            initialMap.addControl(layerSwitcher);

            setMap(initialMap);
          }
        }
      });
    });

    const handleMapClick = (event: any) => {
      if (map) {
        map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
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
      }
    };


    const layerSwitcher = new LayerSwitcher();
    if (map) {
      map.addControl(layerSwitcher);
      map.on('singleclick', handleMapClick);
    }
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
