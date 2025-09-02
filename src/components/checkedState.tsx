import React, { useState } from "react";
import { Button, Checkbox } from "@mui/material";
import NavbarLoggedIn from "../components/shared/navbarLoggedIn";
import NewMap from "../components/map/Map";

export default function CheckedState() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <>
      <NavbarLoggedIn isChecked={isChecked} />
      <NewMap isChecked={isChecked} setIsChecked={setIsChecked} />
    </>
  );
}
