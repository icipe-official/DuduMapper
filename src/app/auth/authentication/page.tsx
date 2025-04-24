/*"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SignIn from "./auth/login/page";
import Register from "./auth/register/page"; // Adjust the path if needed

interface AuthenticationProps {
  onLoginSuccess: () => void;
}

const Authentication: React.FC<AuthenticationProps> = ({ onLoginSuccess }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    onLoginSuccess();
    router.push("/"); // Redirect to home or dashboard after login
  };

  const handleRegisterSuccess = () => {
    setIsAuthenticated(true);
    onLoginSuccess();
    router.push("/"); // Redirect to home or dashboard after registration
  };

  return (
    <div>
      {!isAuthenticated ? (
        isSignUp ? (
          <Register onRegisterSuccess={handleRegisterSuccess} />
        ) : (
          <SignIn onLoginSuccess={handleLoginSuccess} />
        )
      ) : (
        <div>Welcome! You are authenticated.</div>
      )}

      {!isAuthenticated && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Authentication;
*/
