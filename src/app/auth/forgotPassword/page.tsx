"use client";
import { Box, TextField, Button } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Container } from "@mui/material";
import { useState } from "react";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const router = useRouter();

  //handle navigation
  const handleNavigateBack = () => {
    router.push("/");
  };

  //email validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setEmail(input);
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    setEmailError(!isValidEmail && input.length > 0);
  };

  //handle send reset link
  const handleSendLink = () => {
    if (!emailError && email) {
      console.log("email reset link sent successfully", email);
      //api caall to send link
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
            boxShadow:
              " inset 2px 2px  5px 5px #babecc, inset -10px -10px 20px #ffffff",

            input: {
              padding: "12px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            mx: "auto",
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
            type="email"
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            helperText={emailError ? "type the correct mail" : ""}
            sx={{
              borderRadius: "20px",
              boxShadow:
                "inset 2px 2px 5px #babecc, inset -6px -6px 10px #ffffff",
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
            onClick={() => {
              handleSendLink();
              alert("This feature is not yet available😞😞");
            }}
          >
            Send
          </Button>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <a
              href="./app"
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
              DashBoard
            </a>
          </Box>
        </Box>
      </Container>
    </div>
  );
};
export default ForgotPassword;
