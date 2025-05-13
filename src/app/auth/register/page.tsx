"use client";

import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
//import { auth } from "./firebaseConfig";
//import { createUserWithEmailAndPassword } from "firebase/auth";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/context";

//import { useNavigate } from "react-router-dom";
/*interface RegisterProps {
  onRegisterSuccess: () => void;
}
*/
const Register: React.FC = ({}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [wantsNotification, setWantsNotification] = useState(false);
  //added line
  const { login } = useAuth();
  // const [name, setName] = useState("");

  //email validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setEmail(input);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    setEmailError(!isValidEmail && input.length > 0);
  };

  //PASSWORD VALIDATION
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setPassword(input);
    const isValidPassword =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(input);
    setPasswordError(!isValidPassword && input.length > 0);
  };

  //navigation property enclosure
  const router = useRouter();
  //navigate to signIn page
  const handleNavigate = () => {
    router.push("/auth/login");
  };
  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        //console.error("Registration failed:", data.error || "unknow error");
        //alert("registration failed" + data.error);
        setError(data.error || "Registration failed" + " details required");
        return;
      }
      //added line of code code
      //login({ email: data.user.email, name: data.user.name });
      alert("User registered successfully!");
      login({ email: data.user.email, name: data });

      router.push("/profile"); // You can navigate to SignIn or Homepage here
    } catch (err) {
      console.error("Registration failed:", err);
      //setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
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
            backgroundColor: "white",
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
          <h2
            style={{
              fontWeight: " normal",
              fontSize: "1rem",
              fontFamily: "sans-serif",
              fontStyle: "italic",
            }}
          >
            Sign Up to dev@dudumapper874 to continue to Dudumapper platform
          </h2>

          <TextField
            label="Email"
            fullWidth
            margin="normal"
            type="email"
            variant="outlined"
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
            variant="outlined"
            value={password}
            onChange={handlePasswordChange}
            error={passwordError}
            helperText={
              passwordError
                ? "password should be a mix of 8 characters long (uppercase and special case)"
                : ""
            }
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={wantsNotification}
                onChange={(e) => setWantsNotification(e.target.checked)}
              />
            }
            label="Notify me about disease-prone areas"
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleRegister}
          >
            Register
          </Button>

          <Typography sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Button color="secondary" onClick={handleNavigate}>
              Sign In
            </Button>
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default Register;
