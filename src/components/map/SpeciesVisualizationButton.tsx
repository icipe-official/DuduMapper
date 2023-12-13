import React from 'react';
import Button from '@mui/material/Button';
import AdjustIcon from '@mui/icons-material/Adjust';

interface SpeciesVisualizationButtonProps {
  onClick: () => void;
}

const SpeciesVisualizationButton: React.FC<SpeciesVisualizationButtonProps> = ({ onClick }) => (
  <Button
    variant="contained"
    color="primary"
    startIcon={<AdjustIcon />}
    onClick={onClick}
  >
    Species Visualization
  </Button>
);

export default SpeciesVisualizationButton;
