import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import {Paper, Table, TableBody, TableCell, TableContainer, TableRow} from "@mui/material";
import {useState} from "react";
import Typography from "@mui/material/Typography";
import withWidth from "@mui/material/Hidden/withWidth";

export default function InfoDrawer({feature, open}: { feature: any, open: boolean }) {
    if (open) {
        return (
            <Drawer
                open={open}
                anchor="right"
                style={{
                    position: "absolute",
                    width: "350px"
                }}
                // sx={{
                //     width: 350,
                //     flexShrink: 0,
                //     '& .MuiDrawer-paper': {
                //         width: 350,
                //         boxSizing: 'border-box',
                //         top: ['48px', '56px', '64px'],
                //         height: 'auto',
                //         bottom: 0,
                //     },
                // }}
                variant="persistent"
            >
                <Box sx={{display: "flex", backgroundColor: "plum", padding: 3}}>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        <Typography>Main Crop</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {feature["crop"]}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

            </Drawer>)
    }
}