import { BASE_SERVER_API } from "@/lib/constants";
import Cookie from "js-cookie";

export const authRoutes = ["/auth/login", "/auth/register"];

export async function authenticateUser(data: any) {
  const res = await fetch(`${BASE_SERVER_API}/auth/signin`, {
    body: JSON.stringify(data),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status === 400) throw new Error("Wrong Email or Password");

  const user = await res.json();

  Cookie.set("userInfo", JSON.stringify(user));

  return user;
}
