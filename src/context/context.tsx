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
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean; // Added loading state
  login: (userData: User) => Promise<void>; // Made async
  logout: () => Promise<void>; // Made async
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true); // Set loading when starting
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("Not authenticated");

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.log("No active session");
        setUser(null);
      } finally {
        setLoading(false); // Always set loading to false when done
      }
    };

    fetchUser();
  }, []);

  const login = async (userData: User): Promise<void> => {
    try {
      // Set user in state
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return Promise.resolve();
    } catch (error) {
      console.error("Login failed:", error);
      return Promise.reject(error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call your logout API
      await fetch("/api/logout", { method: "POST" });

      // Clear user state
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      router.push("/");
      return Promise.resolve();
    } catch (error) {
      console.error("Logout failed:", error);
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
