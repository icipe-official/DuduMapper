"use client";
import Feature from 'ol/Feature';
import { Cluster, Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Circle as CircleStyle, Fill, Stroke, Style, Text, Icon } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON.js';

import { bbox as bboxStrategy } from "ol/loadingstrategy.js";
import { BaseLayerOptions, GroupLayerOptions } from "ol-layerswitcher";
import { geoServerBaseUrl } from '@/requests/requests';
const occurrenceSource = new VectorSource({
  format: new GeoJSON(),
  url:
    geoServerBaseUrl +
    "/geoserver/vector/ows?service=WFS&version=" +
    "1.0.0&request=GetFeature&typeName" +
    "=vector%3Aoccurrence&maxFeatures=50&outputFormat=application%2Fjson",
  strategy: bboxStrategy,
});

const mosquitoIcon = new Icon({
  src: 'mosquitoIcon',
});
const clusteredLayer = new VectorLayer({
  title: "Clustered Occurrence Layer",
  visible: true, // Set to false if you want to start with this layer hidden
  source: new Cluster({
    distance: 40, // Adjust the clustering distance as needed
    source: new VectorSource({
      url: 'data/geojson/your_data.json', // Replace with your data source
      format: new GeoJSON(), // Use the appropriate format for your data
    }),
  }),
  style: function(feature: Feature) {
    const size = feature.get('features').length;
    if (size > 1) {
      return new Style({
        image: new CircleStyle({
          radius: 10, // Fixed radius for all clusters
          stroke: new Stroke({
            color: '#fff',
          }),
          fill: new Fill({
            color: '#3399CC',
          }),
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff',
          }),
        }),
      });
    }
    return new Style({
      geometry: feature.getGeometry,
      image: mosquitoIcon
    })
  },
} as BaseLayerOptions);

export default clusteredLayer;
