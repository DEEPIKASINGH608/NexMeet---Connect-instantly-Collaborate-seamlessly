import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material';
import CardContent from '@mui/material';
import Box from '@mui/material';
import CardActions from '@mui/material';
import Typography from '@mui/material';
import withAuth from '../utils/withAuth';
import "../App.css";
import { IconButton, Button } from '@mui/material';
import { Restore as RestoreIcon, Videocam as VideocamIcon } from '@mui/icons-material';

function HomeComponent() {

    let navigate = useNavigate();
        const [meetingCode, setMeetingCode] = useState("");
        let handleJoinVideoCall = async () => {
            navigate(`/${meetingCode}`);
        }

    return (
        <>
            <div className="navBar">
                <div style={{display: "flex", alignItems: "center"}}>
                    <h3>NexMeet</h3>
                </div>
            </div>

            <div style={{display: "flex", alignItems: "center"}}>
                <IconButton onClick={
                    () => {
                        navigate("/history")
                    }
                }>
                    <RestoreIcon />
                    <p> History</p>
                </IconButton>
                <Button onClick={() =>{
                    localStorage.removeItem("token")
                    navigate("/auth")
                }}>
                    Logout
                </Button>
            </div>


        </>
    )
}

export default withAuth(HomeComponent)