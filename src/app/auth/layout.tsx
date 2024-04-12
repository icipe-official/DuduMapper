import { Container, Grid } from "@mui/material";
import { BASE_PATH } from "@/lib/constants";
import Image from "next/image";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Grid container borderRadius={3} boxShadow={3} py={3} px={2}>
        <Grid item md={5}>
          <Image
            src={`${BASE_PATH}/vector-atlas-logo.svg`}
            width={0}
            height={0}
            alt="Vector Atlas"
            style={{
              height: "auto",
              width: "100%",
              position: "relative",
              top: "35%",
            }}
          />
        </Grid>
        <Grid item md={7} px={3} py={4}>
          {children}
        </Grid>
      </Grid>
    </Container>
  );
};
export default AuthLayout;
