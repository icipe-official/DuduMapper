
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

const convertToSensibleName = (key: string) => {
    return key
        .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
        .replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); // Capitalize first letter of each word
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

    let siteProps: any = {};

    if (status === "pending" || isFetching) {
        return <LinearProgress />;
    }

    if (siteInfo) {
        siteProps = siteInfo.features[0].properties;
    }

    const categories: Record<string, string[]> = {
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

            <Card sx={{ backgroundColor: "#1c1c1c", color: "#9E9E9E" }}>
                <CardHeader
                    title={`${siteProps["country"]} `}
                    subheader={"Notes: " + siteProps["site_notes"]}
                    sx={{ backgroundColor: "#212121", color: "#9E9E9E", borderBottom: '1px solid #424242' }} // Updated CardHeader styles
                />
            </Card>
            {Object.keys(categories).map((category) => (
                <Accordion
                    key={category}
                    expanded={activeCategory === category}
                    onChange={() => setActiveCategory(category)}
                    sx={{
                        backgroundColor: activeCategory === category ? "#424242" : "#1c1c1c", // Set a darker color for active and non-active tabs
                        color: activeCategory === category ? "#00E676" : "#9E9E9E", // Set green font color for active tab and grey for non-active tabs
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography variant="h6">
                            {category}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails
                        sx={{
                            backgroundColor: " #f5f7c5 ", // Set yellow background color for expanded content
                            color: "#1B5E20", // Set green font color for expanded content
                        }}
                    >
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
                    sx={{
                        backgroundColor: activeCategory === "Other" ? "#424242" : "#1c1c1c", // Set a darker color for active and non-active tabs
                        color: activeCategory === "Other" ? "#00E676" : "#9E9E9E", // Set green font color for active tab and grey for non-active tabs
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography variant="h6">
                            Other
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails
                        sx={{
                            backgroundColor: " #f5f7c5 ", // Set yellow background color for expanded content
                            color: "#1B5E20", // Set green font color for expanded content
                        }}
                    >
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

