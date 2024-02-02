// TimeSlider.tsx
import React, { useEffect } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "./time_slider.css";

interface TimeSliderProps {
  onChange: (startDate: number, endDate: number) => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ onChange }) => {
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = React.useState(1970);
  const [endYear, setEndYear] = React.useState(currentYear);

  const minYear = 1970;

  const isValidDate = (date: Date) => {
    return !isNaN(date.getTime());
  };
  const handleChange = (values: number | number[]) => {
    const selectedValues = Array.isArray(values) ? values : [values, values];

    console.log("Dates selected", values);
    setStartYear(selectedValues[0]);
    setEndYear(selectedValues[1]);
  };

  const handleChangeCommitted = (values: number | number[]) => {
    const selectedValues = Array.isArray(values) ? values : [values, values];
    console.log("Change committed with", startYear, endYear);
    onChange(selectedValues[0], selectedValues[1]);
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
          //onChange={handleChange}
          onChangeComplete={handleChangeCommitted}
          onChange={handleChange}
          // valueLabelDisplay="auto"
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
};

export default TimeSlider;
