"use client";

import RegisterUser from "@/components/users/RegisterUser";
import { Box, Link, Typography } from "@mui/material";

const Register = () => {
  return (
    <Box py={4} px={3}>
      <RegisterUser />
      <Box my={2}>
        <Typography>
          Already have an account? <Link href="/auth/login">Login</Link>
        </Typography>
      </Box>
    </Box>
  );
};
export default Register;
