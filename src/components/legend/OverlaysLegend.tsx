import React, {useState} from "react";
import {
    Box,
    Typography,
    Grid,
    IconButton,
    Stack, Card, CardHeader, ImageList, ImageListItem, ImageListItemBar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CardMedia from "@mui/material/CardMedia";

const LEGEND_URL = 'http://4.221.32.87:8080/geoserver/overlays/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image/png&width=10&height=20&layer=Irrigation&LEGEND_OPTIONS=fontSize:6;fontAntiAliasing:true;dpi:200'
const LEGEND_URL2 = 'http://4.221.32.87:8080/geoserver/overlays/ows?service=WMS&version=1.3.0&request=GetLegendGraphic&format=image/png&width=10&height=20&layer=LAYER_NAME&LEGEND_OPTIONS=fontSize:9;fontAntiAliasing:true;dpi:200'

interface OverlaysLegendProps {
    isOpen: boolean;
    onClose: () => void;
    overlays: string[];
    resolution: number
}

const OverlaysLegend: React.FC<OverlaysLegendProps> = ({
                                                           isOpen,
                                                           onClose,
                                                           overlays,
                                                           resolution
                                                       }) => {
    overlays = ['Irrigation',  'Elevation']

    function legendUrl(overlay: string) {
        return LEGEND_URL2.replace('LAYER_NAME', overlay);
    }

    return (
            <Box className={`download-popup ${isOpen ? "open" : "closed"}`}
                sx={{
                display: 'flex', alignItems: 'flex-start', m: 1,
                position: "absolute",
                top: "40%",
                left: "13%",
                transform: "translate(-50%, -50%)",
                bgcolor: "background.paper",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                borderRadius: "6px ",
                p: 1,
            }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        marginBottom: "15px",
                    }}
                >
                    <CloseIcon/>
                </IconButton>

                <Box sx={{mt: 5, overflowY: 'scroll'}}>
                    {/*<Stack spacing={2}>*/}
                    {/*    {overlays.map((item) => (*/}
                    {/*        <Card>*/}
                    {/*            <CardHeader*/}
                    {/*                title={item}*/}
                    {/*            />*/}
                    {/*            <CardMedia*/}
                    {/*                component="img"*/}
                    {/*                height="300"*/}
                    {/*                image={legendUrl(item)}*/}
                    {/*                alt={item}*/}
                    {/*            />*/}
                    {/*        </Card>*/}
                    {/*    ))}*/}
                    {/*</Stack>*/}

                    <Stack spacing={2}>
                        <Card>
                            <CardHeader
                                title='Irrigation'
                            />
                            <CardMedia
                                component="img"
                                //height="194"
                                image={LEGEND_URL}
                                alt={'Irrigation'}
                            />
                        </Card>

                    </Stack>
                </Box>

            </Box>
    );
};

export default OverlaysLegend;
