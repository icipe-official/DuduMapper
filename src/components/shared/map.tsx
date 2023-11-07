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
        "http://4.221.32.87:8080/geoserver/gwc/service/tms/1.0.0/" +
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
        "http://4.221.32.87:8080/geoserver/gwc/service/tms/1.0.0/" +
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
        "http://4.221.32.87:8080/geoserver/gwc/service/tms/1.0.0/" +
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
        "http://4.221.32.87:8080/geoserver/gwc/service/tms/1.0.0/" +
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
        "http://4.221.32.87:8080/geoserver/gwc/service/tms/1.0.0/" +
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
        "http://4.221.32.87:8080/geoserver/gwc/service/tms/1.0.0/" +
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
        "http://4.221.32.87:8080/geoserver/gwc/service/tms/1.0.0/" +
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
        "http://4.221.32.87:8080/geoserver/gwc/service/tms/1.0.0/" +
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
        "http://4.221.32.87:8080/geoserver/gwc/service/tms/1.0.0/" +
        "basemap:populated_places@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
    }),
  } as BaseLayerOptions);

  const vectorSource = new VectorSource({
    format: new GeoJSON(),
    url:
      "http://4.221.32.87:8080/geoserver/vector/ows?service=WFS&version=1.0.0&" +
      "request=GetFeature&typeName=vector%3Aoccurrence&maxFeatures=50&" +
      "outputFormat=application%2Fjson",
    strategy: bboxStrategy,
  });

  const occurrenceSource = new VectorSource({
    format: new GeoJSON(),
    url:
      "http://4.221.32.87:8080/geoserver/vector/ows?service=WFS&version=" +
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
