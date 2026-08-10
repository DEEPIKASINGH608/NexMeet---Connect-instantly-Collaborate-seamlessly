import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

export default function History() {

    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])


    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(Array.isArray(history) ? history : []);
            } catch (error) {
                console.error(error);
            }
        };

        fetchHistory();
    }, [])

    return (
        <div>

            {meetings.map((e, index) => {
                return (
                    <>
                        <IconButton onClick={() => {
                            routeTo("/home")
                        }}>
                            <HomeIcon />

                        </IconButton>
                        <Card key={e._id || index} variant="outlined" sx={{ mb: 2 }}>

                            <CardContent>
                                <Typography sx={{ fontsize: 14 }} color="text.secondary" gutterButtom>
                                    Word of the day
                                </Typography>
                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                    adjective
                                </Typography>
                                <Typography variant="body2">
                                    well meaning and kindly
                                    <br />
                                    {'"a benevolent smile"'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </>

                );
            })}
        </div >

    );

}