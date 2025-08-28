import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Select,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Checkbox,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
  TableBody,
} from "@mui/material";
import {
  FormatListBulleted as FormatListIcon,
  HelpOutline as HelpIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { SelectChangeEvent } from "@mui/material/Select";
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
  const [format, setFormat] = useState("png");
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [areaOfInterest, setAreaOfInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formats = [
    { value: "tiff", label: "TIFF" },
    { value: "png", label: "PNG" },
    //{ value: "geojson", label: "GeoJSON" },
    //{ value: "kml", label: "KML" },
    // { value: "csv", label: "CSV" },
    { value: "xlsx", label: "Excel (XLSX)" },
  ];

  const handleFormatChange = (event: SelectChangeEvent<string>) => {
    const selectedFormat = event.target.value;
    setFormat(selectedFormat);
  };

  const handleLayerToggle = (layer: string) => {
    setSelectedLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  const handleDownload = async () => {
    if (selectedLayers.length === 0) {
      setError("Please select at least one layer to download");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Here you would implement your actual download logic
      // For example:
      //await downloadLayers({
      //   layers: selectedLayers,
      //   format,
      //   areaOfInterest,
      //   cqlFilter
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);
      onClose();
    } catch (err) {
      setError("Failed to download data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedLayers([]);
    setFormat("shp");
    setAreaOfInterest("");
    setError(null);
    setSuccess(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Format Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <FormatListIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Download Format</Typography>
              <Tooltip title="Choose the file format for your download">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <HelpIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <FormControl fullWidth>
              <Select value={format} onChange={handleFormatChange} displayEmpty>
                {formats.map((f) => (
                  <MenuItem key={f.value} value={f.value}>
                    {f.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Layer Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Geo Available Layers
            </Typography>
            <FormGroup>
              <TableContainer component={Paper}>
                <TableHead>
                  <TableRow>
                    <TableCell>Layer Title</TableCell>
                    <TableCell align="right">Select</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[].map((layer) => (
                    <TableRow key={layer}>
                      <TableCell>{layer}</TableCell>
                      <TableCell align="right">
                        <Checkbox
                          checked={selectedLayers.includes(layer)}
                          onChange={() => handleLayerToggle(layer)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableContainer>
            </FormGroup>
          </Paper>
        </Grid>

        {/* Area of Interest */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Area of Interest (Optional)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Enter coordinates or draw on map..."
              value={areaOfInterest}
              onChange={(e) => setAreaOfInterest(e.target.value)}
            />
          </Paper>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </Button>
            <Button
              variant="contained"
              startIcon={
                loading ? <CircularProgress size={20} /> : <DownloadIcon />
              }
              onClick={handleDownload}
              disabled={loading || selectedLayers.length === 0}
            >
              Download
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Download started successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DownloadPopup;
