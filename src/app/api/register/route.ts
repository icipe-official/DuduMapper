import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, wantsNotification = false } = await req.json();

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        wantsNotification,
      },
    });

    return NextResponse.json({ message: "User created", user });
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
