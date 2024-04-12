import { BASE_SERVER_API } from "@/lib/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Cookie from "js-cookie";

// to fix this and have it somewhere else
function getUserToken(): string {
  const userInfo = Cookie.get("userInfo");
  if (!userInfo) return "";

  const token = JSON.parse(userInfo)?.jwt?.accessToken;

  return token;
}

async function fetchUsersService() {
  const res = await fetch(`${BASE_SERVER_API}/users`, {
    headers: {
      Authorization: `Bearer ${getUserToken()}`,
    },
  });

  return res.json();
}

async function activateUser(userId: string) {
  const res = await fetch(`${BASE_SERVER_API}/users/${userId}/activate`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getUserToken()}`,
    },
  });

  return res.json();
}

async function deactivateUser(userId: string) {
  const res = await fetch(`${BASE_SERVER_API}/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getUserToken()}`,
    },
  });

  return res.json();
}

export function useFetchAllUsers() {
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: fetchUsersService,
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allUsers"],
      });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["allUsers"],
      });
    },
  });
}
