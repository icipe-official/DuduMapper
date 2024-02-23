import React, { useState, useEffect } from "react";
import {
    LinearProgress,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface BionomicsDetailsProps {
    bionomicsData: any;
    bionomics_fetch_status: string;
    bionomics_is_fetching: boolean;
}

const convertToSensibleName = (key: string) => {
    return key
        .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
        .replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); // Capitalize first letter of each word
};
const toTitleCase = (name: string) => {
    if (!name) {
        return "";
    }

    // Use a regular expression to split the name by capital letters
    const words = name.split(/(?=[A-Z])/);

    // Capitalize the first letter of each word except for "and"
    const titleCasedWords = words.map(word => {
        const lowerCasedWord = word.toLowerCase();
        return lowerCasedWord === "and" ? lowerCasedWord : lowerCasedWord.charAt(0).toUpperCase() + lowerCasedWord.slice(1);
    });

    // Join the words back into a single string
    const titleCasedName = titleCasedWords.join(" ");

    return titleCasedName;
}

const BionomicsDetails: React.FC<BionomicsDetailsProps> = ({
    bionomicsData,
    bionomics_fetch_status,
    bionomics_is_fetching,
}) => {
    const [activeCategory, setActiveCategory] = useState("Temporal");

    useEffect(() => {
        // Update active category when the bionomicsData changes
        if (bionomicsData) {
            setActiveCategory(Object.keys(categories)[0]); // Set to the first category
        }
    }, [bionomicsData]);
    const [clickedCategory, setClickedCategory] = useState("");
    // Group the properties into categories
    const categories = {
        Temporal: [
            "combined_peak_start",
            "combined_peak_end",
            "combined_peak_nights",
            "indoor_peak_start",
            "indoor_peak_end",
            "indoor_peak_nights",
            "outdoor_peak_start",
            "outdoor_peak_end",
            "outdoor_peak_nights",
            "gonotrophic_cycle_days",
        ],
        HostPreferences: [
            "host_preference_id",
            "combined_host",
            "combined_host_n",
            "combined_host_total",
            "host_sampling_outdoor",
            "indoor_host_n",
            "indoor_host_perc",
            "indoor_host_total",
            "other_host_n",
            "other_host_total",
            "outdoor_host_n",
            "outdoor_host_perc",
            "outdoor_host_total",
            "host_other",
            "host_other_unit",
            "host_sampling_combined",
            "host_sampling_indoor",
            "host_sampling_other",
            "host_unit",
            "host_preference_notes",
        ],
        BitingAndRestingRates: [
            "biting_peak_id",
            "biting_rate_id",
            "combined_hbr",
            "indoor_hbr",
            "abr",
            "abr_sampling_combined",
            "abr_unit",
            "biting_rate_notes",
            "hbr_sampling_combined",
            "hbr_sampling_indoor",
            "hbr_unit",
        ],
        SurvivalAndReproduction: ["daily_survival_rate", "parity_n", "parity_percent", "parity_total"],
        InfectionAndBionomics: ["infection_id", "bionomics_id"],
    };

    // Check if bionomicsData exists, and extract properties
    const bionomicsProperties = bionomicsData?.features[0].properties || {};

    // Render loading state
    if (bionomics_is_fetching || bionomics_fetch_status === "loading") {
        return <LinearProgress />;
    }

    // Render error state
    if (bionomics_fetch_status === "error") {
        console.log(bionomics_fetch_status);
        // return <div>Error fetching data</div>;
    }

    // Render content when data is available
    return (
        <Box>
            {Object.entries(categories).map(([category, properties]) => (
                <Accordion
                    key={category}
                    expanded={activeCategory === category}
                    onChange={() => setActiveCategory(category)}
                    sx={{
                        backgroundColor: activeCategory === category ? "#c4c4c4" : "#ddd",
                        color:
                            activeCategory === category
                                ? "#666"
                                : "#222",
                        "&:hover": {
                            color: "#038543",
                            transition: "color 0.3s ease-in-out",
                        },

                        "&:active": {
                            color: "#0d0", // Change color during click
                            transition: "color 0.0s ease-in-out",
                        },
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{
                        color: "#038543", "&:active": {
                            color: "#0d0", // Change color during click
                            transition: "color 0.0s ease-in-out",
                        },
                    }} />}>
                        <Typography variant="h6">{toTitleCase(category)}</Typography>
                    </AccordionSummary>
                    <AccordionDetails
                        sx={{
                            backgroundColor: "#ffffff",
                            color: "#333",
                        }}
                    >
                        {properties.map((property) => (
                            bionomicsProperties[property] !== null && (
                                <>
                                    <span style={{ fontWeight: '750' }}>
                                        {convertToSensibleName(property)}:
                                    </span>
                                    <span style={{ fontWeight: '400' }}> {bionomicsProperties[property]}</span>
                                    <br></br>
                                </>
                            )
                        ))}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default BionomicsDetails;

