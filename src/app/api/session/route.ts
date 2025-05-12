import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// POST method for logging in
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret", // Use a stronger secret in production
      { expiresIn: "1h" }
    );

    // Set JWT token in an HTTP-only cookie
    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true, // Ensure the cookie cannot be accessed via JavaScript
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      sameSite: "strict", // CSRF protection
      path: "/", // Cookie is available across the entire site
      maxAge: 60 * 60, // Cookie expires in 1 hour
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET method to check the session and return user info
export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value; // Access the value of the token cookie

  if (!token) {
    return NextResponse.json(
      { message: "User not authenticated" },
      { status: 401 }
    );
  }

  try {
    // Verify JWT token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");

    // Cast userId to number if it's stored as a number in the database
    const userId = Number(decoded.userId); // Ensure userId is of the correct type

    // Fetch user data based on decoded user ID
    const user = await prisma.users.findUnique({
      where: { id: userId }, // Use the correct type for userId
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
