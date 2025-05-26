import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import jwt from "jsonwebtoken";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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
//profile picture backened handler
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: No token" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      email: string;
    };

    const formData = await req.formData();
    const file = formData.get("profilePicture") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${uuidv4()}_${file.name}`;
    const filePath = path.join(process.cwd(), "public", "uploads", filename);

    await writeFile(filePath, new Uint8Array(buffer));

    const imageUrl = `/uploads/${filename}`;

    const updatedUser = await prisma.users.update({
      where: { email: decoded.email },
      data: {
        profilePicture: imageUrl,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        gender: true,
        profilePicture: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error("Profile picture upload error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
