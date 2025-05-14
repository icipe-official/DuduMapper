"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";

export default function ProfileMenu() {
  const { user, logout, updateUserName } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [setting, setSetting] = useState();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(true); // For showing loading state while fetching user data

  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();

        if (data.user) {
          // Update the user context with the•••••••• session data
          updateUserName(data.user.name);
          setName(data.user.name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchUserData();
  }, [updateUserName]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const toggleDropdownMenu = () => setIsOpen(!isOpen);

  const handleNameSave = () => {
    updateUserName(name); // Update the user's name in context
    setEditing(false);
  };
  //logout function
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null); // Clear context or local state
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
        <span className="font-medium">{user?.name || "Profile"}</span>
        <img src="/profile-icon.svg" alt="Profile" className="w-6 h-6" />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 rounded-lg bg-white border shadow-lg p-4">
          {!editing ? (
            <>
              <div className="font-semibold text-lg">
                {user?.name || "Unnamed"}
              </div>
              <button
                onClick={() => setEditing(true)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Edit Name
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <p>Welcome ,{name}</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleNameSave}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm tex<MenuItem Menut-gray-600 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Always show Settings and Logout */}
          <button
            onClick={toggleDropdownMenu}
            className="mt-4 w-full text-left text-gray-700 hover:underline"
          >
            Settings
          </button>

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
function setUser(arg0: null) {
  throw new Error("Function not implemented.");
}
