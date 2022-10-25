import { Stack, Paper, Box, Typography, Divider } from '@mui/material'
import React, { useContext, useEffect } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import { Data } from '../context/Data/Index';

const StatusPage = () => {
    const context: any = useContext(Data)

    useEffect(() => {
        context.fetchLogs("0").then((data: any) => console.log(data, "hey"))
    }, [])


    return (
        <Box m="8rem auto">
            <Typography variant="h4" mb="2rem" textAlign="center">
                Service Status
            </Typography>
            <Box sx={{ width: "60rem" }}>
                <Paper elevation={4}>
                    <Stack sx={{ p: "1rem" }} direction="row" justifyContent="space-between">
                        <Typography variant="h6">
                            Current status by service
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={4}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <CheckCircleIcon sx={{ color: "green" }} />
                                <span>Active</span>
                            </Stack>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <DoNotDisturbOnIcon sx={{ color: "red" }} />
                                <span>Down</span>
                            </Stack>
                        </Stack>
                    </Stack>
                    <Divider />
                    <Stack>
                        <Stack sx={{ p: "1rem" }} direction="row" justifyContent="space-between">
                            <Typography variant="body1" >
                                SSA BOT
                            </Typography>
                            <CheckCircleIcon sx={{ color: "green" }} />
                        </Stack>
                        <Divider />
                        <Stack sx={{ p: "1rem" }} direction="row" justifyContent="space-between">
                            <Typography variant="body1">
                                LDN BOT
                            </Typography>
                            <CheckCircleIcon sx={{ color: "green" }} />
                        </Stack>
                    </Stack>
                </Paper>
            </Box>
        </Box>
    )
}

export default StatusPage