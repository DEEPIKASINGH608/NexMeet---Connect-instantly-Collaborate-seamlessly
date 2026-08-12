import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { IconButton, Box, CircularProgress } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import server from '../environment';


export default function History() {

    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(Array.isArray(history) ? history : []);
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Fallback if string is invalid date format
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    return (
        <Box sx={{ p: 3, color: '#ffffff', minHeight: '100vh' }}>

            <IconButton
                onClick={() => routeTo("/home")}
                sx={{ color: '#ffffff', mb: 2 }}
            >
                <HomeIcon />
            </IconButton>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress color="inherit" />
                </Box>
            ) : meetings.length > 0 ? (
                meetings.map((e, i) => (
                    <Card
                        key={e._id || e.id || i}
                        variant="outlined"
                        sx={{ mb: 2, backgroundColor: '#1e1e1e', borderColor: '#333' }}
                    >
                        <CardContent>
                            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                Code: <span style={{ color: '#fff' }}>{e.meetingCode || e.meeting_id || 'N/A'}</span>
                            </Typography>
                            <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                Date: <span style={{ color: '#fff' }}>{formatDate(e.date || e.createdAt)}</span>
                            </Typography>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <Typography variant="body1" sx={{ mt: 2, color: '#aaa' }}>
                    No meeting history found.
                </Typography>
            )}
        </Box>
    );
}

