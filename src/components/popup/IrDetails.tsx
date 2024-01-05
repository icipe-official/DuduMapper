import Typography from "@mui/material/Typography";
import React, {useState} from "react";

export default function IrDetails({irData}) {

    const [isBioessaysVisible, setBioessaysVisible] = useState(false);
    const [isGeneticMechanismsVisible, setGeneticMechanismsVisible] = useState(false);

    const toggleBioessays = () => setBioessaysVisible(prevState => !prevState);
    const toggleGeneticMechanisms = () => setGeneticMechanismsVisible(prevState => !prevState);


    return (
        <div>
            <div className="collapsible">
                <Typography
                    sx={{cursor: 'pointer'}}
                    onClick={toggleBioessays}
                >
                    {isBioessaysVisible ? '▼ ' : '► '} Bioessays
                </Typography>
                {isBioessaysVisible && (
                    <div className="content">
                        <Typography>
                            Details about Bioessays {/* Add relevant content */}
                        </Typography>
                        {/* Add more details as needed */}
                    </div>
                )}
            </div>

            <div className="collapsible">
                <Typography
                    sx={{cursor: 'pointer'}}
                    onClick={toggleGeneticMechanisms}
                >
                    {isGeneticMechanismsVisible ? '▼ ' : '► '} Genetic Mechanisms
                </Typography>
                {isGeneticMechanismsVisible && (
                    <div className="content">
                        <Typography>
                            Details about Genetic mechanisms {/* Add relevant content */}
                        </Typography>
                        {/* Add more details as needed */}
                    </div>
                )}
            </div>
        </div>
    )
}