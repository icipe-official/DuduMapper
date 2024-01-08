import {Card, Divider, LinearProgress} from "@mui/material";
import Typography from "@mui/material/Typography";
import React from "react";
import Box from "@mui/material/Box";
import CardHeader from "@mui/material/CardHeader";

export default function EnvironmentCard({siteInfo, status, isFetching}: { siteInfo: any, status: string, isFetching: boolean }) {
    let siteProps: any = {};
   
    if (status === 'pending' || isFetching) {
        return (
            <LinearProgress/>
        )
    }
    if (siteInfo) {
        siteProps = siteInfo.features[0].properties;

    }
    return (
        <Box>

            <Card>
                <CardHeader
                    title={siteProps['country'] }
                    subheader={"Notes: " + siteProps["site_notes"]}
                />
            </Card>
            <Typography variant="h6">Natural Surroundings</Typography>
            <Typography>Forest: {/* Data Here */}</Typography>
            <Typography>Farming: {/* Data Here */}</Typography>
            <Typography>Livestock: {/* Data Here */}</Typography>
            <Typography>Local Plants: {/* Data Here */}</Typography>

            <Divider/>
            <Typography variant="h6" sx={{mt: 2}}>Community and Occupation</Typography>
            <Typography>Common Occupations: {/* Data Here */}</Typography>
            <Typography>Community Notes: {/* Data Here */}</Typography>

            <Divider/>
            <Typography variant="h6" sx={{mt: 2}}>Daily Activities</Typography>
            <Typography>Leave Home Time: {/* Data Here */}</Typography>
            <Typography>Hours Away: {/* Data Here */}</Typography>
            <Typography>Average Bedtime: {/* Data Here */}</Typography>
            <Typography>Seasonal Labour: {/* Data Here */}</Typography>
            <Typography>Outdoor Activities: {/* Data Here */}</Typography>
            <Divider/>
            <Typography variant="h6" sx={{mt: 2}}>Housing and Living Conditions</Typography>
            <Typography>Roof Type: {/* Data Here */}</Typography>
            <Typography>Wall Material: {/* Data Here */}</Typography>
            <Typography>Cooking Facilities: {/* Data Here */}</Typography>
            <Typography>Open Eaves: {/* Data Here */}</Typography>
            <Typography>House Screening: {/* Data Here */}</Typography>
            <Typography>Housing Notes: {/* Data Here */}</Typography>


        </Box>
    )
}