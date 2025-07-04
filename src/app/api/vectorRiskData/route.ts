import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
const prisma = new PrismaClient();

export async function GET(res: Request) {
  try {
    const VectorRiskData = await prisma.vectorRiskData.findMany();
    return NextResponse.json(VectorRiskData);
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch VectorRiskData",
      status: 500,
    });
  }
}
