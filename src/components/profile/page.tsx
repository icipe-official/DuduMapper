"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { on } from "events";

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * ProfileMenu
 *
 * A component that shows a dropdown menu with user profile information,
 * Settings link, and Logout button.
 *

/*******  b3bcd212-8248-455c-964d-b1126ee05b8f  *******/ export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true); // For showing loading state while fetching user data

  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();

        if (data.user) {
          // Update the user context with the session data
          // No need to update the name anymore since it's removed
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchUserData();
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleButtonSettings = () => {
    {
      isOpen && (
        <div>
          <div>
            <h5>Your account Details</h5>
            <h5>Hi you Are logged in</h5>
          </div>
        </div>
      );
    }
  };
  // Logout function
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/"); // Redirect to home or login
    localStorage.removeItem("user");
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading state until the user data is fetched
  }

  return (
    <div className="relative inline-block text-left">
      {/* Profile Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-full hover:bg-green-600"
      >
        <span className="font-medium">Welcome, {user?.email || "Profile"}</span>
        <img src="/profile-icon.svg" alt="Profile" className="w-6 h-6" />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg bg-white border shadow-lg p-4">
          <div className="font-semibold text-lg">
            {user?.email || "No Email"}
          </div>

          {/* Always show Settings and Logout */}
          <button
            onClick={() => router.push("/settings")} // Replace with actual settings page
            className="mt-4 w-full text-left text-gray-700 hover:underline"
          >
            Settings
          </button>
          {/*setting dropdown*/}

          <button
            onClick={handleLogout}
            className="mt-2 w-full text-left text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
