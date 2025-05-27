"use client";
import {
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";
import Image from "next/image";
import PersonIcon from "@mui/icons-material/Person";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";
import { useAuth } from "@/context/context";
import React from "react";
import { set } from "date-fns";
import { is } from "date-fns/locale";
import { toast } from "react-toastify";
import { AccountCircle } from "@mui/icons-material";
import { useRef } from "react";
const AccountProfile = () => {
  const { user, logout, updateUser } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [settingAnchorEl, setSettingAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [isEditFirstName, setIsEditFirstName] = React.useState(false);
  const [isEditLastName, setIsEditLastName] = React.useState(false);
  const [firstNameEditted, setFirstNameEditted] = React.useState("");
  const [lastNameEditted, setLastNameEditted] = React.useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSettingAnchorEl(null);
  };
  //edit the firstname and last name
  const handleFirstNameEdit = () => {
    setFirstNameEditted(user?.firstName || "");
    setIsEditFirstName(true);
  };
  const handleLastNameEdit = () => {
    setLastNameEditted(user?.lastName || "");
    setIsEditLastName(true);
  };

  //saving them
  const handleFirstNameSave = async () => {
    //send to database
    try {
      const res = await fetch("/api/accountPage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", //
        body: JSON.stringify({ firstName: firstNameEditted }),
      });
      if (!res.ok) {
        throw new Error("Failed to update first name");
      }

      const data = await res.json();
      updateUser(data.user);
      setIsEditFirstName(false);
      toast.success("First name updated successfully");
    } catch (error) {
      console.error("Error updating first name:", error);
    }
  };

  const handleLastNameSave = async () => {
    //send to database
    try {
      const res = await fetch("/api/accountPage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", //
        body: JSON.stringify({ lastName: lastNameEditted }),
      });
      if (!res.ok) {
        throw new Error("Failed to update last name");
      }

      const data = await res.json();
      updateUser(data.user);
      setIsEditLastName(false);
      toast.success("Last name updated successfully");
    } catch (error) {
      console.error("Error updating last name:", error);
    }
  };

  //updating user

  const getGenderIcon = (gender: string | undefined) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return (
          <MaleIcon fontSize="small" sx={{ verticalAlign: "middle", ml: 1 }} />
        );
      case "female":
        return (
          <FemaleIcon
            fontSize="small"
            sx={{ verticalAlign: "middle", ml: 1 }}
          />
        );
      case "other":
        return (
          <TransgenderIcon
            fontSize="small"
            sx={{ verticalAlign: "middle", ml: 1 }}
          />
        );
    }
  };

  //user profile picture
  const handleProfilePicture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.onchange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];

      if (file) {
        console.log("Selected file:", file);
        const formData = new FormData();
        formData.append("profilePicture", file);

        try {
          const res = await fetch("/api/accountPage", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error("Failed to update profile");
          }

          const data = await res.json();
          updateUser(data.user);
          toast.success("Profile updated successfully");
        } catch (error) {
          console.error("Error updating profile:", error);
          toast.error("Failed to update profile picture");
        }
      }

      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        //height: "100vh",
        //width: "100%",
        mt: 15,
      }}
    >
      <Paper
        elevation={4}
        sx={{ p: 4, borderRadius: 4, width: "100%", maxWidth: 400 }}
      >
        <div
          style={{
            position: "relative",
            height: "50px" /* or your container height */,
          }}
        >
          {user?.profilePicture ? (
            <Image
              width={50}
              height={50}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                cursor: "pointer",
                position: "absolute",
                top: 2,
                right: 8,
              }}
              src={user?.profilePicture}
              onClick={handleProfilePicture}
              alt="profile"
            />
          ) : (
            <AccountCircle
              fontSize="large"
              onClick={handleProfilePicture}
              sx={{
                position: "absolute",
                top: 2,
                right: 8,
                cursor: "pointer",
              }}
            />
          )}

          <Image
            style={{ position: "absolute", top: 2, left: 8 }}
            src="/Animals-Mosquito-icon.png"
            alt={""}
            width={25}
            height={25}
          />
        </div>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Typography
            variant="h6"
            display="block"
            fontWeight="bold"
            fontFamily="sans-serif"
          >
            User Profile
          </Typography>
        </Box>

        <Typography
          sx={{
            color: "green",
            display: "center",
            mb: 2,
            alignItems: "center",
          }}
        >
          Hello {user?.firstName}!
        </Typography>

        {/* <ListItemText
                    //sx={{ color: "black", padding: "5px" }}
                    //primary={`Name : ${user?.email}`}
                    //secondary={`Email Address:  ${user?.email}`}
                    />*/}
        <Box
          sx={{
            display: "flex",
            mb: 2,
            alignItems: "center",
            fontFamily: "sans-serif",
            fontWeight: "bold",
          }}
        >
          {" "}
          <Typography variant="h6"> Personal Details!</Typography>{" "}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* details page*/}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          {isEditFirstName ? (
            <>
              <TextField
                value={firstNameEditted}
                onChange={(e) => setFirstNameEditted(e.target.value)}
                sx={{ mr: 1 }}
              />
              <Button
                //variant="contained"
                size="small"
                onClick={handleFirstNameSave}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Typography sx={{ padding: "5px", gap: 1 }}>
                {" "}
                <PersonIcon sx={{ mr: 1, color: "text.secondary" }} /> First
                Name:&nbsp;
                {user?.firstName}
              </Typography>
              <EditIcon
                onClick={handleFirstNameEdit}
                sx={{ color: "text.secondary", ml: 2 }}
              />
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          {isEditLastName ? (
            <>
              <TextField
                value={lastNameEditted}
                onChange={(e) => setLastNameEditted(e.target.value)}
                sx={{ mr: 1 }}
              />
              <Button
                //variant="contained"
                size="small"
                onClick={handleLastNameSave}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Typography sx={{ padding: "5px", gap: 1 }}>
                {" "}
                <PersonIcon sx={{ mr: 1, color: "text.secondary" }} /> Last
                Name:&nbsp;
                {user?.lastName}
              </Typography>
              <EditIcon
                onClick={handleLastNameEdit}
                sx={{ color: "text.secondary", ml: 2 }}
              />
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography sx={{ padding: "5px", gap: 1 }}>
            {""}
            {getGenderIcon(user?.gender)} Gender:&nbsp;
            {user?.gender}
          </Typography>
        </Box>

        {/* Name input field */}
        {/*<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <TextField
                        sx={{ padding: "5px", gap: 1 }}
                        label="Enter your Name!"
                      />{" "}
                      <Button>Save</Button>
                    </Box>*/}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ padding: "5px", gap: 1, color: "" }}>
            {" "}
            <EmailIcon sx={{ mr: 1, color: "text.secondary" }} /> Email
            Address:&nbsp;
            {user?.email}
          </Typography>
        </Box>

        {/*<ListItemText sx={{ padding: "5px" }}>
                      <PersonIcon />
                      <h5>You are who?</h5>
                      <PersonIcon />
                      <p> Your email Address is {user?.email}</p>
                    </ListItemText>*/}
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button onClick={logout}>Logout</Button>
        </Box>
      </Paper>
    </Box>
  );
};
export default AccountProfile;
