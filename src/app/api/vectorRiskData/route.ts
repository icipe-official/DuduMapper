import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(_req: Request): Promise<NextResponse> {
  try {
    const vectorRiskData = await prisma.vectorRiskData.findMany();

    return NextResponse.json(vectorRiskData, { status: 200 });
  } catch (error) {
    console.error("Error fetching vector risk data:", error);

    return NextResponse.json(
      { error: "Failed to fetch VectorRiskData" },
      { status: 500 }
    );
  }
}
