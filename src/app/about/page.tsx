"use client";
import AboutContact from "@/components/about/aboutContact";
import AboutHeader from "@/components/about/aboutHeader";
import AboutPartner from "@/components/about/aboutPartner";
import AboutSidebar from "@/components/about/aboutSidebar";
import AboutTeam from "@/components/about/aboutTeam";
import Navbar from "@/components/shared/navbar";
import { Container, Typography } from "@mui/material";
import { useMediaQuery, useTheme } from '@mui/material';

export default function About() {
    const theme = useTheme();
    const isMatch = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <div>
            <Container
                sx={{
                    padding: '10px',
                    maxWidth: isMatch ? null : '90%',
                    marginTop: '40px',
                }}
            >
                <Typography variant="h2" style={{ fontWeight: 'bold', color: '#646464', marginTop: '20px' }}>The Team</Typography>
                <AboutTeam />
                <Typography variant="h2" style={{ fontWeight: 'bold', color: '#646464', marginTop: '20px' }}>About</Typography>
                <AboutHeader />
                <Typography variant="h2" style={{ fontWeight: 'bold', color: '#646464' }}>Our Partners</Typography>
                <AboutPartner />
            </Container>
        </div>
    );
}