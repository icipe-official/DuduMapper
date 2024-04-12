"use client";

import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PhoneIcon from "@mui/icons-material/Phone";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import React, { useState } from "react";

const schema = yup
  .object({
    firstName: yup.string().required().label("First Name"),
    lastName: yup.string().required().label("Last Name"),
    email: yup.string().email().required().label("Email"),
    phoneNumber: yup.string().required().label("Phone Number"),
    password: yup.string().min(8).required().label("Password"),
  })
  .required();

const RegisterUser = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleRegisterUser = (data: any) => {
    console.log(data);
  };

  return (
    <React.Fragment>
      <Box component="form" onSubmit={handleSubmit(handleRegisterUser)}>
        <TextField
          variant="outlined"
          label="First Name"
          sx={{ my: 1 }}
          {...register("firstName")}
          error={errors.firstName && true}
          helperText={errors.firstName?.message}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          variant="outlined"
          label="Last Name"
          sx={{ my: 1 }}
          {...register("lastName")}
          error={errors.lastName && true}
          helperText={errors.lastName?.message}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          variant="outlined"
          label="Email"
          sx={{ my: 1 }}
          {...register("email")}
          error={errors.email && true}
          helperText={errors.email?.message}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          variant="outlined"
          label="Phone No"
          type="tel"
          sx={{ my: 1 }}
          {...register("phoneNumber")}
          error={errors.phoneNumber && true}
          helperText={errors.phoneNumber?.message}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          variant="outlined"
          label="Password"
          sx={{ my: 1 }}
          type={showPassword ? "text" : "password"}
          {...register("password")}
          error={errors.password && true}
          helperText={errors.password?.message}
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="success"
          type="submit"
          size="large"
          sx={{ my: 1 }}
        >
          Create User
        </Button>
      </Box>
    </React.Fragment>
  );
};
export default RegisterUser;
