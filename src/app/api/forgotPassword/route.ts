import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import nodemailer from "nodemailer";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // 1. Check if user exists
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "No user found with that email" },
        { status: 404 }
      );
    }

    //2. create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    //3.store token
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { token: resetToken, expires },
      create: { token: resetToken, userId: user.id, expires },
    });

    //4.automate user email send
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/resetPassword?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    //5. user reset
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `
      <p>Click the link below to change your password</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Token is valid for 1 hour</p>
      `,
    });

    //6.admin notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Password Reset Request",
      html: `
        <p>User <strong>${email}</strong> has requested a password reset.</p>
        <p>The proccess is automated.</p>
      `,
    });

    return NextResponse.json(
      { message: "Reset request sent to admin" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
