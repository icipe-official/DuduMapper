import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const workspace = "Dudu";
  const geoUser = process.env.GEOSERVER_USER;
  const geoPass = process.env.GEOSERVER_PASSWORD;
  const geoUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;
  if (!geoUser || !geoPass || !geoUrl) {
    return new Response("Missing GeoServer credentials or URL", {
      status: 500,
    });
  }
  const authHeader =
    "Basic " + Buffer.from(`${geoUser}:${geoPass}`).toString("base64");
  //fetching all layers from geoserver
  const res = await fetch(
    `${geoUrl}/geoserver/rest/workspaces/${workspace}/layers.json`,
    {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    }
  );
  if (!res.ok) {
    console.error("Error fetching layers from GeoServer:", res.statusText);
    return new Response("Failed to fetch layers from GeoServer", {
      status: 500,
    });
  }
  const data = await res.json();
  const layers = data?.layers?.layer || [];
  console.log("Fetched layers:", layers);

  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  let result = layers;
  if (title) {
    result = layers.filter((l: any) =>
      l.name?.toLowerCase().includes(title.toLowerCase)
    );
  }
  return new Response(JSON.stringify(result), {
    status: 200,

    headers: { "Content-Type": "application/json" },
  });
}
