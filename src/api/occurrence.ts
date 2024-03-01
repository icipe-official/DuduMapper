import { geoServerBaseUrl } from "@/api/requests";
import axios from "axios";
const OCCURRENCE_API = `${geoServerBaseUrl}/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector:occurrence&maxFeatures=10000&outputFormat=application/json`;
const SITE_URL = "/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector%3Asite&maxFeatures=50&outputFormat=application/json&cql_filter=site_id=SITE_ID";
const BIONOMICS_URL = "/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector%3Abionomics&maxFeatures=50&outputFormat=application/json";
const REFERENCE_URL = "/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector%3Areference_v&maxFeatures=50&outputFormat=application/json";
const DOWNLOAD_URL = "/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector:download_v&outputFormat=FORMAT";
export const fetchSiteInfo = async (siteId: any) => {
    const url = geoServerBaseUrl + SITE_URL.replace("SITE_ID", siteId);
    const response = await fetch(url);
    return await response.json();
}

export const getOccurrence = async (queryKey: any) => {
    console.log(queryKey[1])
    const params: string = queryKey[1]
    if (params) {
        console.log('Filtering occurrence on: ', params)
        const url = `${OCCURRENCE_API}&cql_filter=${params}`;
        console.log(url)
        const response = await fetch(url)
        return response.json();
    }
    console.log('Loading all occurrence')
    const response = await fetch(`${OCCURRENCE_API}`)
    return response.json();
}
export const fetchBionomics = async (bioId: number) => {
    const response = await fetch(geoServerBaseUrl + BIONOMICS_URL + "&cql_filter=bionomics_id=" + bioId);
    return await response.json();
}

export const fetchReference = async (referenceId: any) => {
    const response = await fetch(geoServerBaseUrl + REFERENCE_URL + "&cql_filter=id=" + referenceId);
    return await response.json();
}

export const downloadOccurrence = async (format: string, cqL_filter: string) => {
    let url = geoServerBaseUrl + DOWNLOAD_URL.replace("FORMAT", format);
    console.log(`URL ${url}`)
    if (cqL_filter) {
        url +=  `&cql_filter=${cqL_filter}`
        console.log(`URL ${url}`)
    }
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'blob',
        });

        const href = window.URL.createObjectURL(response.data);

        const anchorElement = document.createElement('a');

        anchorElement.href = href;
        anchorElement.download = 'occurrence';

        document.body.appendChild(anchorElement);
        anchorElement.click();

        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(href);
    } catch (error) {
        console.log(error);
    }
}