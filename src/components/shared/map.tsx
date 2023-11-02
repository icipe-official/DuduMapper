"use client";
import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import "ol/ol.css";
import "ol-ext/control/LayerSwitcher.css";
import LayerSwitcher from "ol-ext/control/LayerSwitcher";
import "./CSS/LayerSwitcherStyles.css";
import LayerGroup from "ol/layer/Group";
import SourceOSM from "ol/source/OSM";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import VectorTileSource from "ol/source/VectorTile";
import VectorTileLayer from "ol/layer/VectorTile";
import MVT from "ol/format/MVT";
import { BaseLayerOptions, GroupLayerOptions } from "ol-layerswitcher";

function Newmap() {
  const [map, setMap] = useState<Map | undefined>(); // Specify the type using a generic type argument
  const mapElement = useRef(null);
  const mapRef = useRef<Map | undefined>(undefined);
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

  const osm = new TileLayer({
    title: "OSM",
    type: "base",
    visible: true,
    source: new OSM(),
  } as BaseLayerOptions);

  const land = new VectorTileLayer({
    title: "Land",
    type: "base",
    visible: false,
    preload: Infinity,
    source: new VectorTileSource({
      maxZoom: 18,
      format: new MVT(),
      url:
        "http://4.221.32.87:8080/geoserver/gwc/service/tms/1.0.0/" +
        "basemap:land@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
    }),
    style: style_simple,
  } as BaseLayerOptions);

  const baseMaps = new LayerGroup({
    title: "BASE MAPS",
    layers: [land, osm],
  } as GroupLayerOptions);

  useEffect(() => {
    if (!mapElement.current) return;

    const initialMap = new Map({
      target: mapElement.current,
      layers: [baseMaps],
      view: new View({
        center: [0, 0],
        zoom: 4,
      }),
    });

    const layerSwitcher = new LayerSwitcher();
    initialMap.addControl(layerSwitcher);

    setMap(initialMap);
  }, []);

  return (
    <div
      style={{ height: "calc(100vh - 120px)" }}
      ref={mapElement}
      className="map-container"
    />
  );
}

export default Newmap;
