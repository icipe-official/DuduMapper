"use client";
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Card,
  CardContent,
  Typography,
  //Grid,
  Container,
  Box,
  Divider,
} from "@mui/material";
import {
  Biotech,
  Public,
  LocalFlorist,
  // PestControl,
  HealthAndSafety,
} from "@mui/icons-material";

import { PestControl } from "@mui/icons-material";
import { motion } from "framer-motion";
import ForestIcon from "@mui/icons-material/Forest";

//import { Eco } from "@mui/icons-material/Eco";
const About = () => {
  const fullText =
    "  DuduMapper, we believe in the power of data-driven insights to transform public" +
    " health and environmental sustainability. Our vision aligns with the broader mission " +
    "of pioneering global science inentomology— leveraging advanced GIS technology to map and" +
    " analyze insect populations and disease-prone areas. By integrating innovative research with" +
    " real-world applications, we aim to enhance resilience against vector-borne diseases, " +
    "agricultural threats, and ecological shifts. Through deep exploratory study, impact" +
    " assessment, and sustainable capacity building, we strive to make a model for proactive" +
    " insect-borne disease control, ensuring a healthier, more sustainable future for both " +
    "people and the environment.";

  const [displayText, setDisplayText] = useState("");
  const [typing, setTyping] = useState(false);

  const handleMouseEnter = () => {
    if (!typing) {
      setTyping(true);
      setDisplayText(""); // Reset text
      let i = 0;
      const interval = setInterval(() => {
        if (i < fullText.length) {
          setDisplayText((prev) => prev + fullText[i]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 30); // Speed of typing effect
    }
  };

  return (
    <Container sx={{ py: 10 }}>
      {/* Title */}
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#2E7D32" }}
      >
        About <span style={{ color: "#1565C0" }}>DuduMapper</span>
      </Typography>
      <Typography
        variant="h6"
        align="center"
        fontSize="13px"
        color="textSecondary"
        paragraph
      >
        Dudumapper is an innovative GIS project which serves as a critical tool
        in the fight against leishmaniasis, a neglected tropical disease
        affecting millions worldwide. Mapping and visualizing disease prevalence
        alongside population density data is the key to the smarter
        interventions. It encompases on identifying high-risk areas, allocate
        resources effectively, and develop targeted intervention strategies
        through raster data techniques. This project aims to bridge the gap
        between the health through mapping and notifying about the disease.
      </Typography>

      <Card sx={{ mb: 4, boxShadow: 3, p: 2 }}>
        <CardContent>
          <Typography
            fontSize="16px"
            variant="h5"
            sx={{ fontWeight: "bold", color: "#2E7D32" }}
          >
            Background
          </Typography>
          <Typography
            fontSize="13px"
            variant="body1"
            color="textSecondary"
            paragraph
          >
            Visceral leishmaniasis (VL), also known as kala-azar, is fatal if
            left untreated in over 95% of cases. It is characterized by
            irregular bouts of fever, weight loss, enlargement of the spleen and
            liver, and anaemia. Most cases occur in Brazil, east Africa and
            India. An estimated 50 000 to 90 000 new cases of VL occur worldwide
            annually, with only 25–45% reported to WHO. VL has been dated back
            over 2500 BCE, and numerous primeval accounts of disease present in
            both earliest literatures and current molecular discoveries from
            archaeologic resources. Being such a complex, neglected disease,
            leishmaniasis has a profound effect on community health of the world
            and is regarded among the six important tropical diseases by World
            Health Organization. Epidemiologically, leishmaniasis is a
            non-transmissible, vector-borne disease with broad morbidity and
            mortality in over 90 tropical and subtropical geographic regions.
          </Typography>
        </CardContent>
      </Card>
      {/* Section: Why DuduMapper? */}
      <Card sx={{ mb: 4, boxShadow: 3, p: 2 }}>
        <CardContent>
          <Typography
            fontSize="16px"
            variant="h5"
            sx={{ fontWeight: "bold", color: "#2E7D32" }}
          >
            Why DuduMapper?
          </Typography>
          <Typography
            fontSize="13px"
            variant="body1"
            color="textSecondary"
            paragraph
          >
            Leishmaniasis affects over 1 billion people globally , there is an
            urgent need for innovative tools that can identify where the disease
            strikes hardest and who is most vulnerable.
          </Typography>
          <Typography fontSize="13px" variant="body1" color="textSecondary">
            Traditional disease reporting relies on fragmented, often outdated
            information scattered across different health systems. Dudumapper
            fills this gap by providing real-time data on leishmaniasis through
            transforming raw data into actionable insights. With Dudumapper,
            successful tracking is done via notification based system showing
            how different mapped areas are affected and gauging them if how high
            risk or low.
          </Typography>
          <Divider sx={{ my: 2 }} />

          {/* Bullet Points */}
          {[
            {
              icon: <HealthAndSafety fontSize="large" />,
              text:
                "Socioeconomic conditions: Poor living conditions like overcrowded housing and" +
                " inadequate sanitation are associated with increased human exposure to sandflies. " +
                "Poor waste management and open sewage create ideal breeding grounds for sandflies in " +
                "rural and low-income urban areas. Limited access to healthcare may delay diagnosis and treatment, " +
                "which can contribute to more severe disease outcomes..",
            },
            {
              icon: <PestControl fontSize="large" />,
              text:
                "Malnutrition: Deficiencies in protein, iron, vitamin A, and zinc weaken the " +
                "immune system, making it harder to fight Leishmania infections. " +
                "This increases the risk of both cutaneous and visceral leishmaniasis," +
                " leading to more severe illness and poor treatment outcomes.",
            },
            {
              icon: <ForestIcon fontSize="large" />,
              text:
                "Population Mobility  – Migration and displacement due to conflict, economic " +
                "hardship, or environmental changes contribute to the spread of leishmaniasis, " +
                "particularly when non-immune individuals enter endemic areas..",
            },
          ].map((item, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <Box sx={{ mr: 2, color: "#2E7D32" }}>{item.icon}</Box>
              <Typography fontSize="11px" variant="body1" color="textSecondary">
                {item.text}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Main Grid for Two Sections */}
      <Grid container spacing={4} justifyContent="center">
        {/* 🦟 Insect Tracking Section */}
        <Grid item xs={12} md={6}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "#2E7D32" }}
                >
                  <PestControl
                    sx={{ verticalAlign: "middle", mr: 1, fontSize: "14px" }}
                  />
                  Insect Monitoring
                </Typography>
                <Typography
                  fontSize="13px"
                  variant="body1"
                  color="textSecondary"
                >
                  Using GIS, we analyze insect activity across East Africa,
                  focusing on:
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* List of insect-related insights */}
                {[
                  {
                    icon: <Biotech fontSize="medium" />,
                    title: "Vector",
                    desc: "Although most of the literature mentions only one genus transmitting Leishmania to humans (Lutzomyia) in the New World, a 2003 study by Galati suggested a new classification for New World sand flies, elevating several subgenera to the genus level.",
                  },
                  {
                    icon: <LocalFlorist fontSize="medium" />,
                    title: "Spatial Distribution",
                    desc: "GIS technology: Geographic Information Systems (GIS) integrate entomological, epidemiological, and environmental data to map vector distributions and forecast potential disease outbreaks, enabling more targeted interventions",
                  },
                  {
                    icon: <Public fontSize="medium" />,
                    title: "Climate Impact",
                    desc: "Climate change is affecting the spread of leishmaniasis though changes in temperature and rainfall, which affect the size and geographic distribution of sandfly populations. Drought, famine and flood also cause migration of people into areas where the transmission of the parasite is high.",
                  },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", mb: 2 }}
                  >
                    <Box sx={{ mr: 2, color: "#2E7D32" }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {item.title}
                      </Typography>
                      <Typography
                        fontSize="11px"
                        variant="body2"
                        color="textSecondary"
                      >
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* 🏥 Disease-Prone Areas Section */}
        <Grid item xs={12} md={6}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Card sx={{ boxShadow: 3 }}>
              <CardContent>
                <Typography
                  fontSize="16px"
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "#C62828" }}
                >
                  <HealthAndSafety
                    sx={{ verticalAlign: "middle", mr: 1, fontSize: "16px" }}
                  />
                  Disease Surveillance
                </Typography>
                <Typography
                  fontSize="13px"
                  variant="body1"
                  color="textSecondary"
                >
                  Using GIS and spatial analysis, we map disease-prone areas,
                  including:
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* List of disease-related insights */}
                {[
                  {
                    icon: <Biotech fontSize="medium" />,
                    title: "Organismic Factors",
                    desc: "Visceral disease is usually caused by Leishmania donovani, L. infantum, or L. chagasi, but occasionally these species may cause other forms of disease. The cutaneous form of the disease is caused by more than 15 species of Leishmania.",
                  },
                  {
                    icon: <Public fontSize="medium" />,
                    title: "Socio-Economic Factors",
                    desc: "Poor housing and domestic sanitary conditions (lack of waste management or open sewerage) may increase sandfly breeding and resting sites, as well as their access to humans. Sandflies are attracted to crowded housing because it is easier to bite people and feed on their blood. Human behaviour, such as sleeping outside or on the ground, may increase risk.",
                  },
                  {
                    icon: <ForestIcon fontSize="medium" />,
                    title: "Environmental Factors",
                    desc: "Examining how deforestation influences disease spread: The incidence of leishmaniasis can be affected by changes in urbanization, deforestation or the human incursion into forested areas.",
                  },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", mb: 2 }}
                  >
                    <Box sx={{ mr: 2, color: "#C62828" }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {item.title}
                      </Typography>
                      <Typography
                        fontSize="11px"
                        variant="body2"
                        color="textSecondary"
                      >
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Vision Section */}
      {/* Vision Card Inside the Same File */}
      <Card
        sx={{
          mt: 4,
          boxShadow: 3,
          p: 2,
          transition: "all 0.3s",
          "&:hover": {
            boxShadow: 6,
          },
        }}
      >
        <CardContent>
          <Typography
            fontSize="16px"
            variant="h5"
            sx={{ fontWeight: "bold", color: "#1565C0" }}
          >
            Our Vision
          </Typography>
          <Typography fontSize="13px" variant="body1" color="textSecondary">
            The main aim of our project is a healthier, more resilient world
            where data drives proactive disease control and environmental
            sustainability.
            <a onMouseEnter={handleMouseEnter} style={{ color: "green" }}>
              {" "}
              {!typing ? "Read More" : displayText}
            </a>
            <a
              href="https://www.who.int/news-room/fact-sheets/detail/leishmaniasis"
              target="_blank"
              rel="noopener noreferrer"
              title="WHO Leishmaniasis Fact Sheet"
              style={{ paddingLeft: "4px", paddingRight: "4px" }}
            >
              World Health Organization
            </a>
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default About;
