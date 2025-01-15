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
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { geoServerBaseUrl } from "@/api/requests";
import { green } from "@mui/material/colors";

const DOWNLOAD_URL =
  "/geoserver/vector/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=vector:download_v&outputFormat=FORMAT";

interface DownloadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  cqlFilter: string;
}

const DownloadPopup: React.FC<DownloadPopupProps> = ({
  isOpen,
  onClose,
  cqlFilter,
}) => {
  const [selectedFormat, setSelectedFormat] = useState("CSV");
  const [downloading, setLoading] = React.useState(false);
  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFormat(event.target.value);
  };

  const handleDownload = () => {
    setLoading(true);
    axiosDownloadFile();
  };
  const axiosDownloadFile = () => {
    let url = geoServerBaseUrl + DOWNLOAD_URL.replace("FORMAT", selectedFormat);
    console.log(`URL ${url}`);
    if (cqlFilter) {
      url += `&cql_filter=${cqlFilter}`;
      console.log(`URL ${url}`);
    }

    return axios
      .get(url, {
        responseType: "blob",
      })
      .then((response) => {
        const href = window.URL.createObjectURL(response.data);

        const anchorElement = document.createElement("a");

        anchorElement.href = href;
        anchorElement.download = "Occurrence";

        document.body.appendChild(anchorElement);
        anchorElement.click();

        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(href);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.log("error: ", error);
      });
  };

  return (
    <Box
      className={`download-popup ${isOpen ? "open" : "closed"}`}
      sx={{
        position: "fixed",
        top: "50%",
        left: "5%",
        width: "250px",

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
        ></Typography>
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                m: 1,
                position: "relative",
              }}
            >
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
                disabled={downloading}
                onClick={handleDownload}
              >
                Download
              </Button>
              {downloading && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: green[500],
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                  }}
                />
              )}
            </Box>
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DownloadPopup;
