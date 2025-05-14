"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
type User = {
  name: string;
  email: string;
};
//

type AuthContextType = {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUserName: (name: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  //check if session is active, user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("Not authenticated");

        const data = await res.json();
        setUser(data.user); // assuming API returns { user: { name, email } }
      } catch (error) {
        console.log("No active session");
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };
  //added line

  const router = useRouter();
  const logout = async () => {
    setUser(null);
    router.push("/");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateUserName = (name: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedUser = { ...prev, name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
