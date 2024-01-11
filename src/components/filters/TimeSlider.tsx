import {Slider} from "@mui/material";
import {useState} from "react";
import './times_slide.css'

export default function TimeSlider ({ onChange }) {
    const currentYear = new Date().getFullYear();
    const [startYear, setStartYear] = useState(1970);
    const [endYear, setEndYear] = useState(currentYear);

    const handleChange = (values: number | number[]) => {
        const selectedValues = Array.isArray(values) ? values : [values, values];
        setStartYear(selectedValues[0]);
        setEndYear(selectedValues[1]);
        onChange(
            new Date(selectedValues[0], 0),
            new Date(selectedValues[1], 11, 31)
        );
    };

    return (
        <div className="time-slider">
            <div className="slider-container">
                <div className="time-slider-info">Start Year: {startYear}</div>
                <div className="time-slider-info">End Year: {endYear}</div>
                <Slider
                    range
                    min={1970}
                    max={currentYear}
                    defaultValue={[1970, currentYear]}
                    onChange={handleChange}
                    marks={{
                        1970: "1970",
                        1980: "1980",
                        1990: "1990",
                        2000: "2000",
                        2010: "2010",
                        2020: "2020",
                        [currentYear]: `${currentYear}`,
                    }}
                />
            </div>
        </div>
    );
}