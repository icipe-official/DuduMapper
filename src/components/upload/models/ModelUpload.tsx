"use client";

import { Box, Divider, Grid, Typography } from "@mui/material";
import ShapefileUpload from "./ShapefileUpload";
import UploadTiff from "./UploadTiff";

function ModelUpload() {
  // image/tiff
  // application/x-zip-compressed

  const handleUpload = () => {
    // dispatch(uploadModel({ displayName, maxValue }));
  };

  return (
    <Box maxWidth={1 / 2} margin="0 auto" boxShadow={2} mt={10}>
      <Grid container>
        <Grid item sm={12} px={4} py={3}>
          <Typography variant="h4" fontWeight={"bold"}>
            Upload Shapefile
          </Typography>
          <ShapefileUpload />
        </Grid>
        <Grid item sm={12} my={5}>
          <Divider />
        </Grid>
        <Grid item sm={12} px={4} py={3}>
          <Typography variant="h4" fontWeight={"bold"}>
            Upload Tif file
          </Typography>
          <UploadTiff />
        </Grid>
      </Grid>
    </Box>
  );
}

export default ModelUpload;
