import React, {CSSProperties, useState} from 'react';
import AccordionDetails from '@mui/material/AccordionDetails';
import '../map/accordion-style.css'
import SpeciesInfoBox from "@/components/popup/SpeciesInfoBox";
import {fetchSiteInfo} from "@/api/occurrence";

import {useQuery,} from 'react-query'
import EnvironmentCard from "@/components/popup/EnvironmentCard";
import CustomAccordionSummary from "@/components/popup/CustomAccordionSummary";
import {DialogTitle, IconButton, Popper, LinearProgress, Box, Accordion} from "@mui/material";
import IrDetails from "@/components/popup/IrDetails";
import BionomicsDetails from "@/components/popup/BionomicsDetails";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";


export default function OccurrencePopup
({
     id,
     anchorEl,
     handleClose,
     speciesData,
 }) {

    const [expanded, setExpanded] = React.useState<string | false>(false);
    const open = Object.keys(speciesData).length > 0;
    const defaultExpanded = true;

    const bionomicsEnabled = (open && Boolean(speciesData['bionomics_id']));
    const environmentEnabled = (open && Boolean(speciesData['site_id']));
    const irEnabled = (open && Boolean(speciesData['ir_bioassays_id']) && Boolean(speciesData['genetic_mechanisms_id']));

    const {
        status,
        data: siteData,
        error,
        isFetching,
    } = useQuery(["siteInfo", speciesData['site_id']], async ({queryKey}) => {
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
        maxHeight: "600px", // Adjust the height as needed
        overflowY: 'auto'  // Enable vertical scrolling
    };

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
            <DialogTitle sx={{display: 'flex', padding: 0, justifyContent: 'flex-end'}}>
                <IconButton
                    variant="outlined"
                    onClick={handleClose}
                    sx={{m: 1,}}
                >
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <div style={{...scrollableStyle}}>

                <Accordion defaultExpanded expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                    <CustomAccordionSummary title={"Occurrence"} desc={"Vector occurrence information"}/>
                    <AccordionDetails sx={{bgcolor: "#696463", opacity: 0.75}}>
                        <SpeciesInfoBox speciesInfo={speciesData}/>
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} disabled={!bionomicsEnabled}>
                    <CustomAccordionSummary title={"Bionomics"} desc={"Vector behavioral information"}/>
                    <AccordionDetails>
                        <BionomicsDetails/>
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')} disabled={!irEnabled}>
                    <CustomAccordionSummary title={"Insecticide Resistance"} desc={"Insecticide Resistance data"}/>
                    <AccordionDetails>
                        <IrDetails irData={{}}/>
                    </AccordionDetails>
                </Accordion>
                <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')} disabled={!environmentEnabled}>
                    <CustomAccordionSummary title={"Environment"}
                                            desc={"Specimen collection site and environment data"}/>
                    <AccordionDetails>
                        <EnvironmentCard siteInfo={siteData} isFetching={isFetching} status={status}/>
                    </AccordionDetails>
                </Accordion>

            </div>

        </Popper>
    );
};