import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      gender,
      //wantsNotification = false,
    } = await req.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!firstName || !lastName || !gender) {
      return NextResponse.json(
        { message: "First name, last name, and gender are required" },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.users.create({
      data: {
        email,
        firstName,
        lastName,
        gender,
        password: hashedPassword,

        //wantsNotification,
      },
    });
    //generate jwt
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );
    //set token in cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json(
      { message: "User created", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
  //test code
  /*
  const body = await req.json();
  const { email, password } = body;

  // Mock: Check if "email" is already "registered"
  if (email === "test@registered.com") {
    return new Response(JSON.stringify({ error: "User already exists" }), {
      status: 400,
    });
  }

  // Mock successful registration
  return new Response(
    JSON.stringify({ message: "User registered successfully" }),
    {
      status: 200,
    }
  );*/
}
