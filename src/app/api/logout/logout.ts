import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Clear the cookie by setting it to an expired date
  res.setHeader(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: true, // Cookie cannot be accessed via JavaScript
      secure: process.env.NODE_ENV === "production", // Secure cookies in production
      sameSite: "strict", // CSRF protection
      path: "/", // Cookie is available across the entire site
      expires: new Date(0), // Expire the cookie immediately
    })
  );

  return res.status(200).json({ message: "Logged out successfully" });
}
