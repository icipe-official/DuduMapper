import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    // Set the token in an HTTP-only cookie
    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true, // Ensure the cookie cannot be accessed via JavaScript
        secure: process.env.NODE_ENV === "production", // Secure cookies in production
        sameSite: "strict", // CSRF protection
        path: "/", // Cookie is available across the entire site
        expires: new Date(Date.now() + 60 * 60 * 1000), // Cookie expires in 1 hour
      })
    );

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
