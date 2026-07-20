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
    try {

      window.localStream.getTracks().forEach(track => track.stop())

    } catch(e) {console.log(e)}


    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if(id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream)

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
        .then(() => {
          socketIdRef.current.emit("signal", id, JSON.stringify({"sdp":connections[id].localDescription}))
        })
        .catch(r => console.log(e))
      })
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false)
      setAudio(false);

      try {
        let tracks = localVideoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())

      } catch(e) {console.log(e)}

      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

      for (let id in connections) {
        connections[id].addStream(window.localStream)
        connections[id].createOffer().then((description) => {
            connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));

            }).catch(e=> console.log(e));
        })
      }
    })
  };


  let silence = () => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }


  let black = ({width = 640, height = 480} = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {width, height});

    canvas.getContext('2d').fillReac(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }

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
    var signal = JSON.parse(message)

    if(fromId !== socketIdRef.current) {
      if(signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() =>{
          if(signal.sdp.type === "offer") {

            connections[fromId].createAnswer().then((description) =>{
              connections[fromId].setLocalDescription(description).then(()=>{
                socketRef.current.emit("signal", fromId, JSON.stringify({"sdp": connections[fromId].localDescription}))
              })
            })
          }
        })
      }
    }
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

          connections[socketListId].oniceCandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }))
            }
          }

          connections[socketListId].onaddstream = (event) => {

            let videoExists = VideoRef.current.find(video => video.socketId === socketListId);

            if (videoExists) {
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
                autoPlay: true,
                playsinline: true
              }

              setVideos(videos => {
                const updateVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              })

            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }

        })

        if (id === socketIdRef.current) return;

        try {
          connections[id2].addStream(window.localStream)
        } catch (e) {

          connections[id2].createOffer().then((description) => {
            connections[id2].setLocalDescription(description)
              .then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }))
              })
              .catch(e => console.log(e))
          })
        }
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
            <video className='meetUserVideo'
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
            {videos.map((video) => {
              <div key={video.socketId}>
                        <h2>{video.socketId}</h2>

                        <video

                        data-socket={video.socketId}
                        ref={ref => {
                          if(ref && video.stream) {
                            ref.srcObject = video.stream;
                          }
                        }}
                        autoPlay
                        >

                        </video>
              </div>
            })}

          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );


}


