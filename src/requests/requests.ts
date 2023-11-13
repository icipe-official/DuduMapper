import WMSCapabilities from "ol/format/WMSCapabilities";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import { BaseLayerOptions, GroupLayerOptions } from "ol-layerswitcher";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Style from "ol/style/Style";
import LayerGroup from "ol/layer/Group";

export const geoServerBaseUrl =
  process.env.NEXT_PUBLIC_GEOSERVER_URL?.trim().replace(/['"]/g, "");
export const overlaysLayergroup_in_geoserver =
  process.env.NEXT_PUBLIC_OVERLAYS_LAYER_GROUP;
export const basemapLayergroup_in_geoserver =
  process.env.NEXT_PUBLIC_BASEMAP_LAYER_GROUP;
export const geoserverWorkspace = process.env.NEXT_PUBLIC_SELECTED_WORKSPACE;

function appendPath(baseURL: string, path: string): string {
  if (baseURL.endsWith("/geoserver")) {
    // Remove '/geoserver' from the end
    baseURL = baseURL.substring(0, baseURL.length - 10);
  }
  return `${baseURL}${path}`;
}

async function fetchXML(url: RequestInfo | URL) {
  try {
    const response = await fetch(url, { credentials: "omit" });

    if (!response.ok) {
      console.error(
        `Failed to fetch capabilities from ${url}. Status: ${response.status} ${response.statusText}`
      );
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    return null;
  }
}

async function getWMSCapabilities() {
  if (typeof geoServerBaseUrl !== "string") {
    console.error(
      "GeoServer base URL is not defined or not a string. Check your config settings."
    );
    return null; // Return a default value or null
  }

  const xmlData = await fetchXML(
    appendPath(
      geoServerBaseUrl,
      "/geoserver/ows?service=WMS&version=1.3.0&request=GetCapabilities"
    )
  );

  if (!xmlData) {
    console.error("Failed to fetch WMS capabilities.");
    return null; // Return a default value or null
  }

  const parser = new WMSCapabilities();
  return parser.read(xmlData);
}

async function getWMTSCapabilities() {
  if (typeof geoServerBaseUrl !== "string") {
    console.error(
      "GeoServer base URL is not defined or not a string. Check your config settings."
    );
    return null; // Return a default value or null
  }

  const xmlData = await fetchXML(
    appendPath(
      geoServerBaseUrl,
      "/geoserver/gwc/service/wmts?service=WMTS&version=1.1.1&request=GetCapabilities"
    )
  );

  if (!xmlData) {
    console.error("Failed to fetch WMTS capabilities.");
    return null; // Return a default value or null
  }

  const parser = new WMTSCapabilities();
  return parser.read(xmlData);
}

async function extractLayersFromLayerGroup(
  wmsCapabilitiesData: any,
  layerGroupName: String
) {
  const layers = [];

  // Assuming wmsCapabilitiesData is a parsed object and not raw XML string
  if (
    wmsCapabilitiesData &&
    wmsCapabilitiesData.Capability &&
    wmsCapabilitiesData.Capability.Layer &&
    wmsCapabilitiesData.Capability.Layer.Layer
  ) {
    const topLevelLayers = wmsCapabilitiesData.Capability.Layer.Layer;

    for (let i = 0; i < topLevelLayers.length; i++) {
      const topLevelLayer = topLevelLayers[i];

      // Checking if the layer name matches the specified layer group name
      if (topLevelLayer.Name === layerGroupName && topLevelLayer.Layer) {
        const nestedLayers = topLevelLayer.Layer;

        for (let j = 0; j < nestedLayers.length; j++) {
          const nestedLayer = nestedLayers[j];
          layers.push({
            name: nestedLayer.Name,
            displayName: nestedLayer.Title,
            styleObject: nestedLayer.Style,
          });
        }
      }
    }
  }

  return layers;
}

const geoServerData = (async () => {
  return await getWMSCapabilities();
})();

export const overlays = (async () => {
  if (typeof overlaysLayergroup_in_geoserver !== "string") {
    console.error("overlaysLayergroup_in_geoserver must be a string");
    return null;
  }
  return await extractLayersFromLayerGroup(
    await geoServerData,
    overlaysLayergroup_in_geoserver
  );
})();

export const basemapLayers = (async () => {
  if (typeof basemapLayergroup_in_geoserver !== "string") {
    console.error("overlaysLayergroup_in_geoserver must be a string");
    return null;
  }
  return await extractLayersFromLayerGroup(
    await geoServerData,
    basemapLayergroup_in_geoserver
  );
})();

const getTileStyle = (layerName: string) => {
  let style;

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

  if (layerName) {
    if (
      layerName === "Coastline" ||
      layerName === "Ocean" ||
      layerName === "Antarctic Ice Shelves" ||
      layerName === "glaciated_areas" ||
      layerName === "Lakes" ||
      layerName === "Rivers" ||
      layerName === "Places"
    ) {
      style = style_water;
    }

    if (layerName === "Land") {
      style = style_simple;
    }
    if (layerName === "Country Boundaries") {
      style = style_borders;
    }
  }

  return style;
};

export const getBasemapLayersArray = async () => {
  try {
    // Directly await the Promise
    const layers = await basemapLayers;

    if (layers) {
      const layerLen = layers.length;
      let i;
      let basemapArrays = [];

      for (i = 0; i < layerLen; i++) {
        let layerName = layers[i].name;
        let displayName = layers[i].displayName;

        let tileStyle = getTileStyle(layerName);

        let theBasemapTile = new VectorTileLayer({
          title: displayName,
          type: "base",
          visible: true,
          preload: Infinity,
          source: new VectorTileSource({
            maxZoom: 18,
            format: new MVT(),
            url:
              geoServerBaseUrl +
              "/geoserver/gwc/service/tms/1.0.0/" +
              layerName +
              "@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf",
          }),
          style: tileStyle,
        } as BaseLayerOptions);

        basemapArrays.push(theBasemapTile);
        // console.log(basemapArrays);
      }
      return basemapArrays;
    }
  } catch (error) {
    console.error("Failed to load basemapLayers:", error);
    return null;
  }
};
