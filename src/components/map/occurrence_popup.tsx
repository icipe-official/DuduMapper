
import React from 'react';
import Popover from '@mui/material/Popover';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


interface MapPopoverProps {
  id: string | undefined;
  open: boolean;
  anchorEl: HTMLElement | null;
  handleClose: () => void;
  popoverContent: { [key: string]: any };
  expanded: string | false;
  handleChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

const OccurrencePopup: React.FC<MapPopoverProps> = ({
  id,
  open,
  anchorEl,
  handleClose,
  popoverContent,
  expanded,
  handleChange
}) => {
  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
    >
      <div>
        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              Species
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>Mosquito species details</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {popoverContent?.notes}
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
            <Typography sx={{ color: 'text.secondary' }}>
              Ecological characteristics of species
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {popoverContent?.notes}
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
              Site/Environment
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Geographical and environmental data
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {popoverContent.geometry ? (
                <>
                  Location: {popoverContent.geometry.layout}
                  Coordinates: {popoverContent.geometry.flatCoordinates.join(', ')}
                </>
              ) : (
                <span>Loading or no data available...</span>
              )}
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4bh-content"
            id="panel4bh-header"
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              Period
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              {popoverContent?.period_start && popoverContent?.period_end ? (
                `Data collected from ${popoverContent.period_start} to ${popoverContent.period_end}.`
              ) : (
                <span>Loading or no data available...</span>
              )}
            </Typography>
          </AccordionDetails>
        </Accordion>
      </div>

    </Popover>
  );
};

export default OccurrencePopup;
