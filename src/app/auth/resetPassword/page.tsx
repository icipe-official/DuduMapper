"use client";

import React from "react";
import { Suspense } from "react";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

//import { Form } from "@mui/icons-material";
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  useEffect(() => {
    // Clear auth context or local storage
    localStorage.removeItem("authToken");
    sessionStorage.clear();

    // Optionally hit a logout endpoint
    fetch("/api/logout", { method: "POST" }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token not found");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const res = await fetch("/api/resetPassword", {
      method: "POST",
      body: JSON.stringify({ token, newPassword: password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      toast.success(data.message);
      setTimeout(() => router.push("/auth/login"), 2000);
    } else {
      toast.error(data.message);
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Container maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              mt: 8,
              borderRadius: 2,
              textAlign: "center",
              p: 4,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,

              flexDirection: "column",
              boxShadow: "6px 6px 12px #babecc, -6px -6px 12px #ffffff",
            }}
          >
            <h1
              style={{
                fontFamily: "cursive",
                fontWeight: "bold",
                fontSize: "30px",
              }}
            >
              Reset Password
            </h1>
            <TextField
              type="password"
              placeholder="New Password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <TextField
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              variant="outlined"
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              type="submit"
              disabled={loading}
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
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>{" "}
        </form>
      </Container>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
