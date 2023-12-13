import React from 'react';
import ReactDOM from 'react-dom';
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

    ReactDOM.render(
      <SpeciesVisualizationButton onClick={props.onClick} />,
      buttonElement
    );
  }
}

export default SpeciesOccurrenceVisualizationControl;
