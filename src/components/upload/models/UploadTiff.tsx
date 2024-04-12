import UploadFile from "@mui/icons-material/UploadFile";
import Box from "@mui/material/Box";
("use client");

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import { FormEvent, useRef, useState } from "react";
import { BASE_SERVER_API } from "@/lib/constants";
import Swal from "sweetalert2";

registerPlugin(FilePondPluginFileValidateType);

const UploadTiff = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [coverageStore, setCoverageStore] = useState("");
  const [coverageName, setCoverageName] = useState("");
  const pond = useRef<FilePond>(null);
  const disabled =
    files.length == 0 || coverageName.length == 0 || coverageStore.length == 0;

  const UPLOAD_URL =
    BASE_SERVER_API +
    `/geoserver/upload-tiff?coverageStore=${coverageStore}&coverageName=${coverageName}`;

  const resetForm = () => {
    setFiles([]);
    setCoverageName("");
    setCoverageStore("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pond.current) {
      pond.current
        .processFiles()
        .then(() => {
          // reset form
          resetForm();
          Swal.fire({
            title: "Successfull!",
            text: "Tiff file uploaded successfully",
            icon: "success",
            showConfirmButton: false,
          });
        })
        .catch(() => {
          Swal.fire({
            title: "Upload failed!",
            text: "Failed to upload tiff file. Make sure you've selected valid TIFF file",
            icon: "error",
            showConfirmButton: false,
          });
        });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} px={5} py={3}>
      <TextField
        variant="outlined"
        label="Coverage Store"
        value={coverageStore}
        onChange={(e) => setCoverageStore(e.target.value)}
        fullWidth
        required
        sx={{ my: 2 }}
      />
      <TextField
        variant="outlined"
        label="Coverage Name"
        value={coverageName}
        onChange={(e) => setCoverageName(e.target.value)}
        fullWidth
        required
        sx={{ my: 2 }}
      />
      <Box my={2}>
        <FilePond
          name="file"
          acceptedFileTypes={["image/tiff"]}
          files={files}
          onupdatefiles={setFiles}
          ref={pond}
          credits={false}
          allowRevert={false}
          instantUpload={false}
          allowProcess={false}
          checkValidity={true}
          labelIdle='Drag & Drop your file or <span class="filepond--label-action">Browse</span>'
          server={UPLOAD_URL}
        />
      </Box>
      <Button
        type="submit"
        variant="contained"
        color="success"
        size="large"
        sx={{ my: 2 }}
        startIcon={<UploadFile />}
        disabled={disabled}
      >
        Upload
      </Button>
    </Box>
  );
};

export default UploadTiff;
