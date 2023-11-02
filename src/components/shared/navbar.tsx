
import React from 'react';
import { AppBar, Toolbar, Button } from '@mui/material';

const Navbar: React.FC = () => {
  return (
    <AppBar position="static" style={{ backgroundColor: 'white', boxShadow: '1px 1px 1px 1px gray' }}>
      <Toolbar>
        <img src={"/vector-atlas-logo.svg"} alt="Logo" style={{ height: '40px', marginRight: '16px' }} />
        <div style={{ flexGrow: 1 }}></div>
        <Button color="primary">Map</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

