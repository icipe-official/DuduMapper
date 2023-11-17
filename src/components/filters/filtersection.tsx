// filtersection.js
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Button, Box, Grid } from '@mui/material';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

const FilterSection = () => {

  const handleCountryChange = (event: { target: { value: any; }; }) => {
    const selectedCountry = event.target.value
    console.log('Selected Country:', selectedCountry);
  };

  const handleSpeciesChange = (event: { target: { value: any; }; }) => {
    const selectedSpecies = event.target.value;
    console.log('Selected Species:', selectedSpecies);
  };

  const handleApplyFilters = () => {
    console.log('Filters Applied');
  };
  const formControlStyle = {
    minWidth: '120px', 
    minHeight: '20px'
  };

  const containerStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div style={{ position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
      
    <Box style={containerStyle}>
      <FormControl style={{ ...formControlStyle, marginRight: '20px' }}>
        <InputLabel id="country-label">Country</InputLabel>
        <Select
          labelId="country-label"
          id="country-select"
          onChange={handleCountryChange}
        >
          
          <MenuItem value="country1">Kenya</MenuItem>
          <MenuItem value="country2">Uganda</MenuItem>
          
        </Select>
      </FormControl>

    
      <FormControl style={formControlStyle}>
        <InputLabel id="species-label">Species</InputLabel>
        <Select
          labelId="species-label"
          id="species-select"
          onChange={handleSpeciesChange}
        >
          
          <MenuItem value="species1">An. gambiae</MenuItem>
          <MenuItem value="species2">An. fenestus</MenuItem>
          
        </Select>
      </FormControl>
      
      {/* <Grid container direction="row" justifyContent="space-between"> */}
      {/* <Grid item> */}
            {/* {season?.toLocaleLowerCase() === 'rainy' ? ( */}
              {/* <ThunderstormIcon sx={{ fontSize: '1.3rem' }} /> */}
            {/* ) : season?.toLocaleLowerCase() === 'dry' ? ( */}
              {/* <WbSunnyIcon sx={{ fontSize: '1.3rem' }} /> */}
            {/* ) : null} */}
          {/* </Grid> */}
          {/* </Grid> */}

      <Button 
          variant="contained" 
          color="success" 
          size='small' 
          style={{ marginLeft: '10px' }} 
          onClick={handleApplyFilters}>
        Apply Filters
      </Button>
      </Box>
    </div>
  );
};

export default FilterSection;
