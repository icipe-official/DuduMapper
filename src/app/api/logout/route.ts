// /app/api/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0), // Expire the cookie
  });
  return response;
}
