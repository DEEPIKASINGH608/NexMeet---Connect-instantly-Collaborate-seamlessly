import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button } from '@mui/material';

import "../styles/videoComponent.css";

const server_url = "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
  "iceServers": [
    {
      "urls": "stun:stun.l.google.com:19302"
    }
  ]
};

export default function NexMeetComponent() {
  var socketRf = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();


  let {url } = useParams();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState(true);
  let [showModal, setModadl] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState(true);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMesssages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);

  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true)
      } else {
        setScreenAvailable(false);
      }


      if(videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});

        if(userMediaStream) {
          window.localStream = userMediaStream;
          if(localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }

    } catch (err) {
      console.log("Permissions rejected or unavailable:", err);
    }

  };

  useEffect(() => {
    getPermissions();
  }, []);



  let getUserMediaSuccess = (stream) => {

  };

  let getUserMedia = () => {
    if ((video && videoAvailble) || (audio && audioAvailble)) {
      navigator.mediaDevices.getUserMedia({video: video, audio: audio})
          .then(getUserMediaSuccess)
          .then((stream) => { })
          .catch((e) => console.log(e))
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) {
        console.log("No tracks to stop:", e);
       }
    }
  }

  useEffect(() => {
    if(video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio,video])

  let getMedia= () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);

    //connectToSocketServer();
  }

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  }

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2> Enter into lobby </h2>
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <Button variant="contained" onClick={connect}>Connect</Button>

          <div>
            <video ref={localVideoRef} autoPlay muted style={{ width: "300px", marginTop: "20px" }}></video>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );


}


