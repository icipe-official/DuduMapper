import { Button } from "@mui/material";

export const formControlStyle = {
    marginBottom: "15px",
    minWidth: "60%",
    minHeight: "2px",
    fontSize: "5px",
    // padding: '0.3px',
  };

  export const containerStyle = {
    backgroundColor: "#f4f4f4", // Add your desired gray background color
    borderRadius: "3px",
    padding: "15px",
    display: "flex",
    // flexDirection: 'column',
    alignItems: "center",
  };

  export const buttonContainerStyle = {
    marginTop: "35px",
    // display: 'flex',
    // justifyContent: 'center',
    // alignItems: 'center',
    margin: "0 auto",
  };

  export const buttonStyle = {
    width: "10%",
    height: "10%",
    size: "small",
    marginBottom: "10px",
    marginLeft: "5px",
    marginRight: "1px",
    paddingRight: "10px",
    fontSize: "0.5rem",
  };

  export const renderButton = (
    label:
      | string
      | number
      | boolean
      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
      | Iterable<React.ReactNode>
      | React.ReactPortal
      | React.PromiseLikeOfReactNode
      | null
      | undefined,
    value: boolean,
    handleClick: React.MouseEventHandler<HTMLButtonElement> | undefined
  ) => (
    <Button
      variant="contained"
      color="success"
      onClick={handleClick}
      sx={{
        ...buttonStyle,
        backgroundColor: value === true ? "#ebbd40" : "#2e7d32", // Lighter shade of yellow for true, Darker shade of green for false
        boxShadow:
          value === true ? "0 4px 8px rgba(235, 189, 64, 0.2)" : "none", // Adjusted box shadow
        "&:hover": {
          backgroundColor: value === true ? "#d9a031" : "#255726", // Slightly darker shade of yellow for true, Slightly darker shade of green for false
        },
        "&:active": {
          backgroundColor: value === true ? "#c68d35" : "#1e4d21", // Slightly darker shade of yellow for true, Darker shade of green for false
          boxShadow:
            value === true ? "0 2px 4px rgba(235, 189, 64, 0.2)" : "none", // Adjusted box shadow on click
        },
      }}
    >
      {label}
    </Button>
  );