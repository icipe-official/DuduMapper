import WMSCapabilities from "ol/format/WMSCapabilities";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import MVT from "ol/format/MVT";
import { BaseLayerOptions } from "ol-layerswitcher";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Style from "ol/style/Style";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS.js";
import WMTSTileGrid from "ol/tilegrid/WMTS.js";
import { get as getProjection } from "ol/proj.js";
import { getTopLeft, getWidth } from "ol/extent.js";
import { el } from "date-fns/locale";

// let projection: any = null;

const Projection = getProjection("EPSG:4326");

if (!Projection) {
  throw new Error("Projection not found");
}

const projectionExtent = Projection.getExtent();
const size = getWidth(projectionExtent) / 256;
const resolutions = new Array(19);

const matrixIds = new Array(19);
for (let z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = `EPSG:4326:${z}`;
}

console.log(
  "Raw GeoServer URL from env:",
  process.env.NEXT_PUBLIC_GEOSERVER_URL
);
export const geoServerBaseUrl =
  process.env.NEXT_PUBLIC_GEOSERVER_URL?.trim().replace(/['"]/g, "");
console.log("Processed GeoServer URL:", geoServerBaseUrl);

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
            zIndex: 0,
          } as BaseLayerOptions);
        } else if (layerType === "overlays") {
          theTile = new TileLayer({
            title: displayName,
            visible: false,
            source: new WMTS({
              url: `${geoServerBaseUrl}/geoserver/gwc/service/wmts`,
              layer: layerName,
              matrixSet: "EPSG:4326",
              format: "image/png",
              projection: Projection,
              tileGrid: new WMTSTileGrid({
                origin: getTopLeft(projectionExtent),
                resolutions: resolutions,
                matrixIds: matrixIds,
              }),
              style: " ",
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

// Add this new function to fetch layer capabilities
export async function fetchLayerCapabilities() {
  if (!geoServerBaseUrl) {
    throw new Error("GeoServer base URL is not defined");
  }

  // Fetch both WMS and WMTS capabilities
  const wmsUrl = `${geoServerBaseUrl}/geoserver/wms?request=GetCapabilities&service=WMS`;
  const wmtsUrl = `${geoServerBaseUrl}/geoserver/gwc/service/wmts?request=GetCapabilities`;

  try {
    // Fetch both capabilities in parallel
    const [wmsResponse, wmtsResponse] = await Promise.all([
      fetchXML(wmsUrl),
      fetchXML(wmtsUrl),
    ]);

    if (!wmsResponse || !wmtsResponse) {
      throw new Error("Failed to fetch capabilities");
    }

    // Parse capabilities
    const wmsParser = new WMSCapabilities();
    const wmtsParser = new WMTSCapabilities();

    const wmsResult = wmsParser.read(wmsResponse);
    const wmtsResult = wmtsParser.read(wmtsResponse);

    // Extract layer information
    const layers = extractLayerInfo(wmsResult, wmtsResult);

    return layers;
  } catch (error) {
    console.error("Error fetching capabilities:", error);
    throw error;
  }
}

function extractLayerInfo(wmsData: any, wmtsData: any) {
  const layerInfo = new Map();

  // Process WMS layers to get projection and extent info
  if (wmsData?.Capability?.Layer?.Layer) {
    wmsData.Capability.Layer.Layer.forEach((layer: any) => {
      if (layer.Name?.startsWith("Dudu:")) {
        layerInfo.set(layer.Name, {
          name: layer.Name,
          title: layer.Title,
          abstract: layer.Abstract,
          crs: layer.CRS || [],
          bbox: layer.BoundingBox || [],
          defaultStyle: layer.Style?.[0]?.Name || "",
        });
      }
    });
  }

  // Add WMTS specific information
  if (wmtsData?.Contents?.Layer) {
    wmtsData.Contents.Layer.forEach((layer: any) => {
      if (
        layer.Identifier?.startsWith("Dudu:") &&
        layerInfo.has(layer.Identifier)
      ) {
        const info = layerInfo.get(layer.Identifier);
        layerInfo.set(layer.Identifier, {
          ...info,
          tileMatrixSets:
            layer.TileMatrixSetLink?.map((link: any) => link.TileMatrixSet) ||
            [],
          formats: layer.Format || [],
          wmtsStyles: layer.Style?.map((style: any) => style.Identifier) || [],
        });
      }
    });
  }

  return Array.from(layerInfo.values());
}

// Add new interface for layer group structure
interface GeoServerLayerGroup {
  name: string;
  title: string;
  abstractTxt?: string;
  workspace: string;
  mode: string;
  publishables: {
    published: Array<{
      name: string;
      href: string;
    }>;
  };
}

// Update fetchWMTSLayersInfo to handle CORS properly
async function fetchWMTSLayersInfo() {
  if (!geoServerBaseUrl) {
    throw new Error("GeoServer base URL is not defined");
  }

  const capabilitiesUrl = `${geoServerBaseUrl}/geoserver/gwc/service/wmts?request=GetCapabilities`;

  try {
    // Remove credentials and use simple fetch
    const response = await fetch(capabilitiesUrl, {
      method: "GET",
      mode: "cors", // Explicitly set CORS mode
      credentials: "omit", // Don't send credentials
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new WMTSCapabilities();
    const result = parser.read(xmlText);

    // Extract Dudu layers with their projections
    const layers = result.Contents.Layer.filter((layer: any) =>
      layer.Identifier.startsWith("Dudu:")
    ).map((layer: any) => ({
      name: layer.Identifier,
      title: layer.Title,
      matrixSet: layer.TileMatrixSetLink[0].TileMatrixSet,
      supportedCRS: layer.TileMatrixSetLink[0].TileMatrixSet,
    }));

    console.log("Successfully fetched WMTS layers:", layers);
    return layers;
  } catch (error) {
    console.error("Error fetching WMTS Capabilities:", error);
    return [];
  }
}

// Add these interfaces at the top of the file
interface LayerGroupMember {
  name: string;
  title: string;
  abstract?: string;
}

interface LayerGroup {
  name: string;
  title: string;
  layers: LayerGroupMember[];
  nestedGroups?: LayerGroup[];
}

// Add the extractLayerGroups function
function extractLayerGroups(capabilities: any): LayerGroup[] {
  const groups: LayerGroup[] = [];

  function processLayer(layer: any) {
    // Debug the layer structure
    console.log("Processing layer:", {
      name: layer.Name,
      title: layer.Title,
      hasChildLayers: !!layer.Layer,
      childCount: layer.Layer?.length,
    });

    // Process this layer if it's a group
    if (layer.Layer) {
      // Check if this is a workspace layer group
      if (layer.Name?.includes("Dudu:")) {
        const group: LayerGroup = {
          name: layer.Name,
          title: layer.Title || layer.Name,
          layers: [],
        };

        // Process all child layers
        if (Array.isArray(layer.Layer)) {
          layer.Layer.forEach((childLayer: any) => {
            // Add individual layers to the group
            if (childLayer.Name?.includes("Dudu:")) {
              group.layers.push({
                name: childLayer.Name,
                title: childLayer.Title || childLayer.Name,
                abstract: childLayer.Abstract,
              });
            }
          });
        }

        // Only add groups that have layers
        if (group.layers.length > 0) {
          groups.push(group);
        }
      }

      // Recursively process child layers even if parent isn't in our workspace
      if (Array.isArray(layer.Layer)) {
        layer.Layer.forEach((childLayer: any) => {
          processLayer(childLayer);
        });
      }
    }
  }

  // Start processing from the root layer
  if (capabilities?.Capability?.Layer) {
    // Debug the root layer structure
    console.log("Root layer structure:", {
      name: capabilities.Capability.Layer.Name,
      hasChildLayers: !!capabilities.Capability.Layer.Layer,
      childCount: capabilities.Capability.Layer.Layer?.length,
    });

    processLayer(capabilities.Capability.Layer);
  }

  return groups;
}

// Update fetchLayerGroups to include more debugging
async function fetchLayerGroups(): Promise<LayerGroup[]> {
  if (!geoServerBaseUrl) {
    throw new Error("GeoServer base URL is not defined");
  }

  try {
    const wmsUrl =
      `${geoServerBaseUrl}/geoserver/wms?` +
      "SERVICE=WMS&" +
      "VERSION=1.3.0&" +
      "REQUEST=GetCapabilities";

    console.log("Fetching WMS capabilities from:", wmsUrl);

    const response = await fetch(wmsUrl, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new WMSCapabilities();
    const result = parser.read(xmlText);

    // Debug the full capabilities structure
    console.log("Full WMS Capabilities:", JSON.stringify(result, null, 2));

    const layerGroups = extractLayerGroups(result);
    console.log("Extracted layer groups:", layerGroups);
    return layerGroups;
  } catch (error) {
    console.error("Error fetching WMS capabilities:", error);
    return [];
  }
}
function normalizeName(name: string): string {
  return name.replace("Dudu:", "").trim();
}

// Update the type in fetchWMTSCapabilities where we use LayerGroup
export async function fetchWMTSCapabilities(): Promise<WMTSLayer[]> {
  try {
    const [layerGroups, wmtsLayers] = await Promise.all([
      fetchLayerGroups(),
      fetchWMTSLayersInfo(),
    ]);

    console.log("Layer Groups:", layerGroups);
    console.log("WMTS Layers:", wmtsLayers);

    if (!wmtsLayers.length) {
      console.warn("No WMTS layers found");
      return [];
    }

    // Create a map of normalized layer to group
    const layerToGroupMap = new Map<
      string,
      { groupName: string; groupTitle: string }
    >();

    if (layerGroups && layerGroups.length > 0) {
      layerGroups.forEach((group: LayerGroup) => {
        if (group.layers && group.layers.length > 0) {
          group.layers.forEach((layer: LayerGroupMember) => {
            const normalizedLayerName = normalizeName(layer.name);
            layerToGroupMap.set(normalizedLayerName, {
              groupName: group.name,
              groupTitle: group.title,
            });
          });
        }
      });
    }

    // Enrich WMTS layers with group information
    const enrichedLayers = wmtsLayers
      .map((layer: WMTSLayer) => {
        const normalizedLayerName = normalizeName(
          layer.name.includes(":") ? layer.name.split(":")[1] : layer.name
        );

        console.log(
          `Processing layer: ${layer.name} -> Normalized name: ${normalizedLayerName}`,
          `Found in group map: ${layerToGroupMap.has(normalizedLayerName)}`
        );

        const group = layerToGroupMap.get(normalizedLayerName);

        // Only mark as ungrouped if:
        // 1. The layer is not found in any group AND
        // 2. The layer name doesn't match any group names (to avoid including group containers)
        const isGroupContainer = layerGroups.some(
          (g) => normalizeName(g.name) === normalizedLayerName
        );

        if (isGroupContainer) {
          console.log(`Skipping group container: ${layer.name}`);
          return null;
        }

        if (group) {
          return {
            ...layer,
            group: {
              groupName: group.groupName,
              groupTitle: group.groupTitle,
            },
          };
        }

        return {
          ...layer,
          group: {
            groupName: "Ungrouped",
            groupTitle: "Ungrouped Layers",
          },
        };
      })
      .filter((layer): layer is WMTSLayer => layer !== null);

    console.log("Final enriched layers:", enrichedLayers);
    return enrichedLayers;
  } catch (error) {
    console.error("Error in fetchWMTSCapabilities:", error);
    return [];
  }
}

// Update the interface for better type safety
interface WMTSLayer {
  name: string;
  title: string;
  matrixSet: string;
  supportedCRS: string;
  group?: {
    groupName: string;
    groupTitle: string;
  };
}

export function getLegendUrl(layerName: string) {
  if (!geoServerBaseUrl) return "";

  // Clean up the layer name
  const cleanLayerName = layerName.includes(":")
    ? layerName
    : `Dudu:${layerName}`;

  return (
    `${geoServerBaseUrl}/geoserver/wms?` +
    "REQUEST=GetLegendGraphic&" +
    "VERSION=1.0.0&" +
    "FORMAT=image/png&" +
    "WIDTH=20&" +
    "HEIGHT=20&" +
    "LEGEND_OPTIONS=forceLabels:on;fontAntiAliasing:true&" + // Added anti-aliasing
    `LAYER=${encodeURIComponent(cleanLayerName)}&` +
    "TRANSPARENT=true&" + // Make background transparent
    "SCALE=0.5&" + // Adjust scale if needed
    "STYLE="
  ); // Empty style parameter
}
