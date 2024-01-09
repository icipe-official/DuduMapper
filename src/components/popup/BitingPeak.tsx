import {Slider} from "@mui/material";
import React from "react";
import Typography from "@mui/material/Typography";

export default function BitingPeak({period, nights, bitingPeak}: {period: string, nights: number, bitingPeak: [number, number]}) {

    function valuetext(value: number) {
        return `${value} HRS`;
    }

    return (
        <div className="content">
            <Typography>Nights: {nights}</Typography>
            <Slider
                getAriaLabel={() => period}
                defaultValue={bitingPeak}
                valueLabelDisplay="auto"
                getAriaValueText={valuetext}
            />
        </div>

    )
}