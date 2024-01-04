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
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';


interface MapPopoverProps {
  id: string | undefined;
  open: boolean;
  handleClose: () => void;
  popoverContent: { [key: string]: any };
  expanded: string | false;
  handleChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  ref?: React.Ref<any>;
}


interface ExpandedState {
  [key: string]: boolean; // Each key is a string and has a boolean value
}

const popoverStyle = {
  opacity: 0.85,
};


const borderStyle = {
  borderStyle: 'solid',
  borderColor: 'green',
  borderWidth: '2px 2px 2px 2px',
  borderRadius: '5px'
};


const textStyle = {
  background: 'white', // Opaque background for text
  padding: '8px', // Optional, for better spacing
};

const scrollableStyle: CSSProperties = {
  maxHeight: '400px', // Adjust the height as needed
  overflowY: 'auto'  // Enable vertical scrolling
};
const sidePanelStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: '30%',
  height: '100%',
  overflowY: 'auto', // Make sure this is a valid CSS overflow-y value
  background: 'white',
  boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
  borderStyle: 'solid', // Correct casing for CSS property name
  borderColor: 'green', // Correct casing for CSS property name
  borderWidth: '2px 2px 2px 2px', // Correct casing for CSS property name
  borderRadius: '5px', // Correct casing for CSS property name
};
const OccurrencePopup: React.FC<MapPopoverProps> = ({
  id,
  open,
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
  if (!open) {
    return null;
  }
  return (

    <div id={id} style={{ ...scrollableStyle, ...borderStyle, ...{ width: '30%', overflowY: 'auto', background: 'white' } }}>
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


          <Typography>
            Period recorded
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={popoverContent?.period_start} color="primary" />
            <Chip label={popoverContent?.period_end} color="primary" />
          </Stack>
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

  );
};

export default OccurrencePopup;
