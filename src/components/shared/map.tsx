"use client";
import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
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
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON.js";
import { bbox as bboxStrategy } from "ol/loadingstrategy.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import {
  basemapLayers,
  geoServerBaseUrl,
  getBasemapLayersArray,
  overlays,
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

  const Overlays = new LayerGroup({
    title: "Overlays",
    layers: [glaciated_areas],
  } as GroupLayerOptions);

  const occurrenceGroup = new LayerGroup({
    title: "Occurrence",
    layers: [siteLayer, occurrenceLayer],
  } as GroupLayerOptions);

  useEffect(() => {
    let BaseMaps;
    getBasemapLayersArray().then((baseMapPromise) => {
      BaseMaps = new LayerGroup({
        title: "Base Maps",
        layers: baseMapPromise,
      } as GroupLayerOptions);

      if (BaseMaps) {
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
