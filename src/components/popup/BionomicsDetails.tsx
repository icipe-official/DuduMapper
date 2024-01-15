import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";

export default function BionomicsDetails({ bioData, status, isfetching }: { bioData: any, status: string, isfetching: boolean }) {

    const [isBitingPeakVisible, setBitingPeakVisible] = useState(false);

    const toggleBitingPeak = () => {
        setBitingPeakVisible(prevState => !prevState);
    };
    if (status === "pending" || isfetching) {
        return <LinearProgress />;
    }
    return (
        <div>
            {/* Collapsible List for Biting Peak */}
            <div className="collapsible">
                <Typography
                    sx={{ cursor: 'pointer' }}
                    onClick={toggleBitingPeak}
                >
                    {isBitingPeakVisible ? '▼ ' : '► '}Biting peak
                </Typography>
                {isBitingPeakVisible && (
                    <div className="content">
                        <Typography>
                            Biting peak details: {}
                        </Typography>
                        {/* Add more details as needed */}
                    </div>
                )}
            </div>


        </div>
    )
}
