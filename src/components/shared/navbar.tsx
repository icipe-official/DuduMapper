
import React from 'react';
import { AppBar, Toolbar, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <img src={"/vector-atlas-logo.svg"} alt="Logo" style={{ height: '40px', marginRight: '16px' }} />
        <div style={{ flexGrow: 1 }}></div>

        <Button color="inherit">Map</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
