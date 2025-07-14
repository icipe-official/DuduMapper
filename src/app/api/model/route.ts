import { PrismaClient } from "@/generated/prisma";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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
