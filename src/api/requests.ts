import WMSCapabilities from "ol/format/WMSCapabilities";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import { BaseLayerOptions} from "ol-layerswitcher";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Style from "ol/style/Style";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS.js";
import WMTSTileGrid from "ol/tilegrid/WMTS.js";
import { get as getProjection } from "ol/proj.js";
import { getTopLeft, getWidth } from "ol/extent.js";

let projection: any = null;

const maybeProjection = getProjection("EPSG:900913");

if (maybeProjection) {
  projection = maybeProjection;
}

const projectionExtent = projection.getExtent();
const size = getWidth(projectionExtent) / 256;
const resolutions = new Array(19);

const matrixIds = new Array(19);
for (let z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = `EPSG:900913:${z}`;
}

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

const getTileStyle = (displayName: string) => {
  let style;

  const style_simple = new Style({
    fill: new Fill({
      color: "#e1e1e1",
    }),
    stroke: new Stroke({
      color: "#f6f6f6",
      width: 1,
    }),
  });

  const style_borders = new Style({
    stroke: new Stroke({
      color: "#999999",
      width: 2,
    }),
  });

  const style_water = new Style({
    fill: new Fill({
      color: "#87CEEB",
    }),
    stroke: new Stroke({
      color: "#87CEEB",
      width: 1,
    }),
  });

  if (displayName) {
    if (
      displayName === "Coastline" ||
      displayName === "Ocean" ||
      displayName === "Antarctic Ice Shelves" ||
      displayName === "glaciated_areas" ||
      displayName === "Lakes" ||
      displayName === "Rivers" ||
      displayName === "Places"
    ) {
      style = style_water;
    }

    if (displayName === "Land") {
      style = style_simple;
    }
    if (displayName === "Country Boundaries") {
      style = style_borders;
    }
  }

  return style;
};

export const getBasemapOverlaysLayersArray = async (layerType: string) => {
  try {
    // Directly await the Promise
    let layers;
    let theTile;
    if (layerType === "basemaps") {
      layers = await basemapLayers;
    } else if (layerType === "overlays") {
      layers = await overlays;
    }

    if (layers) {
      const layerLen = layers.length;
      let i;
      let basemapArrays = [];

      for (i = 0; i < layerLen; i++) {
        let layerName = layers[i].name;
        let displayName = layers[i].displayName;

        let tileStyle = getTileStyle(displayName);

        if (layerType === "basemaps") {
          theTile = new VectorTileLayer({
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
        } else if (layerType === "overlays") {
          theTile = new TileLayer({
            title: displayName,
            visible: false,
            source: new WMTS({
              url: geoServerBaseUrl + "/geoserver/basemap/gwc/service/wmts",
              layer: layerName,
              matrixSet: "EPSG:900913",
              format: "image/png",
              projection: projection,
              tileGrid: new WMTSTileGrid({
                origin: getTopLeft(projectionExtent),
                resolutions: resolutions,
                matrixIds: matrixIds,
              }),
              style: "",
              wrapX: true,
            }),
          } as BaseLayerOptions);
        }

        basemapArrays.push(theTile);
      }
      return basemapArrays;
    }
  } catch (error) {
    console.error("Failed to load basemapLayers:", error);
    return null;
  }
};
