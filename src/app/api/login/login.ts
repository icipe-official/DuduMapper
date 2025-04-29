// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
//import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT (optional, for sessions)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
//test code
/*
export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  // Mock "correct" credentials
  const mockEmail = "test@registered.com";
  const mockPassword = "Test@123"; // you can change this to match your frontend test

  if (email !== mockEmail) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (password !== mockPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Simulate a successful login
  return new Response(
    JSON.stringify({ message: "User registered successfully" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
*/
