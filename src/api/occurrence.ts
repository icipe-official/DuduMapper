import {geoServerBaseUrl} from "@/api/requests";

const SITE_URL = "/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector:site_v&maxFeatures=50&outputFormat=application/json&cql_filter=site_id=SITE_ID";
const BIONOMICS_URL = "/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector:bionomics_v&maxFeatures=50&outputFormat=application/json&cql_filter=bionomics_id=BIO_ID"

export const fetchSiteInfo = async (siteId: any) => {
    const url = geoServerBaseUrl + SITE_URL.replace("SITE_ID", siteId);
    const response = await fetch(url);
    return await response.json();
}

export const fetchBionomics = (bioId: number) => {
    fetch(geoServerBaseUrl + SITE_URL + "&cql_filter=bionomics_id=" + {bioId})
        .then(response => response.json())
        .then(json => {
            return json;
        })
        .catch(error => console.error(error));
}