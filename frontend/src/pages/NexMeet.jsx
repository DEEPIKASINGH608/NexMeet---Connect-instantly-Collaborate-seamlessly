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


  let { url } = useParams();

  let [videoAvailable, setVideoAvailable] = useState(true);

  let [audioAvailable, setAudioAvailable] = useState(true);

  let [video, setVideo] = useState([]);

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

      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true)
      } else {
        setScreenAvailable(false);
      }


      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });

        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
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
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
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
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video])



  let gotMessageFromServer = (fromId, message) => {

  }


  let addMessage = () => {

  }

  let connectToSocketServer = () => {
    socketIdRef.current = io.connect(server_url, { secure: false })

    socketIdRef.current.on('signal', gitMessageFromServer);

    socketIdRef.current.on("connect", () => {

      socketIdRef.current.emit("join-call", window.location.href)

      socketIdRef.current = socketRef.current.id

      socketRef.current.on("chat-message", addMessage)

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id))
      })

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((soxketListId) => {


          connections[socketListId] = new RTCPeerConnections(peerConfigConnections)

          connections[socketId] = new RTCPeerConnection(peerConfigConnections)

          connections[socketListId].oniceCandidate = (event) =>{
            if (event.candidate !== null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice':event.candidate }))
            }
          }

          connections[socketListId].onaddstream = (event) => {

            let videoExists = VideoRef.current.find(video => video.socketId === socketListId);

            if(videoExists) {
              setVideo(videos => {
                const updateVideos = videos.map(video =>
                  video.sockeId === socketListId ? { ...video, stream: event.stream } : video
                );
                videoRef.current = updateVideos;
                return updateVideos;
              })

            } else {

              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay:true,
                playsinline:true
              }

              setVideos(videos => {
                const updateVideos = [ ...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              })

            }
          }

        })
      })
    })
  }


  let getMedia = () => {
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
          <h2 style={{ color: "white", fontSize: "2rem", margin: 0 }}> Enter into lobby </h2>
          <div style={{ display: "flex", gap: "15px", alignItems: "center", width: "100%" }}>
            <TextField
              id="outlined-basic"
              label="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              sx={{
                width: "250px",
                background: "white",
                borderRadius: "4px",
                input: { color: 'black' },
                '& .MuiInputLabel-root': { color: 'gray' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' },
              }}
            />
            <Button variant="contained" onClick={connect}>
              Connect
            </Button>
          </div>

          <div style={{
            width: "100%",
            marginTop: "10px",
            background: "#000"
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              style={{
                width: "1550px",
                marginTop: "20px",
                height: "auto",
                display: "block"
              }}>
            </video>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );


}


