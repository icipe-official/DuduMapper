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
  RadioGroup,
  FormControl,
  FormLabel,
  Radio,
} from "@mui/material";
//import { auth } from "./firebaseConfig";
//import { createUserWithEmailAndPassword } from "firebase/auth";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/context";
import { toast } from "react-toastify";
import { set } from "date-fns";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";

//import { useNavigate } from "react-router-dom";
/*interface RegisterProps {
  onRegisterSuccess: () => void;
}
*/
const Register: React.FC = ({}) => {
  //email, name, gender, password, confirmPassword
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  //errors
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

  //fistname validation
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setFirstName(input);
  };

  //lastname validation
  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setLastName(input);
  };

  //gender
  const handleGenderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGender(event.target.value);
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
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          gender,
          wantsNotification,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed" + " details required");
        return;
      }

      // Login the user - auth context will handle redirection to stored URL
      await login({
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        gender: data.user.gender,
      });
      toast.success("User Registered Successfully"),
        {
          position: "top-right",
          autoclose: 5000,
          hideProgressBar: false,
          pauseOnHover: true,
        };

      // No need for explicit redirect here - the login function now handles it
      router.push("/"); // REMOVED this line
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Something went wrong. Please try again.");
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
        //backgroundImage: 'url("/Animals-Mosquito-icon.png")',
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
            //backgroundColor: "white",
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
            Sign Up
          </h2>
          <TextField
            label="First Name"
            type="text"
            value={firstName}
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleFirstNameChange}
          />
          <TextField
            label="Last Name"
            type="text"
            value={lastName}
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleLastNameChange}
          />

          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Gender</FormLabel>
            <RadioGroup row value={gender} onChange={handleGenderChange}>
              <FormControlLabel
                value="male"
                control={<Radio />}
                label={
                  <>
                    <MaleIcon sx={{ verticalAlign: "middle", mr: 0.5 }} />
                    Male
                  </>
                }
              />
              <FormControlLabel
                value="female"
                control={<Radio />}
                label={
                  <>
                    <FemaleIcon sx={{ verticalAlign: "middle", mr: 0.5 }} />
                    Female
                  </>
                }
              />
              <FormControlLabel
                value="other"
                control={<Radio />}
                label={
                  <>
                    <TransgenderIcon
                      sx={{ verticalAlign: "middle", mr: 0.5 }}
                    />
                    Other
                  </>
                }
              />
            </RadioGroup>
          </FormControl>

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
