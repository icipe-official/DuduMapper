import React, {CSSProperties, useState} from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import '../map/accordion-style.css'
import SpeciesInfoBox from "@/components/popup/SpeciesInfoBox";
import {fetchSiteInfo} from "@/api/occurrence";

import {useQuery,} from 'react-query'
import EnvironmentCard from "@/components/popup/EnvironmentCard";
import CustomAccordionSummary from "@/components/popup/CustomAccordionSummary";
import {Popper} from "@mui/material";
import IrDetails from "@/components/popup/IrDetails";
import BionomicsDetails from "@/components/popup/BionomicsDetails";


const textStyle = {
    background: 'white', // Opaque background for text
    padding: '8px', // Optional, for better spacing
};


export default function OccurrencePopup
({
     id,
     open,
     anchorEl,
     handleClose,
     speciesData,
     height,
     maxHeight
 }) {

    const [expanded, setExpanded] = React.useState<string | false>(false);
    const query = useQuery(["siteInfo", speciesData['site_id']], async ({queryKey}) => {
        return fetchSiteInfo(queryKey[1]);

    });

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
            event.stopPropagation(); // Stop the click event from reaching the parent accordion
        };

    const scrollableStyle: CSSProperties = {
        display: 'flow',
        boxShadow: "0 2px 12px 0 rgba(0, 0, 0, 0.5)",
        maxHeight: "700px", // Adjust the height as needed
        overflowY: 'auto'  // Enable vertical scrolling
    };
    if (query.status === "pending") {
        return <span>Loading...</span>
    }

    if (query.status === "success") {
        //TODO Dynamically show components that have data otherwise hide
        //TODO Change background color
        //Increase height of the Popup
        return (
            <Popper
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
            >
                <div style={{...scrollableStyle}}>
                    <Accordion defaultExpanded expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                        <CustomAccordionSummary title={"Occurrence"} desc={"Vector occurrence information"}/>
                        <AccordionDetails sx={{ bgcolor: "#E8E8E8", opacity: 0.75}}>
                            <SpeciesInfoBox speciesInfo={speciesData}/>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                        <CustomAccordionSummary title={"Bionomics"} desc={"Vector behavioral information"}/>
                        <AccordionDetails>
                            <BionomicsDetails/>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                        <CustomAccordionSummary title={"Insecticide Resistance"} desc={"Insecticide Resistance data"}/>
                        <AccordionDetails>
                            <IrDetails irData={{}}/>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
                        <CustomAccordionSummary title={"Environment"}
                                                desc={"Specimen collection site and environment data"}/>
                        <AccordionDetails>
                            <EnvironmentCard siteInfo={query.data}/>
                        </AccordionDetails>
                    </Accordion>

                </div>

            </Popper>
        );
    }
};