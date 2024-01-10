import { Draw, Modify, Snap } from "ol/interaction.js";
import SimpleGeometry from "ol/geom/SimpleGeometry";
import { never } from "ol/events/condition";
import VectorSource from "ol/source/Vector";
let draw: Draw, snap: Snap, modify: Modify;
import Map from "ol/Map";
import { Circle, Fill, Stroke, Style } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import { transform } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import LayerGroup from "ol/layer/Group";
import { BaseLayerOptions, GroupLayerOptions } from "ol-layerswitcher";

export const addAreaInteractions = (selectedByArea: any, map: Map) => {
  const areaSelect = map?.getAllLayers().find((l) => l.get("occurrence-data"));
  const source = areaSelect?.getSource() as VectorSource;

  draw = new Draw({
    source: source,
    type: selectedByArea,
    freehandCondition: never,
  });

  draw.on("drawend", (e) => {
    const geom = e.feature.getGeometry() as SimpleGeometry;
    const coords = geom?.getCoordinates();
    if (coords && coords.length > 0) {
      console.log("Coords ", coords);
      // dispatch(
      //   updateAreaFilter(
      //     coords[0].map((c: Coordinate) =>
      //       transform(c, 'EPSG:3857', 'EPSG:4326')
      //     )
      //   )
      // );
    }
  });
  map?.addInteraction(draw);
  snap = new Snap({ source: source });
  map?.addInteraction(snap);
};

export const removeAreaInteractions = (map: Map) => {
  map.removeInteraction(modify);
  map.removeInteraction(draw);
  map.removeInteraction(snap);
};

export const buildAreaSelectionLayer = () => {
  const source = new VectorSource();
  const vector = new VectorLayer({
    source: source,
    style: () => {
      return new Style({
        fill: new Fill({ color: "rgba(255, 255, 255, 0.2)" }),
        stroke: new Stroke({
          color: "#ffcc33",
          width: 2,
        }),
        image: new Circle({
          radius: 7,
          fill: new Fill({
            color: "#ffcc33",
          }),
        }),
      });
    },
  } as BaseLayerOptions);
  vector.set("area-select", true);

  const vectorGroup = new LayerGroup({
    title: "Draw Layer",
    layers: [vector],
  } as GroupLayerOptions);

  return vectorGroup;
};

export const updateSelectedPolygons = (map: Map, areaCoordinates: any) => {
  // clear out old polygons
  const areaSelectLayer = map.getAllLayers().find((l) => l.get("area-select"));
  const source = areaSelectLayer?.getSource();
  (source as VectorSource)
    .getFeatures()
    .forEach((f) => (source as VectorSource).removeFeature(f));

  // draw the new one if it exists
  if (areaCoordinates.value.length > 0) {
    const coordinates = areaCoordinates.value.map((c: Coordinate) =>
      transform(c, "EPSG:4326", "EPSG:3857")
    );
    const polygon = new Polygon([coordinates]);
    (source as VectorSource).addFeature(new Feature({ geometry: polygon }));
  }
};
