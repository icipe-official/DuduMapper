import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import AccordionSummary from "@mui/material/AccordionSummary";
import React from "react";

export default function CustomAccordionSummary({ title, desc }: { title: string, desc: string }) {
    return (
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
            style={{ backgroundColor: "#ddd", color: "white" }}
        >
            <Typography sx={{ width: '33%', flexShrink: 0, color: '#000', fontWeight: 'Bold' }}>
                {title}
            </Typography>
            <Typography sx={{ color: '#444', }}>
                {desc}
            </Typography>
        </AccordionSummary>
    )
}
