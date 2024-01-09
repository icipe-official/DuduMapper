import React from "react";
import { styled } from '@mui/material/styles';
import { Card, IconButton, IconButtonProps } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { BASE_PATH } from "@/lib/constants";
import {useQuery} from "@tanstack/react-query";
import {fetchOccurrenceSamples} from "@/api/occurrence";
import Box from "@mui/material/Box";


interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));
export default function SpeciesInfoBox({ speciesInfo }: { speciesInfo: any }) {
    const [expanded, setExpanded] = React.useState(false);

    const {
        status,
        data: occurrence_samples,
        error,
        isFetching,
    } = useQuery({
        queryKey: ["occurrence_samples", speciesInfo['occurrence_id']],
        queryFn: ({ queryKey }) => fetchOccurrenceSamples(queryKey[1])
    });

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const cardStyle = {
        display: 'block',
        transitionDuration: '0.3s',
    }
    return (
        <Card style={cardStyle}>
            <CardHeader
                title={`${speciesInfo['species']} ${speciesInfo['vector']}`}
                subheader={`Sampled between ${speciesInfo['start_month']}/${speciesInfo['start_year']} to ${speciesInfo['end_month']}/${speciesInfo['end_year']}`}
            >h
            </CardHeader>
            <CardMedia
                component="img"
                image={`${BASE_PATH}/images/gambie.png`}
                alt={speciesInfo['species']}
            />
            <CardContent>
                <Typography >
                    Sampling Methods
                </Typography>
                <Box sx={{display: 'flex', m: 1, p: 1,fontSize: '0.875rem', fontWeight: '700',}}>

                </Box>
            </CardContent>
            <CardActions disableSpacing>
                <ExpandMore
                    expand={expanded}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                >
                    <ExpandMoreIcon />
                </ExpandMore>
            </CardActions>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                    <Typography paragraph>Method:</Typography>
                    <Typography paragraph>
                        Heat 1/2 cup of the broth in a pot until simmering, add saffron and set
                        aside for 10 minutes.
                    </Typography>
                    <Typography paragraph>
                        Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over
                        medium-high heat. Add chicken, shrimp and chorizo, and cook, stirring
                        occasionally until lightly browned, 6 to 8 minutes. Transfer shrimp to a
                        large plate and set aside, leaving chicken and chorizo in the pan. Add
                        pimentón, bay leaves, garlic, tomatoes, onion, salt and pepper, and cook,
                        stirring often until thickened and fragrant, about 10 minutes. Add
                        saffron broth and remaining 4 1/2 cups chicken broth; bring to a boil.
                    </Typography>
                    <Typography paragraph>
                        Add rice and stir very gently to distribute. Top with artichokes and
                        peppers, and cook without stirring, until most of the liquid is absorbed,
                        15 to 18 minutes. Reduce heat to medium-low, add reserved shrimp and
                        mussels, tucking them down into the rice, and cook again without
                        stirring, until mussels have opened and rice is just tender, 5 to 7
                        minutes more. (Discard any mussels that don&apos;t open.)
                    </Typography>
                    <Typography>
                        Set aside off of the heat to let rest for 10 minutes, and then serve.
                    </Typography>
                </CardContent>
            </Collapse>
        </Card>
    )

}
