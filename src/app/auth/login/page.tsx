"use client";

import {
  Box,
  Button,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import UserIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { authenticateUser } from "@/api/auth";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const schema = yup
  .object({
    username: yup.string().email().required().label("Email"),
    password: yup.string().min(8).required().label("Password"),
  })
  .required();

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const router = useRouter();

  const handleLoginUser = async (req: any) => {
    try {
      const res: Promise<any> = authenticateUser(req);
      const body = await res;
      localStorage.setItem("token", JSON.stringify(body));
      Swal.fire({
        title: "Successful",
        text: "Successfully logged in",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      }).then((res) => {
        if (res.isDismissed) {
          // to change this to redirect to specific pages
          router.push("/account/admin/users");
        }
      });
    } catch (err: any) {
      const message: string = err.message;

      Swal.fire({
        title: "Wrong Credentials!",
        text: message,
        icon: "error",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <React.Fragment>
      <Box
        component="form"
        onSubmit={handleSubmit(handleLoginUser)}
        maxWidth={500}
        margin={"0 auto"}
      >
        <TextField
          label="Email"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <UserIcon />
              </InputAdornment>
            ),
          }}
          sx={{ my: 2 }}
          {...register("username")}
          error={errors.username && true}
          helperText={errors.username?.message}
          fullWidth
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
          sx={{ my: 2 }}
          {...register("password")}
          error={errors.password && true}
          helperText={errors.password?.message}
          fullWidth
        />
        <Button variant="contained" color="success" size="large" type="submit">
          Login
        </Button>
        <Typography sx={{ my: 1 }}>
          {`Don't have an account? `}{" "}
          <Link href="/auth/register">Create Account</Link>
        </Typography>
      </Box>
    </React.Fragment>
  );
};
export default Login;
