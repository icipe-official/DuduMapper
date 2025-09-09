import { NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import JSZIP from "jszip";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  //fetching geoserver layers
  const workspace = "Dudu";
  const geoUser = process.env.GEOSERVER_USER;
  const geoPass = process.env.GEOSERVER_PASSWORD;
  const geoUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;

  const { searchParams } = new URL(request.url);

  const layerName =
    searchParams.get("title") ||
    searchParams.get("layerName") ||
    searchParams.get("name");
  //const format = searchParams.get("format") || "image/png";
  //fetching metadata of the layer from db
  const layerData = await prisma.vectorRiskData.findFirst({
    where: {
      title: layerName || "",
    },
    select: {
      id: true,
      displayName: true,
      title: true,
      country: true,
      region: true,
      year: true,
      month: true,
      description: true,
      highRisk: true,
    },
  });

  if (!layerName) {
    return new Response("Missing layer name", {
      status: 400,
    });
  }
  if (!geoUser || !geoPass || !geoUrl) {
    return new Response("Missing GeoServer credentials or URL", {
      status: 500,
    });
  }
  const authHeader =
    "Basic " + Buffer.from(`${geoUser}:${geoPass}`).toString("base64");
  //fetching all layers from geoserver
  try {
    const res = await fetch(
      `${geoUrl}/geoserver/${workspace}/wms/reflect?layers=${workspace}:${layerName}&format=image/png`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );
    if (!res.ok) {
      console.error("Error fetching layers from GeoServer:", res.statusText);
      return new Response("Failed to fetch layers from GeoServer", {
        status: 500,
      });
    }

    const pngBlob = await res.arrayBuffer();
    //create workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Metadata");
    //add rows
    if (layerData) {
      sheet.addRow(["key", "value"]);
      Object.entries(layerData).forEach(([key, value]) => {
        sheet.addRow([key, value !== null ? String(value) : ""]);
      });
    } else {
      sheet.addRow(["Layer", layerName]);
      sheet.addRow(["Remarks", "No metadata available for this Layer"]);
    }

    const excelBuffer = await workbook.xlsx.writeBuffer();
    //create zip
    const zip = new JSZIP();
    zip.file(`${layerName}.png`, pngBlob);
    zip.file(`${layerName}_metadata.xlsx`, excelBuffer);

    const zipContent = await zip.generateAsync({ type: "arraybuffer" });

    return new Response(zipContent, {
      status: 200,

      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=${layerName}.zip`,
      },
    });
  } catch (err) {
    console.error("Error fetching layers from GeoServer:", err);
    return new Response("Failed to fetch layers from GeoServer", {
      status: 500,
    });
  }
}
{
  /*
  //rendering all layers interms of a list
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
}*/
}
