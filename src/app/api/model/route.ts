import { PrismaClient } from "@/generated/prisma";
import { NextResponse } from "next/server";

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
    if (
      !body.id ||
      !body.title ||
      !body.country ||
      !body.region ||
      !body.year ||
      !body.month ||
      !body.model ||
      !body.description ||
      typeof body.highRisk !== "boolean"
    ) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
    const updatedModel = await prisma.vectorRiskData.update({
      where: {
        id: body.id,
      },
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
