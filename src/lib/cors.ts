import { NextResponse, NextRequest } from "next/server";

export function handleCors(req: NextRequest) {
  const origin = req.headers.get("Origin") || "*";

  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  //handle preflight
  if (req.method === "OPTIONS") {
    return NextResponse.json(null, {
      status: 204,
      headers,
    });
  }
  return headers;
}
