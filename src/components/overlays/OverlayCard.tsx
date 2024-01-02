import {Card, CardMedia, CardHeader, CardContent, Typography, CardActions, IconButton} from "@mui/material";
import './overlays.css'
import {BASE_PATH} from "@/lib/constants";
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import React from "react";
import OverlayCheckbox from "@/components/overlays/OverlayCheckBox";

export default function OverlayCard({name, title}) {
    console.log("Overlay Name",name)
    return (
        <div>
            <Card sx={{boxShadow: 5}}>
                <CardMedia
                    component="img"
                    image={`${BASE_PATH}/images/gambie.png`}
                    alt={title}
                />
                <CardHeader title={title}>
                    <IconButton>
                        <TipsAndUpdatesIcon/>
                    </IconButton>
                </CardHeader>
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        There is no one who loves pain itself, who seeks after it and wants to have it, simply because
                        it is pain.
                    </Typography>
                </CardContent>
                <CardActions>
                    <OverlayCheckbox/>
                </CardActions>
            </Card>
        </div>
    )
}