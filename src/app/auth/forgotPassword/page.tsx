"use client";
import { Box, TextField, Button } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Container } from "@mui/material";
import { useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const router = useRouter();

  //handle navigation
  const handleNavigateBack = () => {
    router.push("/auth/login");
  };

  //email validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setEmail(input);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    setEmailError(!isValidEmail && input.length > 0);
  };

  //handle send reset link
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    if (!emailError && email) {
      setLoading(true);
      try {
        const res = await fetch("/api/forgotPassword", {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to send reset link");
        } else {
          toast.success("Password reset request sent to admin");
        }
      } catch (err) {
        console.error(err);
        toast.error("An error occurred");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please enter a valid email");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 8,
            borderRadius: 2,
            textAlign: "center",
            p: 4,

            flexDirection: "column",
            boxShadow: "6px 6px 12px #babecc, -6px -6px 12px #ffffff",
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
            <AccountCircleIcon sx={{ fontSize: 60, mb: 2 }} />
          </motion.div>
          <h3
            style={{
              fontFamily: "cursive",
              fontWeight: "bold",
              fontSize: "30px",
            }}
          >
            Forgot your Password?
          </h3>
          <p>
            Please Enter your email address and we will send you a link with
            instructions.
          </p>
          <TextField
            label="Email address"
            color="success"
            type="email"
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            helperText={emailError ? "type the correct mail" : ""}
            sx={{
              borderRadius: "20px",
              boxShadow: " 2px 2px 6px #babecc,  -6px -6px 12px #ffffff",
              input: {
                padding: "12px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
            }}
          />
          <Button
            style={{
              marginTop: "5px",
              padding: "10px",
              marginLeft: "10px",
              backgroundColor: "green",
              color: "white",
              borderRadius: "20px",
              boxShadow: "6px 6px 10px #babecc, -6px -6px 10px #ffffff",
              textTransform: "none",
              fontWeight: "bold",
            }}
            onClick={handleSendLink}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <a
              href="./auth/login"
              onClick={handleNavigateBack}
              style={{
                marginTop: "10px",
                padding: "5px",
                color: "green",
                display: "flex",
                //width: "50%",
                /*onClick: () => {
                window.location.href = "./app/SignIn";
              },*/
              }}
              //<a href="./app/SignIn">DashBoard</a>
              //onClick={handleNavigate}
            >
              Cancel
            </a>
          </Box>
        </Box>
      </Container>
    </div>
  );
};
export default ForgotPassword;
