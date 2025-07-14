import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to validate email format check
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function POST() {
  try {
    const users = await prisma.users.findMany({
      orderBy: { createdAt: "asc" },
      where: { wantsnotification: true },
      select: { email: true },
    });
    //model sending notification logic
    const recentModels = await prisma.vectorRiskData.findMany({
      where: {
        createdAt: {
          gt: new Date(Date.now() - 24 * 60 * 60 * 1000), //5days
        },
      },
      orderBy: { createdAt: "desc" },
    });
    if (recentModels.length === 0) {
      return NextResponse.json(
        { message: "No new models found" },
        { status: 201 }
      );
    }
    const modelListHTML = recentModels
      .map(
        (model) =>
          `
      <li>
      <b>${model.title}</b> (${model.country}, ${model.year}/${model.month}) - 
          <span style="color:${model.highRisk ? "red" : "green"}">
            ${model.highRisk ? "High Risk" : "Low Risk"}
          </span>
          — <a href="https://dudumapper.icipe.org/${model.id}">View on Map</a>
      </li>
      `
      )
      .join("");

    const subject = "New Model Notification";
    //
    const html = `
      
      <p>Hi.Here are the latest added models:</p>
      <ul>${modelListHTML}</ul>
      <p>Visit your <a href="https://dudumapper.icipe.org">Model Mapped into the map</a> for details.</p>
      <p>Best Regards.</p>
     
    `;

    let successCount = 0;
    let failureCount = 0;

    const sendAndLog = users.map(async (user) => {
      if (!isValidEmail(user.email)) {
        console.warn(`Skipped invalid email: ${user.email}`);
        failureCount++;
        return;
      }

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject,
          html,
        });

        await prisma.sentEmail.create({
          data: {
            email: user.email,
            subject,
            body: html,
          },
        });

        console.log(`Email sent to: ${user.email}`);
        successCount++;
      } catch (err) {
        console.error(`Failed to send to ${user.email}:`, err);
        failureCount++;
      }
    });

    await Promise.all(sendAndLog);

    return NextResponse.json(
      {
        message: `Emails sent: ${successCount}, failed: ${failureCount}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { message: "Failed to send emails" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const emails = await prisma.sentEmail.findMany({
      orderBy: { sentAt: "desc" },
    });

    return NextResponse.json(emails, { status: 200 });
  } catch (error) {
    console.error("Error fetching sent emails:", error);
    return NextResponse.json(
      { message: "Failed to fetch sent emails" },
      { status: 500 }
    );
  }
}
