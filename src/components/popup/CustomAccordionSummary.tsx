import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import AccordionSummary from "@mui/material/AccordionSummary";
import React from "react";

export default function CustomAccordionSummary({title, desc}: {title: string, desc: string}) {
    return(
        <AccordionSummary
            expandIcon={<ExpandMoreIcon/>}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
            style={{backgroundColor: "#3b4252", color: "white"}}
        >
            <Typography sx={{width: '33%', flexShrink: 0,}}>
                {title}
            </Typography>
            <Typography sx={{color: 'text.secondary white',}}>
                {desc}
            </Typography>
        </AccordionSummary>
    )
 }