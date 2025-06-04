// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma"; //
const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        gender: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
