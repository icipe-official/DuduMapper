import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import { Control } from 'ol/control';
import SpeciesVisualizationButton from './SpeciesVisualizationButton';

interface SpeciesOccurrenceVisualizationControlProps {
  onClick: () => void;
}

class SpeciesOccurrenceVisualizationControl extends Control {
  constructor(props: SpeciesOccurrenceVisualizationControlProps) {
    const buttonElement = document.createElement('div');

    super({
      element: buttonElement,
    });

    // Use createRoot to render the component
    const root = createRoot(buttonElement);
    root.render(<SpeciesVisualizationButton onClick={props.onClick} />);
  }
}

export default SpeciesOccurrenceVisualizationControl;

