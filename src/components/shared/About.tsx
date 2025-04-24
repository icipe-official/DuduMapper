import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Box,
  Divider,
} from "@mui/material";
import {
  Biotech,
  Public,
  LocalFlorist,
  PestControl,
  HealthAndSafety,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import ForestIcon from "@mui/icons-material/Forest";

//import { Eco } from "@mui/icons-material/Eco";
const AboutDuduMapper = () => {
  return (
    <Container sx={{ py: 5 }}>
      {/* Title */}
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#2E7D32" }}
      >
        About <span style={{ color: "#1565C0" }}>DuduMapper</span>
      </Typography>
      <Typography variant="h6" align="center" color="textSecondary" paragraph>
        An innovative GIS project dedicated to mapping insect populations and
        disease-prone areas in Kenya using advanced raster data techniques.
      </Typography>

      {/* Section: Why DuduMapper? */}
      <Card sx={{ mb: 4, boxShadow: 3, p: 2 }}>
        <CardContent>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#2E7D32" }}
          >
            Why DuduMapper?
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Kenya`s diverse landscapes create unique habitats for
            disease-carrying insects like mosquitoes, tsetse flies, and locusts.
            These insects pose threats to both human populations and food
            security.
          </Typography>
          <Typography variant="body1" color="textSecondary">
            DuduMapper bridges the gap between science, technology, and
            real-world impact by offering a data-driven approach to
            understanding:
          </Typography>
          <Divider sx={{ my: 2 }} />

          {/* Bullet Points */}
          {[
            {
              icon: <HealthAndSafety fontSize="large" />,
              text: "Vector-Borne Diseases – Tracking malaria, dengue, and sleeping sickness hotspots.",
            },
            {
              icon: <PestControl fontSize="large" />,
              text: "Agricultural Risks – Monitoring locust swarms and crop-destroying pests.",
            },
            {
              icon: <ForestIcon fontSize="large" />,
              text: "Climate & Habitat Changes – Understanding how environmental factors influence insect distribution.",
            },
          ].map((item, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", mb: 1 }}
            >
              <Box sx={{ mr: 2, color: "#2E7D32" }}>{item.icon}</Box>
              <Typography variant="body1" color="textSecondary">
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
                    fontSize="large"
                    sx={{ verticalAlign: "middle", mr: 1 }}
                  />
                  Insect Monitoring
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Using GIS, we analyze insect activity across Kenya, focusing
                  on:
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* List of insect-related insights */}
                {[
                  {
                    icon: <ForestIcon fontSize="large" />,
                    title: "Agricultural Pests",
                    desc: "Tracking locust swarms and their movement patterns.",
                  },
                  {
                    icon: <LocalFlorist fontSize="large" />,
                    title: "Ecosystem Balance",
                    desc: "Monitoring pollinators like bees for biodiversity insights.",
                  },
                  {
                    icon: <Public fontSize="large" />,
                    title: "Climate Impact",
                    desc: "Studying how temperature and humidity affect insect distribution.",
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
                      <Typography variant="body2" color="textSecondary">
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
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "#C62828" }}
                >
                  <HealthAndSafety
                    fontSize="large"
                    sx={{ verticalAlign: "middle", mr: 1 }}
                  />
                  Disease Surveillance
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Using GIS and spatial analysis, we map disease-prone areas,
                  including:
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* List of disease-related insights */}
                {[
                  {
                    icon: <Biotech fontSize="large" />,
                    title: "Malaria Hotspots",
                    desc: "Identifying mosquito-breeding areas in affected regions.",
                  },
                  {
                    icon: <Public fontSize="large" />,
                    title: "Dengue & Zika Risk",
                    desc: "Tracking climate-driven outbreaks in tropical zones.",
                  },
                  {
                    icon: <ForestIcon fontSize="large" />,
                    title: "Environmental Factors",
                    desc: "Examining how deforestation influences disease spread.",
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
                      <Typography variant="body2" color="textSecondary">
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
      <Card sx={{ mt: 4, boxShadow: 3, p: 2 }}>
        <CardContent>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#1565C0" }}
          >
            Our Vision
          </Typography>
          <Typography variant="body1" color="textSecondary">
            We envision a future where data-driven mapping transforms public
            health and environmental management, making Kenya a model for
            insect-borne disease control and ecological sustainability.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AboutDuduMapper;
