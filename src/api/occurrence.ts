import { geoServerBaseUrl } from "@/api/requests";
const OCCURRENCE_API = `${geoServerBaseUrl}/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector:occurrence&maxFeatures=10000&outputFormat=application/json`;
const SITE_URL = "/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector%3Asite&maxFeatures=50&outputFormat=application/json&cql_filter=site_id=SITE_ID";
const BIONOMICS_URL = "/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector%3Abionomics_v&maxFeatures=50&outputFormat=application/json&cql_filter=bionomics_id=BIO_ID"
export const fetchSiteInfo = async (siteId: any) => {
    const url = geoServerBaseUrl + SITE_URL.replace("SITE_ID", siteId);
    const response = await fetch(url);
    return await response.json();
}
export const fetchBionomics = async (bioId: any) => {
    const url = geoServerBaseUrl + BIONOMICS_URL.replace('BIO_ID', bioId);
    const res = await fetch(url)
    return res.json()

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
