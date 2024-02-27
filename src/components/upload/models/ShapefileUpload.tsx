import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import UploadFile from "@mui/icons-material/UploadFile";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginValidateType from "filepond-plugin-file-validate-type";
import { FormEvent, useRef, useState } from "react";
import Swal from "sweetalert2";
import { BASE_SERVER_API } from "@/lib/constants";

import "filepond/dist/filepond.min.css";

registerPlugin(FilePondPluginValidateType);

const ShapefileUpload = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [datasource, setDatasource] = useState("");
  const pond = useRef<FilePond>(null);

  const UPLOAD_URL = `${BASE_SERVER_API}/geoserver/upload-shapefile?datastore=${datasource}`;

  const resetForm = () => {
    setFiles([]);
    setDatasource("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (pond.current) {
      pond.current
        .processFiles()
        .then(() => {
          resetForm();
          // uploaded successfully
          Swal.fire({
            title: "Successful!",
            text: `Shapefile uploaded successfully.`,
            icon: "success",
            showConfirmButton: false,
          });
        })
        .catch(() => {
          Swal.fire({
            title: "Failed!",
            text: "Failed to upload. Make sure you select valid shapefile or zip folder with valid shapefile.",
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
        label="Data Source"
        value={datasource}
        onChange={(e) => setDatasource(e.target.value)}
        sx={{ my: 3 }}
        required
        fullWidth
      />
      <FilePond
        name="file"
        files={files}
        onupdatefiles={setFiles}
        acceptedFileTypes={["application/zip"]}
        labelIdle='Drag & Drop your file or <span class="filepond--label-action">Browse</span>'
        credits={false}
        instantUpload={false}
        checkValidity={true}
        allowRevert={false}
        allowProcess={false}
        ref={pond}
        server={{
          url: `${UPLOAD_URL}`,
        }}
      />
      <Button
        variant="contained"
        color="success"
        sx={{ my: 3 }}
        startIcon={<UploadFile />}
        type="submit"
        size="large"
        disabled={files.length == 0 || datasource.length == 0}
      >
        Upload
      </Button>
    </Box>
  );
};
export default ShapefileUpload;
