import { Button, Box, Grid, TextField, CircularProgress } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { ChangeEvent, useState } from "react";

function ModelUpload() {
  const [displayName, setDisplayName] = useState("");
  const [maxValue, setMaxValue] = useState<String>("");
  const displayNameValid = displayName !== "";
  const maxValueValid = maxValue !== "";

  const [correctFileType, setCorrectFileType] = useState(false);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      const isCorrectFileType =
        e.target.files![0].type === "image/tiff" ||
        e.target.files![0].type === "application/x-zip-compressed";
      setCorrectFileType(isCorrectFileType);
    }
  };

  const handleUpload = () => {
    // dispatch(uploadModel({ displayName, maxValue }));
  };

  return (
    <form>
      <Box sx={{ height: "75%" }}>
        <Grid container direction="row" alignItems="center">
          <TextField
            variant="outlined"
            label={"Display name:"}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={!displayNameValid}
            helperText={!displayNameValid ? "Display name cannot be empty" : ""}
            data-testid="displayNameInput"
          />
          <TextField
            variant="outlined"
            label={"Maximum value:"}
            value={maxValue}
            type="number"
            onChange={(e) => setMaxValue(e.target.value)}
            error={!maxValueValid}
            helperText={
              !maxValueValid
                ? "Maximum value cannot be empty"
                : "The maximum value of the model"
            }
            sx={{ paddingLeft: "5px" }}
            data-testid="maxValueInput"
          />
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
          >
            Choose model file
            <input
              type="file"
              accept=".tif, .zip"
              data-testid="fileUpload"
              hidden
              onChange={handleFileSelect}
            />
          </Button>
          {/* <Typography>
            {currentUploadedModel
              ? correctFileType
                ? currentUploadedModel.name
                : 'Incorrect file type - tif or zip only'
              : 'No file chosen'}
          </Typography> */}
        </Grid>

        <Button
          variant="contained"
          data-testid="uploadButton"
          onClick={handleUpload}
          // disabled={uploadDisabled}
        >
          Upload Model
        </Button>
        {/* <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <CircularProgress />
        </div> */}
      </Box>
    </form>
  );
}

export default ModelUpload;
