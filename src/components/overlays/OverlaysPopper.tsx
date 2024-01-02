import React from "react";
import {Collapse, Grid, Stack, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import OverlayCard from "@/components/overlays/OverlayCard";

export default function OverlaysPopper({open, anchorEl}) {

    console.log("Log in Popper", open, anchorEl)

    const overlayLayers = [
        {
            name: 'humidity',
            title: 'Humidity Raster',
            desc: "",
            publisher: "John Doe Institute",
            resolution: '10m',
            date: "10/12/2023"
        },
        {
            name: 'monthly_recipitation',
            title: 'Monthly Precipitation Raster',
            desc: "",
            publisher: "Adek Doe Institute",
            resolution: '10m',
            date: "10/12/2023"
        },
        {
            name: 'mean_ndvi_2023_2024',
            title: 'Mean NDVI 2023-2024 Raster',
            desc: "",
            publisher: "Amilen Institute",
            resolution: '10m',
            date: "10/12/2023"
        },
        {
            name: 'ecozones_2015',
            title: 'Ecofloristic Zones 2015 Raster',
            desc: "",
            publisher: "Fox Research",
            resolution: '10m',
            date: "10/12/2023"
        },
    ]


    return (
        <div className="overlays-section">
            <Collapse in={open}>
                <Box style={{padding: "10px", marginTop: "5px", marginBottom: '5px'}}>
                    <TextField style={{display: "block"}} id="outlined-basic" label="Search Overlays"
                               variant="outlined" sx={{my: 3}}/>
                    <Stack direction='row' spacing={2} sx={{my: 3}}>
                        <TextField id="outlined-basic" label="Filter by Theme" variant="outlined"/>
                        <TextField id="outlined-basic" label="Filter by Country" variant="outlined"/>
                    </Stack>
                </Box>
                <Box style={{marginTop: "5px", marginBottom: '5px'}}>
                    <Grid container spacing={2}>
                        {

                            overlayLayers.map((overlay) => (
                                    <Grid item xs={6}>
                                        <OverlayCard title={overlay.title} name={overlay.name}/>
                                    </Grid>
                                )
                            )

                        }
                    </Grid>
                </Box>

            </Collapse>
        </div>
    )
}