import React, {
    useEffect
} from 'react';
import {
    Box,
    Typography, 
    Container,
    Card,
    CardContent
} from '@mui/material';

export const Logout = ({ }) => {
    const logoutMesssage = 'Danke für die Nutzung unsere Plattform!';
    return (
        <Container>
            <Box 
                minHeight='90vh' 
                display='flex'
                flexDirection='column' 
                justifyContent='center' 
                alignItems='center'
                //border='solid 1px'
                >
            <Card sx={{
                width: '60%'
                //marginTop: 20
            }}>
                <CardContent sx={{
                    display: 'flex', 
                    justifyContent: 'center'
                    }}>
                    <Typography variant='h4' >
                        {logoutMesssage}
                    </Typography>
                </CardContent>
            </Card>
            </Box>
            
        </Container>
    )
}