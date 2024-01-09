import {geoServerBaseUrl} from "@/api/requests";

const RESOURCE_URL = geoServerBaseUrl + "/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector:RESOURCE&maxFeatures=50&outputFormat=application/json&cql_filter=FILTER";

const fetchResource =  async (resource: string, filter: string)=> {
    console.log(`Fetching resource: ${resource} with filter ${filter}`)
    const url = RESOURCE_URL.replace('RESOURCE', resource).replace("FILTER", filter);
    console.log("Complete URL", url)
    const response = await fetch(url);
    return await response.json();
}

export const fetchSiteInfo = async (siteId: number) => {
    const filter = `site_id=${siteId}`;
    const response = await fetchResource('site', filter);
    return await response.json();
}

export const fetchOccurrenceSamples = async (occurrenceId: number) => {
    const filter = `occurrence_id=${occurrenceId}`;
    const response = await fetchResource('occurrence_sample', filter);
    return await response.json();
}

export const fetchBionomics = async (bionomicsId: number) => {
    const filter = `bionomics_id=${bionomicsId}`;
    const response = await fetchResource('bionomics', filter);
    return await response.json();
}