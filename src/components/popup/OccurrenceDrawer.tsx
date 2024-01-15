import React from 'react';
import { Accordion, AccordionDetails } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { IconButton } from "@mui/material";
import CustomAccordionSummary from "@/components/popup/CustomAccordionSummary";
import SpeciesInfoBox from "@/components/popup/SpeciesInfoBox";
import BionomicsDetails from "@/components/popup/BionomicsDetails";
import IrDetails from "@/components/popup/IrDetails";
import EnvironmentCard from "@/components/popup/EnvironmentCard";
import { fetchSiteInfo } from "@/api/occurrence";
import '../map/accordion-style.css'
import { CSSProperties } from 'react';
import { useQuery } from "@tanstack/react-query";
import { fetchBionomics } from '@/api/occurrence';
const borderStyle = {
    // borderStyle: 'solid',
    // borderColor: 'green',
    // borderWidth: '2px 2px 2px 2px',
    // borderRadius: '5px'
};

const scrollableStyle: CSSProperties = {
    overflowY: 'scroll'
};

export default function OccurrencePopup({ id, handleClose, popoverContent }: { id: string, handleClose: any, popoverContent: any }) {
    const [expanded, setExpanded] = React.useState<string | false>('panel1');

    const open = Object.keys(popoverContent).length > 0;

    const bionomicsEnabled = (open && Boolean(popoverContent['bionomics_id']));
    const environmentEnabled = (open && Boolean(popoverContent['site_id']));
    const irEnabled = (open && Boolean(popoverContent['ir_bioassays_id']) && Boolean(popoverContent['genetic_mechanisms_id']));

    const handleChange =
        (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false);
            event.stopPropagation();
        };

    const {
        status,
        data: siteData,
        error,
        isFetching,
    } = useQuery({
        queryKey: ["siteInfo", popoverContent['site_id']],
        queryFn: ({ queryKey }) => fetchSiteInfo(queryKey[1])
    });

    const {
        status: bionomics_fetch_status,
        data: bionomicsData,
        error: bionomics_fetch_error,
        isFetching: bionomics_is_fetching,
    } = useQuery({
        queryKey: ["bionomicsInfo", popoverContent['bionomics_id']],
        queryFn: ({ queryKey }) => fetchBionomics(queryKey[1])
    });

    if (!open) {
        return null;
    }
    return (

        <div id={id} style={{ ...scrollableStyle, ...borderStyle, ...{ width: '30%', overflowY: 'auto', transitionDuration: '4s' } }}>
            <IconButton style={{ right: '0px' }} onClick={handleClose}>
                <CloseRoundedIcon />
            </IconButton>
            <Accordion defaultExpanded expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                <CustomAccordionSummary title={"Occurrence"} desc={"Vector occurrence information"} />
                <AccordionDetails>
                    <SpeciesInfoBox speciesInfo={popoverContent} />
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} disabled={!bionomicsEnabled}>
                <CustomAccordionSummary title={"Bionomics"} desc={"Vector behavioral information"} />
                <AccordionDetails>
                    <BionomicsDetails bioData={bionomicsData} isfetching={bionomics_is_fetching} status={bionomics_fetch_status} />
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')} disabled={!irEnabled}>
                <CustomAccordionSummary title={"Insecticide Resistance"} desc={"Insecticide Resistance data"} />
                <AccordionDetails>
                    <IrDetails irData={{}} />
                </AccordionDetails>
            </Accordion>
            <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}
                disabled={!environmentEnabled}>
                <CustomAccordionSummary title={"Environment"}
                    desc={"Specimen collection site and environment data"} />
                <AccordionDetails>
                    <EnvironmentCard siteInfo={siteData} isFetching={isFetching} status={status} />
                </AccordionDetails>
            </Accordion>

        </div>

    );
};
