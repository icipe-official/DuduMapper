import WMSCapabilities from 'ol/format/WMSCapabilities';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';


const geoServerBaseUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL?.trim().replace(
  /['"]/g,
  ''
);
const overlaysLayergroup_in_geoserver =
  process.env.NEXT_PUBLIC_OVERLAYS_LAYER_GROUP;
const basemapLayergroup_in_geoserver =
  process.env.NEXT_PUBLIC_BASEMAP_LAYER_GROUP;
const geoserverWorkspace = process.env.NEXT_PUBLIC_SELECTED_WORKSPACE;

function appendPath(baseURL: string, path: string): string {
  if (baseURL.endsWith('/geoserver')) {
    // Remove '/geoserver' from the end
    baseURL = baseURL.substring(0, baseURL.length - 10);
  }
  return `${baseURL}${path}`;
}

async function fetchXML(url: RequestInfo | URL) {
  try {
    const response = await fetch(url, { credentials: 'omit' });

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
  if (typeof geoServerBaseUrl !== 'string') {
    console.error(
      'GeoServer base URL is not defined or not a string. Check your config settings.'
    );
    return null; // Return a default value or null
  }

  const xmlData = await fetchXML(
    appendPath(
      geoServerBaseUrl,
      '/geoserver/ows?service=WMS&version=1.3.0&request=GetCapabilities'
    )
  );

  if (!xmlData) {
    console.error('Failed to fetch WMS capabilities.');
    return null; // Return a default value or null
  }

  const parser = new WMSCapabilities();
  return parser.read(xmlData);
}

async function getWMTSCapabilities() {
  if (typeof geoServerBaseUrl !== 'string') {
    console.error(
      'GeoServer base URL is not defined or not a string. Check your config settings.'
    );
    return null; // Return a default value or null
  }

  const xmlData = await fetchXML(
    appendPath(
      geoServerBaseUrl,
      '/geoserver/gwc/service/wmts?service=WMTS&version=1.1.1&request=GetCapabilities'
    )
  );

  if (!xmlData) {
    console.error('Failed to fetch WMTS capabilities.');
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
            sourceLayer: 'overlays',
            sourceType: 'external-wms',
            url: `${geoServerBaseUrl}/geoserver/${geoserverWorkspace}/wms`,
            params: `{\"LAYERS\":\"${nestedLayer.Name}\",\"TILED\": true}`,
            serverType: 'geoserver',
            scale: 'map-percentage-scale',
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
  if (typeof overlaysLayergroup_in_geoserver !== 'string') {
    console.error('overlaysLayergroup_in_geoserver must be a string');
    return null;
  }
  return await extractLayersFromLayerGroup(
    await geoServerData,
    overlaysLayergroup_in_geoserver
  );
})();

export const basemapLayers = (async () => {
  if (typeof basemapLayergroup_in_geoserver !== 'string') {
    console.error('overlaysLayergroup_in_geoserver must be a string');
    return null;
  }
  return await extractLayersFromLayerGroup(
    await geoServerData,
    basemapLayergroup_in_geoserver
  );
})();


