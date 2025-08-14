import { PrismaClient } from "@/generated/prisma";
import { NextResponse } from "next/server";
import { toast } from "react-toastify";

const prisma = new PrismaClient();

//ADDING new model
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newModel = await prisma.vectorRiskData.create({
      data: {
        title: body.title,
        country: body.country,
        region: body.region,
        year: body.year,
        month: body.month,
        model: body.model,
        description: body.description,
        highRisk: body.highRisk,
      },
    });
    return NextResponse.json(newModel, { status: 200 });
  } catch (error) {
    console.error("Error adding model:", error);
    return NextResponse.json({ error: "Failed to add model" }, { status: 500 });
  }
}
//fetch them to post on table
export async function GET() {
  try {
    const models = await prisma.vectorRiskData.findMany();
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
    if (body.title !== undefined) updatedFields.title = body.title;
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
