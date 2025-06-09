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
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PostAddIcon from "@mui/icons-material/PostAdd";
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  role: string;
  createdAt: string;
}
export default function AdminPanelDynamic() {
  const [selectedSection, setSelectedSection] = useState<
    "dashboard" | "users" | "Posts"
  >("dashboard");
  const [users, setUsers] = useState<User[]>([]);

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

  const renderContent = () => {
    switch (selectedSection) {
      case "Posts":
        return (
          <>
            <Typography variant="h5" gutterBottom>
              📝 Posts
            </Typography>
            <Typography variant="body2">Manage all posts here.</Typography>
          </>
        );
      case "users":
        return (
          <>
            <Typography variant="h5" gutterBottom>
              👥 Users
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small" aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Gender</TableCell>
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
                      <TableCell>{user.gender}</TableCell>
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
      default:
        return (
          <>
            <Typography variant="h5" gutterBottom>
              📊 Dashboard
            </Typography>
            <Typography variant="body2">
              Overview and analytics of the admin system.
            </Typography>
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
