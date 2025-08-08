import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { handleCors } from "@/lib/cors";

// Helper function to upload file to GeoServer
async function uploadToGeoServer(
  fileBuffer: Buffer,
  storeName: string,
  isUpdate = false
) {
  const workspace = "dudu"; // Default workspace

  try {
    const geoUser = process.env.GEOSERVER_USER;
    const geoPass = process.env.GEOSERVER_PASSWORD;
    const geoUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;

    if (!geoUser || !geoPass || !geoUrl) {
      throw new Error("Missing GeoServer credentials or URL");
    }

    // For updates, optionally delete the existing store
    if (isUpdate) {
      try {
        await fetch(
          `${geoUrl}/geoserver/rest/workspaces/${workspace}/coveragestores/${storeName}?recurse=true`,
          {
            method: "DELETE",
            headers: {
              Authorization:
                "Basic " +
                Buffer.from(`${geoUser}:${geoPass}`).toString("base64"),
            },
          }
        );
      } catch (deleteError) {
        console.log("Delete failed or not needed:", deleteError);
      }
    }

    // Upload the file to create a new coverage store
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
      console.error("Geoserver upload error", {
        status: geoRes.status,
        statusText: geoRes.statusText,
        body: errorText,
      });
      throw new Error(
        `GeoServer error (${geoRes.status} ${geoRes.statusText}) : ${errorText}`
      );
    }

    const layerName = await getLayerName(workspace, storeName);

    return { success: true, storeName, layerName, workspace };
  } catch (error) {
    console.error("GeoServer upload failed:", error);
    throw error;
  }
}

// Fetch layer name from the uploaded coverage store
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
  } catch (error) {
    console.warn("Layer info fallback to storeName", error);
    return storeName;
  }
}

// POST handler: Upload new GeoTIFF
export async function POST(req: NextRequest): Promise<Response> {
  const headers = handleCors(req);
  if (headers instanceof NextResponse) return headers; // preflight

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: headers,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const storeName = file.name.replace(/\.[^/.]+$/, "") || "uploaded";

    const result = await uploadToGeoServer(fileBuffer, storeName, false);

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "File upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: headers }
    );
  }
}

// PUT handler: Replace existing store
export async function PUT(req: NextRequest): Promise<Response> {
  const headers = handleCors(req);
  if (headers instanceof NextResponse) return headers; // preflight

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const existingStoreName = formData.get("storeName") as string;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: headers,
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const storeName =
      existingStoreName || file.name.replace(/\.[^/.]+$/, "") || "uploaded";

    const result = await uploadToGeoServer(fileBuffer, storeName, true);

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "File update failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: headers }
    );
  }
}

// DELETE handler: Remove store

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

    const geoUser = process.env.GEOSERVER_USER;
    const geoPass = process.env.GEOSERVER_PASSWORD;
    const geoUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;
    const workspace = "dudu";

    const geoRes = await fetch(
      `${geoUrl}/geoserver/rest/workspaces/${workspace}/layers/${storeName}?recurse=true`,
      {
        method: "DELETE",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${geoUser}:${geoPass}`).toString("base64"),
        },
      }
    );

    if (!geoRes.ok && geoRes.status !== 404) {
      const errorText = await geoRes.text();
      return NextResponse.json(
        { error: "GeoServer deletion failed", details: errorText },
        { status: geoRes.status }
      );
    }

    return NextResponse.json(
      { message: "Store  deleted successfully from GeoServer" },
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
