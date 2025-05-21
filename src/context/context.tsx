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
  loading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  forceRefresh: () => void; // Added force refresh function
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Added refresh trigger
  const router = useRouter();

  // Force refresh function - call this after registration/login if needed
  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      // IMPORTANT: Check localStorage FIRST - this is critical
      try {
        const savedUser = localStorage.getItem("user");
        console.log(
          "Checking localStorage for user:",
          savedUser ? "Found" : "Not found"
        );

        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          console.log("User from localStorage:", parsedUser);
          setUser(parsedUser);
          setLoading(false);
          return; // Skip API call if we have a valid user
        }
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("user");
      }

      // Fall back to API only if localStorage doesn't have user
      try {
        console.log("No user in localStorage, checking API...");
        const res = await fetch("/api/me");

        if (res.ok) {
          const data = await res.json();
          console.log("API returned user:", data.user);

          if (data.user) {
            setUser(data.user);
            // Also save to localStorage for persistence
            localStorage.setItem("user", JSON.stringify(data.user));
          } else {
            console.log("API returned no user");
            setUser(null);
          }
        } else {
          console.log("API call failed with status:", res.status);
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user from API:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [refreshTrigger]); // Add refreshTrigger to dependencies

  const login = async (userData: User): Promise<void> => {
    try {
      console.log("Login called with:", userData);

      // CRITICAL: Set user state AND localStorage immediately
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("User saved to localStorage and state");

      return Promise.resolve();
    } catch (error) {
      console.error("Login failed:", error);
      return Promise.reject(error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("Logout called");

      // Call logout API if needed
      try {
        await fetch("/api/logout", { method: "POST" });
      } catch (e) {
        console.warn("Logout API call failed, continuing with client logout");
      }

      // CRITICAL: Clear user from state AND localStorage
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      console.log("User cleared from localStorage and state");

      router.push("/");
      return Promise.resolve();
    } catch (error) {
      console.error("Logout failed:", error);
      return Promise.reject(error);
    }
  };

  // Debug output with more details
  console.log("Auth Provider state:", {
    user: user ? `${user.email} (set)` : "null",
    loading,
    fromLocalStorage:
      //corrected local storage not defined
      typeof window != "undefined" && !!localStorage.getItem("user"),
  });

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, forceRefresh }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
