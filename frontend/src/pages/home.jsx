import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import withAuth from '../utils/withAuth';
import "../App.css";
import { IconButton } from '@mui/material';
import RestoreIcon from '@mui/icons-material/'


function HomeComponent() {

    let navigate = useNavigate();
        const [meetingCode, setMeetingCode] = useState("");
        let handleJoinVideoCall = async () => {
            navigate(`/${meetinCode}`)
        }

    return (
        <>
            <div className="navBar">
                <div style={{display: "flex", alignItems: "center"}}>
                    <h3>NexMeet</h3>
                </div>
            </div>

            <div style={{display: "flex", alignItems: "center"}}>
                <IconButton>
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