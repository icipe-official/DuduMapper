"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  Paper,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  FormControlLabel,
  Checkbox,
  FormControl,
  Radio,
  RadioGroup,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import DashboardIcon from "@mui/icons-material/Dashboard";

import PeopleIcon from "@mui/icons-material/People";
import PostAddIcon from "@mui/icons-material/PostAdd";
import EmailIcon from "@mui/icons-material/Email";
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { ModelTraining } from "@mui/icons-material";
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  //gender: string;
  role: string;
  createdAt: string;
  wantsnotification: boolean;
  subject: string;
  body: string;
  sentAt: string;
}
interface SentEmail {
  id: string;
  email: string;
  subject: string;
  body: string;
  sentAt: string;
}
interface Model {
  id: string;
  title: string;
  country: string;
  region: string;
  year: number;
  month: number;
  model: string;
  description: string;
  highRisk: boolean;
  createdAt: string;
  updatedAt: string;
  file?: File;
}
const COLORS = ["#0088FE", "#FF8042"]; // User, Admin
export default function AdminPanelDynamic() {
  const [selectedSection, setSelectedSection] = useState<
    "dashboard" | "users" | "Posts" | "Emails" | "Models"
  >("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [post, setPosts] = useState<User[]>([]);
  const [model, setModels] = useState<Model[]>([]);
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const { user, loading } = useAuth();
  //dialog for add, delete, update logic model
  const [openDialog, setOpenDialog] = useState<
    "Add" | "Update" | "Delete" | "Instructions" | null
  >(null);
  //const for add, update, delete
  const [selectedAddModel, setSelectedAddModel] = useState<string[]>([]);
  const [selectedUpdateModel, setSelectedUpdateModel] = useState<string[]>([]);
  const [selectModelEdit, setSelectedModelEdit] = useState<Model | null>(null);
  const [selectedDeleteModelId, setSelectedDeletedModelId] = useState<string[]>(
    []
  );
  const [selectedDeleteModelStoreName, setSelectedDeletedModelStoreName] =
    useState<string[]>([]);

  //lets try to activate some buttons before others
  const [modelClicked, setModelClicked] = useState(false);
  const [updateGeoModel, setUpdateGeoModel] = useState(false);
  const handleClose = () => {
    setOpenDialog(null);
  };
  const router = useRouter();
  const hasRedirected = React.useRef(false);
  //dashboard logic
  const [data, setData] = useState<User[]>([]);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((users: User[]) => setData(users))
      .catch((err) => console.error("Error fetching users", err));
  }, []);

  const roleStats = [
    {
      name: "Users",
      value: data.filter((user) => user.role === "user").length,
    },
    {
      name: "Admins",
      value: data.filter((user) => user.role === "admin").length,
    },
  ];
  //users logic
  useEffect(() => {
    if (selectedSection === "users") {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.sort(
            (a: { id: number }, b: { id: number }) => a.id - b.id
          );
          setUsers(sorted);
        })
        .catch((err) => console.error("Failed to fetch users", err));
    }
  }, [selectedSection]);
  //posts logic
  useEffect(() => {
    if (selectedSection === "Posts") {
      fetch("/api/posts")
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.sort(
            (a: { id: number }, b: { id: number }) => a.id - b.id
          );
          setPosts(sorted);
        })
        .catch((err) => console.error("Failed to fetch posts", err));
    }
  }, [selectedSection]);
  //emails logic
  useEffect(() => {
    if (selectedSection === "Emails") {
      fetch("/api/sendEmail")
        .then((res) => res.json())
        .then((data: SentEmail[]) => {
          const sorted = data.sort(
            (a, b) =>
              new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
          );
          setEmails(sorted);
        })
        .catch((err) => console.error("Failed to fetch emails", err));
    }
  }, [selectedSection]);

  //models logic ie two parts: post and add
  //posting added models
  useEffect(() => {
    if (selectedSection === "Models") {
      fetch("/api/model")
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.sort(
            (a: { id: number }, b: { id: number }) => a.id - b.id
          );
          setModels(sorted);
        })
        .catch((err) => console.error("Failed to fetch models", err));
    }
  }, [selectedSection]);
  //adding models
  const [newModel, setNewModel] = useState<Partial<Model>>({
    title: "",
    country: "",
    region: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    model: "",
    description: "",
    highRisk: false,
  });
  //updating model
  const [updateModel, setUpdatedModel] = useState<Partial<Model>>({
    id: "",
    title: "",
    country: "",
    region: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    model: "",
    description: "",
    highRisk: false,
  });
  //prefill data for update model
  const handleOpenUpdateDialog = (modelData: Model) => {
    setUpdatedModel(modelData);
    setSelectedModelEdit(modelData);
    setOpenDialog("Update");
  };
  //handle upload for add
  const handleFileAddChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/geoserverupload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Geo upload failed : ${errorText}`);
      }

      const data = await res.json();

      setNewModel((prev) => ({
        ...prev,
        model: data.storeName,
        file,
      }));
      toast.success("File uploaded Geoserver successfully");
    } catch (error) {
      console.error(" upload failed", error);
    }
  };
  //handle upload for update
  const handleFileUpdateChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    /*uploads to geoserver
    const workspace = "dudu";
    const storeName = file.name.replace(/\.[^/.]+$/, "");
    */

    const formData = new FormData();
    formData.append("file", file);

    if (updateModel.model) {
      formData.append("storeName", updateModel.model);
    }

    try {
      const res = await fetch("/api/geoserverupload", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Geo upload failed : ${errorText}`);
      }
      const data = await res.json();

      setUpdatedModel((prev) => ({
        ...prev,
        model: data.storeName,
        file,
      }));
      toast.success("Model updated successfully");
    } catch (error) {
      console.error(" update failed", error);
    }
  };
  //HANDLE ADD MODEL SUBMISSION
  const handleAddModel = async () => {
    try {
      const res = await fetch("/api/model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newModel),
      });
      if (!res.ok) throw new Error("Failed to add model");
      const added = await res.json();
      setModels((prev) => [...prev, added]);
      setNewModel({
        title: "",
        country: "",
        region: "",
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        model: "",
        description: "",
        highRisk: false,
      });
      toast.success("Model added successfully");
    } catch (error) {
      toast.error("couldn`t add a Model");
    }
  };
  //HANDLE UPDATE MODEL
  const handleUpdateModel = async () => {
    try {
      const res = await fetch("/api/model", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateModel),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setModels((prev) =>
        prev.map((model) => (model.id === updated.id ? updated : model))
      );
      setUpdatedModel({
        id: "",
        title: "",
        country: "",
        region: "",
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        model: "",
        description: "",
        highRisk: false,
      });
      toast.success("Model updated successfully");
    } catch (error) {
      toast.error("couldn`t update a Model");
    }
  };
  //HANDLE DELETE MODEL
  //ALSO DELETE FROM GEOSERVER
  const handleDeleteModel = async () => {
    try {
      //first delete from geoserver

      //lets use small storename to minimize mixing since its a name
      const storename = selectedDeleteModelStoreName[0];
      const geoRes = await fetch(
        `/api/geoserverupload?storeName=${storename}`,
        {
          method: "DELETE",
        }
      );
      if (!geoRes.ok) {
        console.error("Error deleting model:", await geoRes.text());
        throw new Error(" Fialed to delete from geoserver");
      }
      toast.success("Model deleted from geoserver successfully");
      setSelectedDeletedModelStoreName([]);

      //then delete from adatabase
      const res = await fetch("/api/model", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: selectedDeleteModelId }),
      });
      if (!res.ok) throw new Error("Failed to delete model");
      const deletedId: string[] = await res.json();
      setModels((prev) =>
        prev.filter((model) => !deletedId.includes(model.id))
      );
      toast.success("Model deleted from database successfully");
      //reset
      setSelectedDeletedModelId([]);
    } catch (error) {
      console.error("Error deleting model:", error);
      toast.error("couldn`t delete a Model");
    }
  };

  //delete emails in database
  const handleDeleteEmails = async () => {
    try {
      const res = await fetch("/api/sendEmail", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Emails Deleted Successfully");
      } else {
        throw new Error("Failed to delete Emails");
      }
    } catch (error) {
      console.error("Error deleting emails", error);
      toast.error("Failed to delete emails");
    }
  };

  //restricting user access to admin
  useEffect(() => {
    if (
      !loading &&
      (!user || user.role !== "admin") &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      toast.error("Unauthorized Access.");
      router.push("/auth/AccountPage");
    }

    if (!loading && user && user.role === "admin" && !hasRedirected.current) {
      // Optional: Prevent duplicate toasts
      hasRedirected.current = true;

      // delay a little bit before greeting
      setTimeout(() => {
        toast.success("Welcome Admin!");
      }, 1000);
    }
  }, [user, loading, router]);

  const renderContent = () => {
    switch (selectedSection) {
      case "Posts":
        return (
          <>
            <Typography variant="h5" gutterBottom>
              📝 Posts
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Manage all posts here.
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="Posts Table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Subscribed</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {post.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>{post.id}</TableCell>
                      <TableCell>{post.email}</TableCell>
                      <TableCell>
                        {post.wantsnotification ? "Yes" : "No"}
                      </TableCell>
                      <TableCell>{post.role}</TableCell>
                      <TableCell>
                        {new Date(post.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box>
              <Button
                variant="contained"
                color="success"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/sendEmail", {
                      method: "POST",
                    });
                    if (!res.ok) throw new Error("Failed to send Emails");
                    const data = await res.json();
                    toast.success(data.message);
                  } catch (error) {
                    toast.error("Failed to send Emails to users");
                  }
                }}
                sx={{
                  mt: 2,
                }}
              >
                Send Emails
              </Button>
            </Box>
          </>
        );
      case "users":
        return (
          <>
            <Typography variant="h5" gutterBottom>
              👥 Users
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Manage all users here.
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    {/*<TableCell>Gender</TableCell>*/}
                    <TableCell>Role</TableCell>
                    <TableCell>Created </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.firstName}</TableCell>
                      <TableCell>{user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      {/*<TableCell>{user.gender}</TableCell>*/}
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Button variant="contained" color="success" disabled>
                UpdatesetModels
              </Button>
              <Button variant="contained" color="error" disabled>
                Delete
              </Button>
            </Box>
          </>
        );
      case "dashboard":
        return (
          <>
            <Typography variant="h5" gutterBottom>
              📊 Dashboard
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              User Stats!
            </Typography>

            <Paper elevation={3} sx={{ p: 3, width: 400, margin: "auto" }}>
              <Typography variant="h6" align="center" gutterBottom>
                User Role Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {roleStats.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </>
        );
      case "Emails":
        return (
          <>
            <Typography variant="h5" gutterBottom>
              📧 Emails
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Manage all sent emails here.
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="sent emails table">
                <TableHead>
                  <TableRow>
                    <TableCell>UUID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Body</TableCell>
                    <TableCell>Sent At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell>{email.id}</TableCell>
                      <TableCell>{email.email}</TableCell>
                      <TableCell>{email.subject}</TableCell>
                      <TableCell>{email.body}</TableCell>
                      <TableCell>
                        {new Date(email.sentAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteEmails}
                disabled //</Box>={emails.length === 0}
                sx={{ mt: 2 }}
              >
                Delete
              </Button>
            </Box>
          </>
        );
      case "Models":
      default:
        return (
          <>
            <Typography variant="h5" gutterBottom>
              🌍 Models
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Manage all models here ( New and Posted models)
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="models table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>HighRisk</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Updated At</TableCell>
                    <TableCell>Notifications</TableCell>
                    <TableCell>Edit</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {model.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>{model.id}</TableCell>
                      <TableCell>{model.title}</TableCell>
                      <TableCell>{model.country}</TableCell>
                      <TableCell>{model.region}</TableCell>
                      <TableCell>{model.year}</TableCell>
                      <TableCell>{model.month}</TableCell>
                      <TableCell>{model.model}</TableCell>
                      <TableCell>{model.description}</TableCell>
                      <TableCell>{model.highRisk ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        {new Date(model.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(model.updatedAt).toLocaleString()}
                      </TableCell>
                      {/**should correct this n/a to provide notifications */}
                      <TableCell>N/A</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={() => handleOpenUpdateDialog(model)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* editable row for input */}

                  {/*Add dialogue */}
                  <Dialog
                    open={openDialog === "Add"}
                    onClose={handleClose}
                    maxWidth="md"
                    fullWidth
                  >
                    <DialogTitle>Add New Model</DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr", // 2 columns
                          gap: 3,
                          maxWidth: 800,
                          margin: "auto",
                        }}
                      >
                        {/* Left Column */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              ID
                            </Typography>
                            <TextField
                              fullWidth
                              value={newModel.id || "Auto"}
                              disabled
                              size="small"
                            />
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Title
                            </Typography>
                            <TextField
                              fullWidth
                              value={newModel.title || ""}
                              onChange={(e) =>
                                setNewModel({
                                  ...newModel,
                                  title: e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Country
                            </Typography>
                            <TextField
                              fullWidth
                              value={newModel.country || ""}
                              onChange={(e) =>
                                setNewModel({
                                  ...newModel,
                                  country: e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Region
                            </Typography>
                            <TextField
                              fullWidth
                              value={newModel.region || ""}
                              onChange={(e) =>
                                setNewModel({
                                  ...newModel,
                                  region: e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Year
                            </Typography>
                            <TextField
                              fullWidth
                              type="number"
                              value={newModel.year || ""}
                              onChange={(e) =>
                                setNewModel({
                                  ...newModel,
                                  year: +e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>
                        </Box>

                        {/* Right Column */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Month
                            </Typography>
                            <TextField
                              fullWidth
                              type="number"
                              value={newModel.month || ""}
                              onChange={(e) =>
                                setNewModel({
                                  ...newModel,
                                  month: +e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Model
                            </Typography>
                            <TextField
                              fullWidth
                              value={newModel.model || ""}
                              onChange={(e) =>
                                setNewModel({
                                  ...newModel,
                                  model: e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Description
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={newModel.description || ""}
                              onChange={(e) =>
                                setNewModel({
                                  ...newModel,
                                  description: e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>

                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              High Risk
                            </Typography>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  color="success"
                                  checked={newModel.highRisk || false}
                                  onChange={(e: { target: { checked: any } }) =>
                                    setNewModel({
                                      ...newModel,
                                      highRisk: e.target.checked,
                                    })
                                  }
                                />
                              }
                              label="High Risk"
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Upload Geo{" "}
                            </Typography>
                            <input
                              type="file"
                              accept=".tiff"
                              onChange={handleFileAddChange}
                            />
                          </Box>
                        </Box>
                      </Box>

                      {/* Action Button */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 3,
                        }}
                      >
                        <Button
                          onClick={handleAddModel}
                          variant="contained"
                          color="success"
                          disabled={
                            !newModel.title ||
                            !newModel.country ||
                            !newModel.region ||
                            !newModel.year ||
                            !newModel.month ||
                            !newModel.file?.name
                          }
                        >
                          Add Model
                        </Button>
                      </Box>
                    </DialogContent>
                  </Dialog>

                  {/*update dialogue */}
                  <Dialog
                    open={openDialog === "Update"}
                    onClose={handleClose}
                    maxWidth="md"
                    fullWidth
                  >
                    <DialogTitle>Update Model</DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr", // 2 columns
                          gap: 3,
                          maxWidth: 800,
                          margin: "auto",
                        }}
                      >
                        {/* Left Column */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              ID
                            </Typography>
                            <TextField
                              fullWidth
                              value={updateModel.id || "Auto"}
                              disabled
                              size="small"
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Title
                            </Typography>
                            <TextField
                              fullWidth
                              value={updateModel.title || ""}
                              onChange={(e) =>
                                setUpdatedModel({
                                  ...updateModel,
                                  title: e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Country
                            </Typography>
                            <TextField
                              fullWidth
                              value={updateModel.country || ""}
                              onChange={(e) =>
                                setUpdatedModel({
                                  ...updateModel,
                                  country: e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Region
                            </Typography>
                            <TextField
                              fullWidth
                              value={updateModel.region || ""}
                              onChange={(e) =>
                                setUpdatedModel({
                                  ...updateModel,
                                  region: e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Year
                            </Typography>
                            <TextField
                              fullWidth
                              type="number"
                              value={updateModel.year || ""}
                              onChange={(e) =>
                                setUpdatedModel({
                                  ...updateModel,
                                  year: +e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>
                        </Box>

                        {/* Right Column */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Month
                            </Typography>
                            <TextField
                              fullWidth
                              type="number"
                              value={updateModel.month || ""}
                              onChange={(e) =>
                                setUpdatedModel({
                                  ...updateModel,
                                  month: +e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Model
                            </Typography>
                            <TextField
                              fullWidth
                              value={updateModel.model || ""}
                              onChange={(e) =>
                                setUpdatedModel({
                                  ...updateModel,
                                  model: e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Description
                            </Typography>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={updateModel.description || ""}
                              onChange={(e) =>
                                setUpdatedModel({
                                  ...updateModel,
                                  description: e.target.value,
                                })
                              }
                              size="small"
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              High Risk
                            </Typography>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  color="success"
                                  checked={updateModel.highRisk || false}
                                  onChange={(e: { target: { checked: any } }) =>
                                    setUpdatedModel({
                                      ...updateModel,
                                      highRisk: e.target.checked,
                                    })
                                  }
                                />
                              }
                              label="High Risk"
                            />
                          </Box>
                          {/*check for model */}
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              {" "}
                              Want To Update Tiff File?{" "}
                            </Typography>
                            <RadioGroup
                              row
                              value={updateGeoModel ? "yes" : "no"}
                              onChange={(e) =>
                                setUpdateGeoModel(e.target.value === "yes")
                              }
                            >
                              <FormControlLabel
                                value="yes"
                                control={<Radio color="success" />}
                                label="Yes"
                              />
                              <FormControlLabel
                                value="no"
                                control={<Radio color="success" />}
                                label="No"
                              />
                            </RadioGroup>
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Upload Geospatial{" "}
                            </Typography>

                            <input
                              type="file"
                              accept=".tiff"
                              onChange={handleFileUpdateChange}
                              disabled={!updateGeoModel}
                            />
                          </Box>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 3,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="success"
                          disabled={
                            !updateModel.title ||
                            !updateModel.model ||
                            !updateModel.country ||
                            !updateModel.region
                          }
                          onClick={handleUpdateModel}
                        >
                          Update
                        </Button>
                      </Box>
                    </DialogContent>
                  </Dialog>
                  {/* Delete Dialog */}
                  <Dialog
                    open={openDialog === "Delete"}
                    maxWidth="md"
                    onClose={handleClose}
                    fullWidth
                  >
                    <DialogTitle>Delete Model</DialogTitle>
                    <DialogContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr", // 2 columns
                          gap: 3,
                          maxWidth: 800,
                          margin: "auto",
                        }}
                      >
                        {/* Left Column */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <TableContainer component={Paper}>
                            <Table size="small" aria-label="models table">
                              <TableHead>
                                <TableRow>
                                  <TableCell>ID</TableCell>
                                  <TableCell>Title</TableCell>
                                  <TableCell>Country</TableCell>
                                  <TableCell>Region</TableCell>
                                  <TableCell>Year</TableCell>
                                  <TableCell>Month</TableCell>
                                  <TableCell>Model</TableCell>
                                  <TableCell>Description</TableCell>
                                  <TableCell>HighRisk</TableCell>

                                  <TableCell
                                    sx={{
                                      color: "red",
                                      fontWeight: "bold",
                                      marginRight: "10px",
                                    }}
                                  >
                                    Select
                                  </TableCell>
                                </TableRow>
                              </TableHead>

                              <TableBody>
                                {model.map((model) => (
                                  <TableRow key={model.id}>
                                    <TableCell>{model.id}</TableCell>
                                    <TableCell>{model.title}</TableCell>
                                    <TableCell>{model.country}</TableCell>
                                    <TableCell>{model.region}</TableCell>
                                    <TableCell>{model.year}</TableCell>
                                    <TableCell>{model.month}</TableCell>
                                    <TableCell>{model.model}</TableCell>
                                    <TableCell>{model.description}</TableCell>
                                    <TableCell>
                                      {model.highRisk ? "Yes" : "No"}
                                    </TableCell>

                                    <TableCell>
                                      <Checkbox
                                        color="success"
                                        checked={selectedDeleteModelId.includes(
                                          model.id
                                        )}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedDeletedModelId(
                                              (prev) => [...prev, model.id]
                                            );
                                            setSelectedDeletedModelStoreName(
                                              (prev) => [...prev, model.model]
                                            );
                                          } else {
                                            setSelectedDeletedModelId((prev) =>
                                              prev.filter(
                                                (id) => id !== model.id
                                              )
                                            );
                                            setSelectedDeletedModelStoreName(
                                              (prev) =>
                                                prev.filter(
                                                  (name) => name !== model.model
                                                )
                                            );
                                          }
                                        }}
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                        {/* Right Column */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        ></Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 3,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="error"
                          disabled={selectedDeleteModelId.length === 0}
                          onClick={handleDeleteModel}
                        >
                          Delete
                        </Button>
                      </Box>
                    </DialogContent>
                  </Dialog>
                  {/*Instruction Dialog*/}

                  <Dialog
                    open={openDialog === "Instructions"}
                    onClose={handleClose}
                    maxWidth="md"
                    fullWidth
                  >
                    <DialogTitle>
                      🚨 Important Model Naming Instruction
                    </DialogTitle>
                    <DialogContent>
                      <Typography variant="body2" component="div">
                        <p
                          style={{
                            color: "green",
                            fontWeight: "bold",
                            fontSize: "16px",
                          }}
                        >
                          Please save your model with a unique name before
                          uploading.
                        </p>
                        To avoid confusion when adding or updating models in
                        GeoServer, do NOT include the following in your model
                        name:
                        <ul>
                          <li>
                            ❌ Month (e.g., &quot;January&quot;,
                            &quot;Feb&quot;, &quot;08&quot;)
                          </li>
                          <li>
                            ❌ Region or country names (e.g., &quot;Kenya&quot;,
                            &quot;Nairobi&quot;)
                          </li>
                          <li>
                            ❌ Year or date (e.g., &quot;2025&quot;,
                            &quot;23_08&quot;)
                          </li>
                        </ul>
                        ✅ Instead, use a descriptive and specific name that
                        uniquely identifies your model based on its purpose,
                        type, or feature.
                      </Typography>
                    </DialogContent>
                  </Dialog>
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: 2,
                gap: 1,
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                color="success"
                onClick={() => setOpenDialog("Add")}
                disabled={!modelClicked}
              >
                Add
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={!selectModelEdit}
                onClick={() => {
                  if (selectModelEdit) {
                    setOpenDialog("Update");
                  }
                }}
              >
                Update
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpenDialog("Delete")}
                disabled={!modelClicked}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setOpenDialog("Instructions");
                  setModelClicked(true);
                }}
              >
                Model Guide
              </Button>
            </Box>
          </>
        );
    }
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            sm: "row",
            xs: "column",
          },
          width: {
            xs: "95vw", //mobile
            sm: "85vw",
            md: "80vw",
            lg: "75vw",
            xl: "75vw", //extra 1/2large
          },
          height: {
            xs: "95vw", //mobile
            sm: "80vw",
            md: "60vw",
            lg: "50vw",
            xl: "40vw", //extra 1/2large
          },
          borderRadius: "20px",
          boxShadow: "6px 6px 12px #babecc, -6px -6px 12px #ffffff",
          mt: 4,

          //backgroundColor: "#e0e5ec",
        }}
      >
        {/* Side Drawer */}
        <Box
          sx={{
            width: {
              sm: 180,
              xs: "100%",
            },
            borderRight: "1px solid #ccc",
            padding: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Admin Panel
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem
              button
              selected={selectedSection === "dashboard"}
              onClick={() => setSelectedSection("dashboard")}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem
              button
              selected={selectedSection === "users"}
              onClick={() => setSelectedSection("users")}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItem>
            <ListItem
              button
              selected={selectedSection === "Posts"}
              onClick={() => setSelectedSection("Posts")}
            >
              <ListItemIcon>
                <PostAddIcon />
              </ListItemIcon>
              <ListItemText primary="Posts" />
            </ListItem>
            <ListItem
              button
              selected={selectedSection === "Emails"}
              onClick={() => setSelectedSection("Emails")}
            >
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText primary="Emails" />
            </ListItem>
            <ListItem
              button
              selected={selectedSection === "Models"}
              onClick={() => setSelectedSection("Models")}
            >
              <ListItemIcon>
                <ModelTraining />
              </ListItemIcon>
              <ListItemText primary="Models" />
            </ListItem>
          </List>
        </Box>

        {/* Main Content */}

        <Box
          sx={{
            width: "100%",
            flexGrow: 1,
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            textAlign: "center",
            overflowY: "auto",
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
}
