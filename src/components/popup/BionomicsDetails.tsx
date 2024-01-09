import Typography from "@mui/material/Typography";
import React, {useState} from "react";
import {LinearProgress, Slider} from "@mui/material";
import BitingPeak from "@/components/popup/BitingPeak";
import Box from "@mui/material/Box";

export default function BionomicsDetails({bioData, status, isFetching}: {
    bioData: any,
    status: string,
    isFetching: boolean
}) {

    const [isBitingPeakVisible, setBitingPeakVisible] = useState(false);

    const toggleBitingPeak = () => {
        setBitingPeakVisible(prevState => !prevState);
    };
    if (status === 'pending' || isFetching) {
        console.log("Bionomics loading...")
        return (
            <LinearProgress/>
        )
    }
    if (!bioData) {
        return null;
    }

    return (
        <div className="collapsible">
            <Typography
                sx={{cursor: 'pointer'}}
                onClick={toggleBitingPeak}
            >
                {isBitingPeakVisible ? '▼ ' : '► '} Biting peak
            </Typography>
            {status === 'success' && (<Box>
                    <BitingPeak period={'Combined Peak'} nights={bioData['combined_peak_start']}
                                bitingPeak={[bioData['combined_peak_start'], bioData['combined_peak_end']]}/>

                    <BitingPeak period={'Indoor Peak'} nights={bioData['combined_peak_start']}
                                bitingPeak={[bioData['indoor_peak_start'], bioData['indoor_peak_end']]}/>

                    <BitingPeak period={'Outdoor Peak'} nights={bioData['outdoor_peak_start']}
                                bitingPeak={[bioData['outdoor_peak_start'], bioData['outdoor_peak_end']]}/>
                </Box>
            )}
        </div>

    )
}