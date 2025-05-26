import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import jwt from "jsonwebtoken";
//import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    // Access cookies using the request object (correct way in API routes)
    //const cookieStore = cookies();
    // const token = cookieStore.get("token")?.value;
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: No token" },
        { status: 401 }
      );
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      userId: number;
      email: string;
    };

    // Parse request body
    const { firstName, lastName } = await req.json();

    if (!firstName && !lastName) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 }
      );
    }

    // Update user in database
    const updatedUser = await prisma.users.update({
      where: { email: decoded.email },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        gender: true,
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    console.error("Update user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
