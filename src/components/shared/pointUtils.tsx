import React from "react";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Circle, Style, Fill, Stroke } from "ol/style";
import Control from "ol/control/Control";
import Map from "ol/Map";
import { Draw, Modify, Snap } from "ol/interaction.js";
import { Polygon, SimpleGeometry } from "ol/geom";
import { transform } from "ol/proj";
import { never } from "ol/events/condition";
import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";

let draw: Draw, snap: Snap, modify: Modify;

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
  });
  vector.set("area-select", true);

  return vector;
};

export const addAreaInteractions = (map: Map, selectedByArea: any) => {
  const areaSelect = map.getAllLayers().find((l) => l.get("area-select"));
  const source = areaSelect?.getSource() as VectorSource;
  // console.log("selectedByArea" + selectedByArea);

  modify = new Modify({ source: source });
  modify.on("modifyend", (e) => {
    const geom = e.features.item(0).getGeometry() as SimpleGeometry;
    const coords = geom?.getCoordinates();
    if (coords && coords.length > 0) {
      //   dispatch(
      //     updateAreaFilter(
      //       coords[0].map((c: Coordinate) =>
      //         transform(c, "EPSG:3857", "EPSG:4326")
      //       )
      //     )
      //   );
    }
  });
  map.addInteraction(modify);

  draw = new Draw({
    source: source,
    type: "Circle",
    freehandCondition: never,
  });
  draw.on("drawend", (e) => {
    const geom = e.feature.getGeometry() as SimpleGeometry;
    const coords = geom?.getCoordinates();
    if (coords && coords.length > 0) {
      console.log("Done...");
      //   dispatch(
      //     updateAreaFilter(
      //       coords[0].map((c: Coordinate) =>
      //         transform(c, "EPSG:3857", "EPSG:4326")
      //       )
      //     )
      //   );
    }
  });
  map.addInteraction(draw);
  snap = new Snap({ source: source });
  map.addInteraction(snap);
};

export const removeAreaInteractions = (map: Map) => {
  map.removeInteraction(modify);
  map.removeInteraction(draw);
  map.removeInteraction(snap);
};
