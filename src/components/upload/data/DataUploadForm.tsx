"use client";

import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Typography,
  colors,
} from "@mui/material";
import UploadFile from "@mui/icons-material/UploadFile";
import x from "@mui/icons-material/FileDownload";
import { FormEvent, useRef, useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import Swal from "sweetalert2";
import "filepond/dist/filepond.min.css";
import FileDownload from "@mui/icons-material/FileDownload";

registerPlugin(FilePondPluginFileValidateType);

const SERVER_URI = process.env.NEXT_PUBLIC_API_SERVER;

const DataUploadForm = () => {
  const UPLOAD_URI = SERVER_URI + "/ingest/template/generic";
  const [files, setFiles] = useState<any[]>([]);
  const pond = useRef<FilePond>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // validate and submit
    event.preventDefault();

    if (pond.current) {
      pond.current.processFiles().then(() => {
        // reset files
        setFiles([]);
        // upload successfull
        Swal.fire({
          title: "Successfully uploaded",
          text: "File was uploaded successfully, data may take a few minutes to update.",
          icon: "success",
          showCancelButton: false,
          showCloseButton: false,
          showConfirmButton: false,
        });
      });
    }
  };

  return (
    <Container>
      <Grid container gap={1}>
        <Grid item sm={12} md={5}>
          <Typography variant="h4">Upload Template</Typography>
          <Divider sx={{ my: 3 }} />
          <Typography fontSize={"1.3rem"} mb={3} color={colors.grey[700]}>
            Below is provided template sample that you can use to upload your
            data. <br /> Click on the download link below to get a copy.
          </Typography>
          <Button
            variant="outlined"
            color="success"
            startIcon={<FileDownload />}
          >
            Get Template
          </Button>
        </Grid>
        <Grid item sm={12} md={6}>
          <Box gap={4} component={"form"} onSubmit={handleSubmit}>
            <Typography variant="h4">
              <UploadFile /> Upload CSV Data File
            </Typography>
            <Divider sx={{ my: 3 }} />
            <FilePond
              ref={pond}
              files={files}
              onupdatefiles={setFiles}
              acceptedFileTypes={["text/csv"]}
              name="file"
              labelIdle='Drag & Drop your file or <span class="filepond--label-action">Browse</span>'
              checkValidity={true}
              credits={false}
              instantUpload={false}
              allowRevert={false}
              server={{
                url: UPLOAD_URI,
                headers: {},
              }}
            />

            <Button
              variant="contained"
              color="success"
              type="submit"
              endIcon={<UploadFile />}
              disabled={files.length == 0}
            >
              Upload
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
export default DataUploadForm;
