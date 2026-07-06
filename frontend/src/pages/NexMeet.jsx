import React, {useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import "../styles/videoComponent.css"

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
    var socketRf = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvalable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState();

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState(true);

    let [showModal, setModadl] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages,  setMessages] = useState(true);

    let [message, setMessage] = useState("");

    let [newMessages, setNewMesssages] = useState(0);

    let [ askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState([])

    let [videos, setVideos]= useState([])

    // if(isChrome() === false) {

    // }

    const getPermissions = async () => {
      try {
        const videoPermission = await navigator.mediaDevices.getUserMedia({video: true})
      } catch {

      }

    }

    useEffect(() => {
      getPermissions();
    }, [])

  return (
    <div>

      {askForUsername === true ?
      <div>
        <h2> Enter into lobby </h2>
        <TextField id="outlined-basic" labek="username" value={username}></TextField>
        <Button variant="contained">Connect</Button>

<div>
  <video ref={localVideoRef} autoplay muted></video>
</div>
      </div> : <></>
      }
    </div>
  )
}

