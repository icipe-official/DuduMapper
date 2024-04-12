import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { authRoutes } from "./api/auth";

const protectedRoutes = ["/account/admin", "account/uploader"];

export const middleware = (request: NextRequest) => {
  const currentUser = request.cookies.get("userInfo")?.value;

  // check if accessing protected page and logged user had valid token
  const requestPath = request.nextUrl.pathname;
  if (
    checkIfProtectedPath(requestPath) &&
    (!currentUser || Date.now > JSON.parse(currentUser)?.jwt?.expiryMs)
  ) {
    // currentUser token expired
    request.cookies.delete("userInfo");
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("userInfo");
    return response;
  }

  if (authRoutes.includes(request.nextUrl.pathname) && currentUser) {
    // modify this to check roles based on route
    return NextResponse.redirect(new URL("/account/admin/users", request.url));
  }

  return NextResponse.next();
};

function checkIfProtectedPath(path: string) {
  return protectedRoutes.some((protectedRoute) =>
    path.includes(protectedRoute)
  );
}
