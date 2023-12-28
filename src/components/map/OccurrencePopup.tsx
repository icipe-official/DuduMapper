import React, {CSSProperties, useState} from 'react';
import Popover from '@mui/material/Popover';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './accordion-style.css'
import SpeciesInfoBox from "@/components/popup/SpeciesInfoBox";
import {fetchSiteInfo} from "@/api/occurrence";

import {useQuery,} from 'react-query'
import EnvironmentCard from "@/components/popup/EnvironmentCard";
import CustomAccordionSummary from "@/components/popup/CustomAccordionSummary";
import {Popper} from "@mui/material";


interface MapPopoverProps {
    id: string | undefined;
    open: boolean;
    anchorEl: HTMLElement | null;
    handleClose: () => void;
    speciesData: { [key: string]: any };
    expanded: string | false;
    handleChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
}

interface ExpandedState {
    [key: string]: boolean; // Each key is a string and has a boolean value
}

const popoverStyle = {
    opacity: 0.85,
    bgcolor: "#3b4252"
};

const borderStyle = {
    borderStyle: 'solid',
    borderColor: 'green',
    borderWidth: '2px 2px 2px 2px',
    borderRadius: '5px',
    padding: 2
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
                                                        speciesData,
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

    const query= useQuery(["siteInfo", speciesData['site_id']], async ({queryKey}) => {
        return fetchSiteInfo(queryKey[1]);

    });

    if (query.status === "pending") {
        return <span>Loading...</span>
    }

    if (query.status === "success") {
        console.log("Data", query.data)
        //TODO Dynamically show components that have data otherwise hide
        //TODO Change background color
        //Increase height of the Popup
        return (
            <Popper
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                //style={{height: 800, width: 1000}}
            >
                <div style={{...scrollableStyle, ...borderStyle}}>
                    <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                        <CustomAccordionSummary title={"Occurrence"} desc={"Vector occurrence information"}/>
                        <AccordionDetails>
                            <SpeciesInfoBox speciesInfo={speciesData}/>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                        <CustomAccordionSummary title={"Bionomics"} desc={"Vector behaviorial information"}/>
                        <AccordionDetails>
                                <div>
                                    {/* Collapsible List for Biting Peak */}
                                    <div className="collapsible">
                                        <Typography
                                            sx={{cursor: 'pointer'}}
                                            onClick={toggleBitingPeak}
                                        >
                                            {isBitingPeakVisible ? '▼ ' : '► '}Biting peak
                                        </Typography>
                                        {isBitingPeakVisible && (
                                            <div className="content">
                                                <Typography>
                                                    Biting peak details: {speciesData?.bitingPeak}
                                                </Typography>
                                                {/* Add more details as needed */}
                                            </div>
                                        )}
                                    </div>
                                    {/* Collapsible List for Bioessays */}
                                    <div className="collapsible">
                                        <Typography
                                            sx={{cursor: 'pointer'}}
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
                                            sx={{cursor: 'pointer'}}
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
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                        <CustomAccordionSummary title={"Insecticide Resistance"} desc={"Insecticide Resistance data"}/>
                        <AccordionDetails>
                            <Typography>
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                            aria-controls="panel4bh-content"
                            id="panel4bh-header"
                            onClick={(event) => {
                                event.stopPropagation(); // Stop event from propagating to parent
                                handleChange('panel4.1'); // Manually trigger handleChange
                            }}
                        >
                            <Typography sx={{width: '33%', flexShrink: 0}}>Environment</Typography>
                            <Typography sx={{color: 'text.secondary'}}></Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <EnvironmentCard siteInfo={query.data}/>

                        </AccordionDetails>
                    </Accordion>

                </div>

            </Popper>
        );
    }
};

export default OccurrencePopup;
