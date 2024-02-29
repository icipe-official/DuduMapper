import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Radio,
  RadioGroup,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import {downloadOccurrence} from "@/api/occurrence";

interface DownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: string) => void;
}

const DownloadPopup: React.FC<DownloadPopupProps> = ({
  isOpen,
  onClose,
  onDownload,
}) => {
  const [selectedFormat, setSelectedFormat] = useState("CSV");

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFormat(event.target.value);
  };

  const handleDownload = () => {
      downloadOccurrence(selectedFormat);

  };


  return (
    <Box
      className={`download-popup ${isOpen ? "open" : "closed"}`}
      sx={{
        position: "absolute",
        top: "40%",
        left: "13%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
        borderRadius: "6px ",
        p: 4,
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: "5px",
          right: "5px",
          marginBottom: "15px",
        }}
      >
        <CloseIcon />
      </IconButton>

      <Grid item>
        <Typography
          variant="h2"
          sx={{
            fontSize: "1.8rem",
            fontWeight: "600",
            marginBottom: "15px",
            color: "#555",
          }}
        >
          Download Data
        </Typography>
      </Grid>
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography
            variant="h2"
            sx={{
              fontSize: "1.1rem",
              fontWeight: "500",
              marginBottom: "0rem",
            }}
          >
            Select data download format
          </Typography>
        </Grid>
        <Grid item>
          <RadioGroup
            aria-label="download-format"
            name="download-format"
            value={selectedFormat}
            onChange={handleFormatChange}
          >
            <FormControlLabel
              value="CSV"
              control={<Radio color="success" />}
              label="CSV"
            />
            {/*<FormControlLabel*/}
            {/*  value="Excel"*/}
            {/*  control={<Radio color="success" />}*/}
            {/*  label="Excel"*/}
            {/*/>*/}
            <FormControlLabel
              value="json"
              control={<Radio color="success" />}
              label="GeoJSON"
            />
            <FormControlLabel
              value="KML"
              control={<Radio color="success" />}
              label="KML"
            />
            <FormControlLabel
              value="shape-zip"
              control={<Radio color="success" />}
              label="SHP"
            />
            {/* Add more options as needed */}
          </RadioGroup>
        </Grid>
        <Grid item>
          <div className="button-container-style">
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#2e7d32",
                "&:hover": {
                  backgroundColor: "#ebbd40",
                  // Background color on hover
                },
              }}
              size="small"
              style={{ fontSize: "0.7rem" }}
              onClick={handleDownload}
            >
              Download
            </Button>
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DownloadPopup;
