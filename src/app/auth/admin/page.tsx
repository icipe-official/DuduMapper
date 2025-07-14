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
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PostAddIcon from "@mui/icons-material/PostAdd";
import EmailIcon from "@mui/icons-material/Email";
import { useAuth } from "@/context/context";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Email, ModelTraining } from "@mui/icons-material";
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

  //HANDLE MODEL SUBMISSION
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
              <Button variant="contained" color="success">
                Update
              </Button>
              <Button variant="contained" color="error">
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
          </>
        );
      case "Models":
      default:
        return (
          <>
            <Typography variant="h5" gutterBottom>
              📊 Models
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
                      <TableCell>N/A</TableCell>
                    </TableRow>
                  ))}

                  {/* editable row for input */}
                  <TableRow>
                    <TableCell>Auto</TableCell>
                    <TableCell>
                      <input
                        value={newModel.title || ""}
                        onChange={(e) =>
                          setNewModel({ ...newModel, title: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={newModel.country || ""}
                        onChange={(e) =>
                          setNewModel({ ...newModel, country: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={newModel.region || ""}
                        onChange={(e) =>
                          setNewModel({ ...newModel, region: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        value={newModel.year || ""}
                        onChange={(e) =>
                          setNewModel({ ...newModel, year: +e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        value={newModel.month || ""}
                        onChange={(e) =>
                          setNewModel({ ...newModel, month: +e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={newModel.model || ""}
                        onChange={(e) =>
                          setNewModel({ ...newModel, model: e.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        value={newModel.description || ""}
                        onChange={(e) =>
                          setNewModel({
                            ...newModel,
                            description: e.target.value,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={newModel.highRisk || false}
                        onChange={(e) =>
                          setNewModel({
                            ...newModel,
                            highRisk: e.target.checked,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell colSpan={3}>
                      <Button
                        onClick={handleAddModel}
                        size="small"
                        variant="contained"
                        color="success"
                        disabled={
                          !newModel.title ||
                          !newModel.country ||
                          !newModel.region ||
                          !newModel.year ||
                          !newModel.month
                        }
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
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
          flexDirection: "row",
          width: 900,
          height: 500,
          borderRadius: "20px",
          boxShadow: "6px 6px 12px #babecc, -6px -6px 12px #ffffff",
          //backgroundColor: "#e0e5ec",
        }}
      >
        {/* Side Drawer */}
        <Box
          sx={{
            width: 180,
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
