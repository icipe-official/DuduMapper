import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function authentication(req: NextRequest) {
  const token = req.cookies.get("token")?.value; // Access the cookie value as a string

  if (!token) {
    // If no token is found, redirect to login page
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify the token (use your secret from .env or a fallback string)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    // Attach the decoded user data to the request object
    (req as any).user = decoded; // Cast req to `any` to avoid TypeScript errors

    return NextResponse.next(); // Allow the request to proceed if the token is valid
  } catch (error) {
    // If token is invalid or expired, redirect to login page
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

// Define paths where the middleware should be applied
export const config = {
  matcher: ["/map/"], // This will protect the homepage ("/") and redirect to login if not authenticated
};
