import { NextRequest, NextResponse } from "next/server";
import { handleCors } from "@/lib/cors";

// Helper function to delete layer & store from GeoServer
async function deleteLayerAndStore(workspace: string, storeName: string) {
  const geoUser = process.env.GEOSERVER_USER;
  const geoPass = process.env.GEOSERVER_PASSWORD;
  const geoUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;
  const authHeader =
    "Basic " + Buffer.from(`${geoUser}:${geoPass}`).toString("base64");

  // 1️⃣ Get coverage (layer) name
  let coverageName = storeName;
  const covRes = await fetch(
    `${geoUrl}/geoserver/rest/workspaces/${workspace}/coveragestores/${storeName}/coverages.json`,
    {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    }
  );
  if (covRes.ok) {
    const covData = await covRes.json();
    coverageName = covData?.coverages?.coverage?.[0]?.name || storeName;
  }

  // 2️⃣ Delete layer
  await fetch(`${geoUrl}/geoserver/rest/layers/${coverageName}?recurse=true`, {
    method: "DELETE",
    headers: { Authorization: authHeader },
  });

  // 3️⃣ Delete store
  await fetch(
    `${geoUrl}/geoserver/rest/workspaces/${workspace}/coveragestores/${storeName}?recurse=true`,
    {
      method: "DELETE",
      headers: { Authorization: authHeader },
    }
  );
}

// Helper function to upload file to GeoServer
async function uploadToGeoServer(
  fileBuffer: Buffer,
  storeName: string,
  isUpdate = false
) {
  const workspace = "Dudu";
  const geoUser = process.env.GEOSERVER_USER;
  const geoPass = process.env.GEOSERVER_PASSWORD;
  const geoUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;

  if (!geoUser || !geoPass || !geoUrl) {
    throw new Error("Missing GeoServer credentials or URL");
  }

  if (isUpdate) {
    await deleteLayerAndStore(workspace, storeName);
  }

  // Upload new GeoTIFF
  const geoRes = await fetch(
    `${geoUrl}/geoserver/rest/workspaces/${workspace}/coveragestores/${storeName}/file.geotiff`,
    {
      method: "PUT",
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${geoUser}:${geoPass}`).toString("base64"),
        "Content-Type": "image/tiff",
      },
      body: fileBuffer as unknown as BodyInit,
    }
  );

  if (!geoRes.ok) {
    const errorText = await geoRes.text();
    throw new Error(
      `GeoServer error (${geoRes.status} ${geoRes.statusText}) : ${errorText}`
    );
  }

  const layerName = await getLayerName(workspace, storeName);
  return { success: true, storeName, layerName, workspace };
}

// Fetch layer name from coverage store
async function getLayerName(workspace: string, storeName: string) {
  try {
    const geoUser = process.env.GEOSERVER_USER;
    const geoPass = process.env.GEOSERVER_PASSWORD;
    const geoUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;

    const layersRes = await fetch(
      `${geoUrl}/geoserver/rest/workspaces/${workspace}/coveragestores/${storeName}/coverages.json`,
      {
        method: "GET",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${geoUser}:${geoPass}`).toString("base64"),
          Accept: "application/json",
        },
      }
    );

    if (!layersRes.ok) throw new Error("Layer info fetch failed");

    const layersData = await layersRes.json();
    return layersData?.coverages?.coverage?.[0]?.name || storeName;
  } catch {
    return storeName;
  }
}

// POST: Upload new GeoTIFF
export async function POST(req: NextRequest): Promise<Response> {
  const headers = handleCors(req);
  if (headers instanceof NextResponse) return headers;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return new NextResponse(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const storeName = file.name.replace(/\.[^/.]+$/, "") || "uploaded";

    const result = await uploadToGeoServer(fileBuffer, storeName, false);

    return new NextResponse(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "File upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers }
    );
  }
}

// PUT: Replace existing store
export async function PUT(req: NextRequest): Promise<Response> {
  const headers = handleCors(req);
  if (headers instanceof NextResponse) return headers;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const existingStoreName = formData.get("storeName") as string;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const storeName =
      existingStoreName || file.name.replace(/\.[^/.]+$/, "") || "uploaded";

    const result = await uploadToGeoServer(fileBuffer, storeName, true);

    return new NextResponse(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "File update failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers }
    );
  }
}

// DELETE: Remove store & layer
export async function DELETE(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const storeName = searchParams.get("storeName");
    if (!storeName) {
      return NextResponse.json(
        { error: "Store name is required" },
        { status: 400 }
      );
    }

    await deleteLayerAndStore("Dudu", storeName);

    return NextResponse.json(
      { message: "Layer and store deleted successfully from GeoServer" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "File deletion failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
