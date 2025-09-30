import { PrismaClient } from "@/generated/prisma";
import { NextResponse } from "next/server";
import { toast } from "react-toastify";

const prisma = new PrismaClient();

//ADDING new model
export async function POST(req: Request) {
  try {
    const { metadata, doi, mintDoi } = await req.json();

    //create new model first
    const newModel = await prisma.vectorRiskData.create({
      data: {
        displayName: metadata.displayName,
        title: metadata.title,
        country: metadata.country,
        region: metadata.region,
        year: metadata.year,
        month: metadata.month,
        model: metadata.model,
        description: metadata.description,
        highRisk: metadata.highRisk,
      },
    });
    //store doi if mintDoi is true
    let newDoi = null;

    if (mintDoi) {
      newDoi = await prisma.doi.create({
        data: {
          creator: doi.creator,
          publisher: doi.publisher,
          publicationYear: doi.publicationYear,
          resourceType: doi.resourceType,
          url: doi.url,
          modelId: newModel.id,
        },
      });

      //merge for datacite
      const doiData = {
        data: {
          type: "dois",
          attributes: {
            event: "draft",
            titles: [{ title: newModel.title }],
            creators: [{ name: newDoi.creator }],
            publisher: newDoi.publisher,
            publicationYear: newModel.year,
            types: { resourceTypeGeneral: newDoi.resourceType },
            url: `https://dudumapper.org/model/${newModel.id}`,
          },
        },
      };
      //call datacite api to mint doi
      const dataciteRes = await fetch("https://doi.test.datacite.org/", {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.api+json",
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.DATACITE_USER}: ${process.env.DATACITE_PASSWORD}`
            ).toString("base64"),
        },
        body: JSON.stringify(doiData),
      });
      if (!dataciteRes.ok) {
        console.error(
          "Error minting DOI with DataCite:",
          dataciteRes.statusText
        );
        //return new Response("Failed to mint DOI with DataCite", { status: 500 });
      } else {
        const dataciteOk = await dataciteRes.json();

        //update the field doi
        newDoi = await prisma.doi.update({
          where: {
            id: newDoi.id,
          },
          data: {
            url: dataciteOk.data.attributes.doi,
          },
        });
      }
    }

    return NextResponse.json({ newModel, doi: newDoi }, { status: 200 });
  } catch (error) {
    console.error("Error adding model:", error);
    return NextResponse.json({ error: "Failed to add model" }, { status: 500 });
  }
}
//fetch them to post on table
export async function GET() {
  try {
    const models = await prisma.vectorRiskData.findMany({
      include: {
        //pull doi if available
        doi: true,
      },
    });

    return NextResponse.json(models, { status: 200 });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
//UPDATE
export async function PUT(req: Request) {
  const body = await req.json();
  try {
    if (!body.id) {
      return NextResponse.json(
        {
          error: "Model ID is required",
        },
        { status: 400 }
      );
    }

    //check if model available first
    const existingModel = await prisma.vectorRiskData.findUnique({
      where: { id: body.id },
    });
    if (!existingModel) {
      return NextResponse.json(
        {
          error: "Model not found",
        },
        { status: 404 }
      );
    }
    //ensure if 1 field is updated
    const updatedFields: any = {};
    if (body.year !== undefined) updatedFields.year = body.year;
    if (body.month !== undefined) updatedFields.month = body.month;
    if (body.displayName !== undefined)
      updatedFields.displayName = body.displayName;

    //if (body.model !== undefined) updatedFields.model = body.model;

    if (body.description !== undefined)
      updatedFields.description = body.description;
    if (body.country !== undefined) updatedFields.country = body.country;
    if (body.region !== undefined) updatedFields.region = body.region;

    if (typeof body.highRisk === "boolean")
      updatedFields.highRisk = body.highRisk;

    //now check either 1 or 2 fields are updated
    if (Object.keys(updatedFields).length === 0) {
      console.error("No fields to update");
      return NextResponse.json(
        {
          error: "No fields to update",
        },
        { status: 400 }
      );
    }

    const updatedModel = await prisma.vectorRiskData.update({
      where: {
        id: body.id,
      },
      data: updatedFields,
    });
    return NextResponse.json(updatedModel, { status: 200 });
  } catch (error) {
    console.error("Error updating model:", error);
    return NextResponse.json(
      { error: "Failed to update model" },
      { status: 500 }
    );
  }
}
//DELETE
export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id || !Array.isArray(id)) {
    return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
  }

  try {
    await prisma.vectorRiskData.deleteMany({
      where: {
        id: {
          in: id,
        },
      },
    });
    return NextResponse.json(id, { status: 200 });
  } catch (error) {
    console.error("Error ", error);
    return NextResponse.json({ message: "Failed to remove" }, { status: 500 });
  }
}
