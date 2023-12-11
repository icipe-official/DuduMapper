import React from 'react';
import Popover from '@mui/material/Popover';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useState } from 'react';
import './accordion-style.css'
import { CSSProperties } from 'react';

interface MapPopoverProps {
  id: string | undefined;
  open: boolean;
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  popoverContent: { [key: string]: any };
  expanded: string | false;
  handleChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

interface ExpandedState {
  [key: string]: boolean; // Each key is a string and has a boolean value
}

const popoverStyle = {
  opacity: 0.85,
};

const borderStyle = {
  'border-style': 'solid', 'border-color': 'green', 'border-width': '2px 2px 2px 2px', 'border-radius': '5px'
}

const textStyle = {
  background: 'white', // Opaque background for text
  padding: '8px', // Optional, for better spacing
};

const scrollableStyle: CSSProperties = {
  maxHeight: '400px', // Adjust the height as needed
  overflowY: 'auto'  // Enable vertical scrolling
};
const OccurrencePopup: React.FC<MapPopoverProps> = ({
  id,
  open,
  anchorEl,
  handleClose,
  popoverContent,
  expanded,
  handleChange
}) => {
  const [isBitingPeakVisible, setBitingPeakVisible] = useState(false);
  const [isBioessaysVisible, setBioessaysVisible] = useState(false);
  const [isGeneticMechanismsVisible, setGeneticMechanismsVisible] = useState(false);
  const toggleBitingPeak = () => {
    setBitingPeakVisible(prevState => !prevState);
  };
  const toggleBioessays = () => setBioessaysVisible(prevState => !prevState);
  const toggleGeneticMechanisms = () => setGeneticMechanismsVisible(prevState => !prevState);
  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      style={popoverStyle}     >
      <div style={{ ...scrollableStyle, ...borderStyle }}>
        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography sx={{ width: '33%', flexShrink: 0, }}>
              Occurrence
            </Typography>
            <Typography sx={{ color: 'text.secondary', }}></Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Species name: {popoverContent?.species}
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>Bionomics</Typography>
            <Typography sx={{ color: 'text.secondary' }}></Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              <div>
                {/* Collapsible List for Biting Peak */}
                <div className="collapsible">
                  <Typography
                    sx={{ cursor: 'pointer' }}
                    onClick={toggleBitingPeak}
                  >
                    {isBitingPeakVisible ? '▼ ' : '► '}Biting peak
                  </Typography>
                  {isBitingPeakVisible && (
                    <div className="content">
                      <Typography>
                        Biting peak details: {popoverContent?.bitingPeak}
                      </Typography>
                      {/* Add more details as needed */}
                    </div>
                  )}
                </div>
                {/* Collapsible List for Bioessays */}
                <div className="collapsible">
                  <Typography
                    sx={{ cursor: 'pointer' }}
                    onClick={toggleBioessays}
                  >
                    {isBioessaysVisible ? '▼ ' : '► '} Bioessays
                  </Typography>
                  {isBioessaysVisible && (
                    <div className="content">
                      <Typography>
                        Details about Bioessays {/* Add relevant content */}
                      </Typography>
                      {/* Add more details as needed */}
                    </div>
                  )}
                </div>

                {/* Collapsible List for Genetic Mechanisms */}
                <div className="collapsible">
                  <Typography
                    sx={{ cursor: 'pointer' }}
                    onClick={toggleGeneticMechanisms}
                  >
                    {isGeneticMechanismsVisible ? '▼ ' : '► '} Genetic Mechanisms
                  </Typography>
                  {isGeneticMechanismsVisible && (
                    <div className="content">
                      <Typography>
                        Details about Genetic mechanisms {/* Add relevant content */}
                      </Typography>
                      {/* Add more details as needed */}
                    </div>
                  )}
                </div>

                {/* Basic Geographical Details */}

              </div>
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3bh-content"
            id="panel3bh-header"
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              Insecticide Resistance
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}></Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4bh-content"
            id="panel4bh-header"
            onClick={(event) => {
              event.stopPropagation(); // Stop event from propagating to parent
              handleChange('panel4.1'); // Manually trigger handleChange
            }}
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>Environment</Typography>
            <Typography sx={{ color: 'text.secondary' }}></Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              <Typography variant="h6">Natural Surroundings</Typography>
              <Typography>Forest: {/* Data Here */}</Typography>
              <Typography>Farming: {/* Data Here */}</Typography>
              <Typography>Livestock: {/* Data Here */}</Typography>
              <Typography>Local Plants: {/* Data Here */}</Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>Community and Occupation</Typography>
              <Typography>Common Occupations: {/* Data Here */}</Typography>
              <Typography>Community Notes: {/* Data Here */}</Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>Daily Activities</Typography>
              <Typography>Leave Home Time: {/* Data Here */}</Typography>
              <Typography>Hours Away: {/* Data Here */}</Typography>
              <Typography>Average Bedtime: {/* Data Here */}</Typography>
              <Typography>Seasonal Labour: {/* Data Here */}</Typography>
              <Typography>Outdoor Activities: {/* Data Here */}</Typography>

              <Typography variant="h6" sx={{ mt: 2 }}>Housing and Living Conditions</Typography>
              <Typography>Roof Type: {/* Data Here */}</Typography>
              <Typography>Wall Material: {/* Data Here */}</Typography>
              <Typography>Cooking Facilities: {/* Data Here */}</Typography>
              <Typography>Open Eaves: {/* Data Here */}</Typography>
              <Typography>House Screening: {/* Data Here */}</Typography>
              <Typography>Housing Notes: {/* Data Here */}</Typography>
            </div>


          </AccordionDetails>
        </Accordion>

      </div>

    </Popover>
  );
};

export default OccurrencePopup;
