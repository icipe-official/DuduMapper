
import React, { useState } from "react";
import {
    Card,
    Divider,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    CardHeader,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const convertToSensibleName = (key) => {
    return key
        .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); // Capitalize first letter of each word
};

export default function EnvironmentCard({
    siteInfo,
    status,
    isFetching,
}: {
    siteInfo: any;
    status: string;
    isFetching: boolean;
}) {
    const [activeCategory, setActiveCategory] = useState("Community and Occupation");

    let siteProps = {};

    if (status === "pending" || isFetching) {
        return <LinearProgress />;
    }

    if (siteInfo) {
        siteProps = siteInfo.features[0].properties;
    }

    const categories = {
        "Community and Occupation": ["occupations", "site_notes"],
        "Daily Activities": ["leave_home_time", "hours_away", "average_bedtime", "seasonal_labour", "outdoor_activity"],
        "Housing and Living Conditions": ["roof", "walls", "cooking", "open_eaves", "house_screening", "georef_notes"],
        "People's Lifestyle": ["average_awake_time", "sleeping_outdoors", "farming_notes", "land_use", "livestock", "livestock_notes", "plants_species"],
    };

    const ignoreCategory = ["admin_1", "admin_2", "area_type", "confidence", "georef_source", "name", "id"];

    const otherCategory = Object.keys(siteProps).filter(
        (key) =>
            !ignoreCategory.includes(key) && !Object.values(categories).flat().includes(key)
    );

    return (
        <Box>
            <Card>
                <CardHeader
                    title={`${siteProps["country"]} `}
                    subheader={"Notes: " + siteProps["site_notes"]}
                />
            </Card>

            {Object.keys(categories).map((category) => (
                <Accordion
                    key={category}
                    expanded={activeCategory === category}
                    onChange={() => setActiveCategory(category)}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">{category}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box>
                            {categories[category].map((key) => (
                                <Typography key={key}>
                                    {convertToSensibleName(key)}: {siteProps[key] || 'NA'}
                                </Typography>
                            ))}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            ))}

            {otherCategory.length > 0 && (
                <Accordion
                    expanded={activeCategory === "Other"}
                    onChange={() => setActiveCategory("Other")}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Other</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box>
                            {otherCategory.map((key) => (
                                <Typography key={key}>
                                    {convertToSensibleName(key)}: {siteProps[key] || 'NA'}
                                </Typography>
                            ))}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            )}
        </Box>
    );
}

