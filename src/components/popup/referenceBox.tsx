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
import { FaBook, FaFileAlt, FaInfoCircle, FaUser } from 'react-icons/fa'; // Import icons

interface ReferenceDetailsProps {
  referenceData: any;
  reference_fetch_status: string;
  reference_is_fetching: boolean;
}

const ReferenceDetails: React.FC<ReferenceDetailsProps> = ({
  referenceData,
  reference_fetch_status,
  reference_is_fetching,
}) => {
  const [activeCategory, setActiveCategory] = useState("Details");

  useEffect(() => {
    // Update active category when the referenceData changes
    if (referenceData) {
      setActiveCategory("Details");
    }
  }, [referenceData]);

  // Check if referenceData exists, and extract properties
  const referenceProperties = referenceData?.features[0].properties || {};
  console.log("article_title: ", referenceProperties["article_title"])
  // Render loading state
  if (reference_is_fetching || reference_fetch_status === "loading") {
    return <LinearProgress />;
  }

  // Render error state
  if (reference_fetch_status === "error") {
    console.log("", reference_fetch_status);
    // return <div>Error fetching data</div>;
  }

  // Configuration object for explicit keys, icons, and display names
  const keyConfig = [
    { key: "article_title", icon: <FaBook />, displayName: "Article Title" },
    { key: "author", icon: <FaUser />, displayName: "Author" },
    { key: "contact_author", icon: <FaInfoCircle />, displayName: "Contact Author" },
    { key: "publication_year", icon: <FaFileAlt />, displayName: "Publication Year" },
  ];

  // Generic icon for keys not explicitly listed in the configuration
  const genericIcon = <span>&#x1F4AC;</span>; // You can replace this with your desired generic icon

  // Render content when data is available
  return (
    <Box>
      <Accordion
        expanded={activeCategory === "Details"}
        onChange={() => setActiveCategory("Details")}
        sx={{
          backgroundColor: activeCategory === "Details" ? "#424242" : "#1c1c1c",
          color: activeCategory === "Details" ? "#00E676" : "#9E9E9E",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Details</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "#f5f7c5",
            color: "#1B5E20",
          }}
        >
          {keyConfig.map(({ key, icon, displayName }) => (
            <Typography key={key}>
              {icon} {displayName}: {referenceProperties[key] !== null ? referenceProperties[key] : "NA"}
            </Typography>
          ))}
          {Object.keys(referenceProperties).map((key) => {
            // Check if the key is not in the configuration
            const isKeyNotInConfig = !keyConfig.some((config) => config.key === key);

            return (
              <Typography key={key}>
                {isKeyNotInConfig ? genericIcon : null} {key}: {referenceProperties[key] !== null ? referenceProperties[key] : "NA"}
              </Typography>
            );
          })}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ReferenceDetails;

