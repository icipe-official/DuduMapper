"use client";

import RegisterUser from "@/components/users/RegisterUser";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Switch,
} from "@mui/material";
import MUIDataTable, { MUIDataTableColumnDef } from "mui-datatables";
import React, { useState } from "react";
import {
  useFetchAllUsers,
  useActivateUser,
  useDeactivateUser,
} from "@/api/account";

const AllUsers = () => {
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const { data: users, isLoading: loadingUsers } = useFetchAllUsers();
  const { mutate: activateUser } = useActivateUser();
  const { mutate: deactivateUser } = useDeactivateUser();

  const handleToggleActivated = (userId: string, activated: boolean) => {
    activated ? deactivateUser(userId) : activateUser(userId);
  };

  const columns: MUIDataTableColumnDef[] = [
    {
      name: "id",
      options: {
        display: "excluded",
        filter: false,
      },
    },
    {
      label: "First Name",
      name: "firstName",
    },
    {
      label: "Last Name",
      name: "lastName",
    },
    {
      label: "Email",
      name: "email",
    },
    {
      label: "Active",
      name: "activated",
      options: {
        print: false,
        customBodyRender: (value, tableMeta) => {
          const userId = tableMeta.rowData[0];
          return (
            <Switch
              checked={value}
              color="success"
              onChange={() => handleToggleActivated(userId, value)}
            />
          );
        },
      },
    },
    {
      label: "Action",
      name: "id",
      options: {
        print: false,
        filter: false,
        customBodyRender: (value) => (
          <React.Fragment>
            <Button size="small" variant="outlined" color="success">
              Edit
            </Button>
          </React.Fragment>
        ),
      },
    },
  ];

  const handleCloseUserDialog = () => {
    setShowCreateUserDialog(false);
  };

  const handleOpenUserDialog = () => {
    setShowCreateUserDialog(true);
  };

  return (
    <Container sx={{ py: 5 }}>
      <Box my={3}>
        <Button
          variant="contained"
          color="success"
          onClick={handleOpenUserDialog}
        >
          Add User
        </Button>
      </Box>
      <Box>
        <MUIDataTable
          columns={columns}
          data={users}
          title="Users"
          options={{ selectableRows: "none" }}
        />
      </Box>
      <Dialog
        open={showCreateUserDialog}
        onClose={handleCloseUserDialog}
        fullWidth
      >
        <DialogTitle variant="h5">Create User</DialogTitle>
        <DialogContent>
          <Divider sx={{ my: 2 }} />
          <RegisterUser />
        </DialogContent>
      </Dialog>
    </Container>
  );
};
export default AllUsers;
