import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import withAuth from '../utils/withAuth';
import "../App.css";

import {
  Button,
  IconButton,
  TextField
} from '@mui/material';
import { Restore as RestoreIcon } from '@mui/icons-material';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    let handleJoinVideoCall = async () => {
        if (meetingCode.trim()) {
            navigate(`/${meetingCode}`);
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0b0314", color: "#ffffff" }}>
            {/* Header / Navbar */}
            <div className="navBar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 3rem" }}>
                <div>
                    <h2 style={{ margin: 0, fontWeight: "bold", color: "#ffffff" }}>NexMeet</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <IconButton
                        onClick={() => navigate("/history")}
                        style={{ color: "#94a3b8", fontSize: "1rem" }}
                    >
                        <RestoreIcon style={{ color: "#94a3b8" }} />
                        <span style={{ marginLeft: "6px", fontSize: "1rem", color: "#94a3b8" }}>History</span>
                    </IconButton>
                    <Button
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/auth");
                        }}
                        style={{ color: "#2563eb", fontWeight: "bold", fontSize: "1rem" }}
                    >
                        LOGOUT
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="meetContainer" style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "5rem 2rem", flexWrap: "wrap", gap: "2rem" }}>

                {/* Left Section: Headline and Input */}
                <div className="leftPanel" style={{ maxWidth: "500px" }}>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: "700", marginBottom: "2rem", lineHeight: "1.3", color: "#ffffff" }}>
                        Providing Quality Video Call Just Like Quality Education
                    </h1>

                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <TextField
                            label="Meeting Code"
                            variant="outlined"
                            value={meetingCode}
                            onChange={(e) => setMeetingCode(e.target.value)}
                            size="small"
                            sx={{
                                input: { color: '#ffffff' },
                                label: { color: '#94a3b8' },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': { borderColor: '#2563eb' },
                                    '&:hover fieldset': { borderColor: '#3b82f6' },
                                    '&.Mui-focused fieldset': { borderColor: '#60a5fa' },
                                },
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleJoinVideoCall}
                            style={{
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                padding: "8px 24px",
                                fontWeight: "bold"
                            }}
                        >
                            JOIN
                        </Button>
                    </div>
                </div>

                <div className="rightPanel">
                    <img
                        src="/phoneImage.png"
                        alt="Video Call Illustration"
                        style={{ width: "320px", height: "auto" }}
                    />
                </div>
            </div>
        </div>
    );
}

export default withAuth(HomeComponent);