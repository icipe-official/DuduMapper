// SignIn.tsx
"use client";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import React, { useState } from "react";
import { TextField, Button, Typography, Container, Box } from "@mui/material";
//import { auth, googleProvider } from "./firebaseConfig";
//import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
//import GoogleIcon from "@mui/icons-material/Google";
import { motion } from "framer-motion";
//import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/*interface SignProps {
  onLoginSuccess: () => void;
}
*/
const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  //added line
  const { login } = useAuth();

  //EMAIL VALIDATION
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setEmail(input);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    setEmailError(!isValidEmail && input.length > 0);
  };

  //PASSWORD validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setPassword(input);
    const isValidPassword =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(input);
    setPasswordError(!isValidPassword && input.length > 0);
  };

  //navigation to forgotpassword
  const router = useRouter();
  const handleForgotPassword = () => {
    router.push("/auth/forgotPassword");
  };
  /*
  const handleEmailSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Signed in successfully!");
      onLoginSuccess();
    } catch (err) {
      console.error("Sign in failed", err);
      setError("Invalid credentials. Try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Signed in with Google!");
      onLoginSuccess();
    } catch (err) {
      console.error("signed failed", err);
      setError("Google sign-in failed.");
    }
      
  };*/
  const handleEmailSignIn = async () => {
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      // Instead of manual fetch to /api/session, call login() from context
      await login({ email });

      toast.success("Signed in successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        pauseOnHover: false,
      });

      setTimeout(() => {
        router.push("/");
      }, 600);
    } catch (err: any) {
      console.error("Sign in failed", err);
      setError(err.message || "Invalid credentials. Try again.");
    }
  };

  /*const handleEmailSignIn = async () => {
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }

      // Fetch the session info (user data)
      const sessionResponse = await fetch("/api/session", {
        method: "GET",
        credentials: "same-origin", // Important for cookies to be sent
      });

      if (!sessionResponse.ok) {
        throw new Error("Failed to fetch session");
      }

      const sessionData = await sessionResponse.json();

      if (sessionData.user) {
        // Store user info in context or localStorage, if necessary
        // Example: login({ email: sessionData.user.email, name: sessionData.user.name });

        alert("Signed in successfully!");
        setTimeout(() => {
          router.push("/");
        }, 600);
        // Redirect to profile page
      }
    } catch (err: any) {
      console.error("Sign in failed", err);
      setError(err.message || "Invalid credentials. Try again.");
    }
  };*/

  /*
//session logout
// const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Redirect after successful login (you can change this URL as needed)
      router.push("/dashboard");
    } else {
      setError(data.message);
    }
  };*/
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            p: 4,
            boxShadow: 3,
            borderRadius: 2,
            textAlign: "center",
            backgroundColor: "whiyte",
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: [0, 10, -10, 0],
              //color: ["#000000", "#FF5733", "#3498DB", "#000000"],
            }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 2,
            }}
          >
            <AccountCircleIcon
              sx={{ fontSize: 60, mb: 2 }} // size: 60px, color: black, margin-bottom: 2
            />
          </motion.div>

          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
            Welcome
          </Typography>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: "normal",
              fontFamily: "sans-serif",
              fontStyle: "italic",
            }}
          >
            Sign in
          </h3>

          <TextField
            label="Email address*"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            helperText={emailError ? "invalid email" : ""}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={handlePasswordChange}
            error={passwordError}
            helperText={
              passwordError
                ? "password must be 8 mixed characters long (uppercase and special characters)"
                : ""
            }
          />

          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <a
            href="ForgotPassword"
            onClick={handleForgotPassword}
            style={{ textDecoration: "none", color: "#1976d2" }}
          >
            Forgot Password?
          </a>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleEmailSignIn}
          >
            Sign In
          </Button>

          <Typography sx={{ mt: 2, mb: 1 }}>or</Typography>

          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "white", //"#db4437",
              color: "black",

              "&:hover": { backgroundColor: "lightgrey", transform: "none" },
            }}
            /*onClick={handleGoogleSignIn}*/
            startIcon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                style={{ marginRight: 4 }}
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.23 9.2 3.27l6.84-6.84C35.41 2.13 30.04 0 24 0 14.64 0 6.66 5.49 2.65 13.44l7.93 6.16C12.5 13.14 17.79 9.5 24 9.5z"
                />
                <path
                  fill="#FBBC05"
                  d="M46.14 24.5c0-1.63-.13-3.21-.37-4.74H24v9.01h12.49c-.54 2.89-2.17 5.34-4.64 6.98l7.93 6.17c4.66-4.3 7.36-10.63 7.36-17.42z"
                />
                <path
                  fill="#34A853"
                  d="M10.58 28.97a14.96 14.96 0 0 1 0-9.94l-7.93-6.17A24 24 0 0 0 0 24c0 3.94.94 7.66 2.65 10.94l7.93-6.17z"
                />
                <path
                  fill="#4285F4"
                  d="M24 48c6.5 0 11.95-2.15 15.93-5.86l-7.93-6.17c-2.21 1.48-5.04 2.35-7.99 2.35-6.21 0-11.5-3.64-13.42-8.9l-7.93 6.17C6.66 42.51 14.64 48 24 48z"
                />
              </svg>
            }
          >
            Sign in with Google
          </Button>
        </Box>
      </Container>
    </div>
  );
};

export default SignIn;
