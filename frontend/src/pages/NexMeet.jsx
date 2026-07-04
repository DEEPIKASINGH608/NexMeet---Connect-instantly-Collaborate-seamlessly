import React from 'react'
import { useParams } from 'react-router-dom'

const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
  "iceServers": [
    {
      "urls": "stun:stun.l.google.com:19302"
    }
  ]
}

export default function NexMeetComponent () {
  const { roomId } = useParams();

  return (
    <div style={{ color: '#ffffff', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>NexMeet Video Room</h2>
      <p><strong>Current URL:</strong> {window.location.href}</p>
      {roomId && <p><strong>Room ID Detected:</strong> {roomId}</p>}
    </div>
  )
}

