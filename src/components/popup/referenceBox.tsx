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
import { FaBook, FaCalendar, FaFileAlt, FaInfoCircle, FaLink, FaNewspaper, FaStickyNote, FaUser } from 'react-icons/fa'; // Import icons
import StorageIcon from '@mui/icons-material/Storage';
import Link from 'next/link';
import { fetchProxy } from "@/lib/proxy";
const convertToSensibleName = (key: string) => {
  return key
    .replace(/[_-]/g, " ") // Replace underscores and hyphens with spaces
    .replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); // Capitalize first letter of each word
};

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
  const [linkElement, setLinkElement] = useState<React.ReactNode>(
    <div>Checking DOI validity...</div>
  );
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
  if (reference_fetch_status === "pending" || reference_is_fetching) {
    return <LinearProgress />;
  }

  // Render error state
  if (reference_fetch_status === "error") {
    console.log("", reference_fetch_status);
    // return <div>Error fetching data</div>;
  }

  // Configuration object for explicit keys, icons, and display names
  const keyConfig = [
    { key: "article_title", icon: <FaBook />, displayName: "Article Title", shouldRender: true },
    { key: "author", icon: <FaUser />, displayName: "Author", shouldRender: true },
    { key: "contact_author", icon: <FaInfoCircle />, displayName: "Contact Author", shouldRender: true },
    { key: "publication_year", icon: <FaFileAlt />, displayName: "Publication Year", shouldRender: true },
    { key: "journal_title", icon: <FaNewspaper />, displayName: "Journal Title", shouldRender: true },
    { key: "year", icon: <FaCalendar />, displayName: "Year", shouldRender: true },
    { key: "doi", icon: <FaLink />, displayName: "DOI", shouldRender: true },
    { key: "source_notes", icon: <FaStickyNote />, displayName: "Source Notes", shouldRender: true },
  ];

  // Generic icon for keys not explicitly listed in the configuration
  const genericIcon = <span>&#x1F4AC;</span>; // You can replace this with your desired generic icon

  interface MyError {
    message: string;
  }




  const renderReference = (key: any): any => {
    if (key === "doi") {
      const doiValue = referenceProperties[key];

      if (!doiValue) {
        // Handle missing DOI (optional)
        return <span style={{ fontWeight: "350" }}>Missing DOI</span>;
      }

      const doiUrl = `/doi_endpoint?doi=https://doi.org/${doiValue}`;


      fetch(doiUrl)
        .then(response => response.json()) // Parse JSON response
        .then(data => {
          const { reachable, response: status } = data;
          if (reachable === true) { // Check if the response status is reachable
            setLinkElement(<Link href={`https://doi.org/${doiValue}`}>
              <Box sx={{ fontWeight: "350" }}>{doiValue}</Box>
            </Link>)
          } else if (reachable === false) {
            setLinkElement(<span style={{ fontWeight: "350" }}>{doiValue}</span>)
          } else {
            console.error("Invalid response for DOI:", status);
            setLinkElement(<span style={{ fontWeight: "350" }}>{doiValue}</span>)
          }
        })
        .catch(error => {
          console.error("Error fetching DOI:", error);
          return <span style={{ fontWeight: "350" }}>{doiValue} (Unreachable)</span>;
        });
      return linkElement;
    } else {
      // Handle other keys
      return <span style={{ fontWeight: "350" }}>{referenceProperties[key]}</span>;
    }
  };



  // List of keys to ignore in rendering
  const ignoreCategoryList = ["id"];

  // Render content when data is available
  return (
    <Box>
      <Accordion
        expanded={activeCategory === "Details"}
        onChange={() => setActiveCategory("Details")}
        sx={{
          backgroundColor: activeCategory === "Details" ? "#C4C4C4" : "#1c1c1c",
          color: activeCategory === "Details" ? "#333" : "#9E9E9E",
        }}
      >
        <AccordionSummary expandIcon={<StorageIcon />}>
          <Typography sx={{ fontWeight: 'bold' }} variant="h6">Source Notes</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: "#fff",
            color: "#333",
          }}
        >


          {keyConfig
            .filter(({ key }) => !ignoreCategoryList.includes(key))
            .map(({ key, icon, displayName }) => (
              referenceProperties[key] !== null && (
                <>
                  <span style={{ fontWeight: '600' }}>
                    {icon} {key == 'doi' ? displayName.toUpperCase() : convertToSensibleName(key)}:
                  </span>
                  <span style={{ fontWeight: '350' }}> {renderReference(key)}</span>
                  <br></br>
                </>
              )
            ))}


          {Object.entries(referenceProperties)
            .filter(([key]) => !keyConfig.some((config) => config.key === key) && !ignoreCategoryList.includes(key))
            .map(([key, value]) => (
              value !== null && (
                <Typography key={key}>
                  {genericIcon} {key == 'doi' ? key.toUpperCase() : convertToSensibleName(key)}: {referenceProperties[key]}
                </Typography>
              )
            ))}


        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ReferenceDetails;

