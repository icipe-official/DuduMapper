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
import {
  geoServerBaseUrl,
  getBasemapOverlaysLayersArray,
} from "@/requests/requests";
import "./CSS/LayerSwitcherStyles.css";

function Newmap() {
  const [map, setMap] = useState<Map | undefined>(); // Specify the type using a generic type argument
  const mapElement = useRef(null);
  const mapRef = useRef<Map | undefined>(undefined);
  mapRef.current = map;

  const osm = new TileLayer({
    title: "OSM",
    type: "base",
    visible: false,
    source: new OSM(),
  } as BaseLayerOptions);

  const occurrenceSource = new VectorSource({
    format: new GeoJSON(),
    url:
      geoServerBaseUrl +
      "/geoserver/vector/ows?service=WFS&version=" +
      "1.0.0&request=GetFeature&typeName" +
      "=vector%3Aoccurrence&maxFeatures=50&outputFormat=application%2Fjson",
    strategy: bboxStrategy,
  });

  const occurrenceLayer = new VectorLayer({
    title: "Occurrence Layer",
    visible: false,
    preload: Infinity,
    source: occurrenceSource,
    // style: occurrenceStyle,
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
  }, []);

  return (
    <div
      style={{ height: "calc(100vh - 120px)" }}
      ref={mapElement}
      id="map-container"
    />
  );
}

export default Newmap;
