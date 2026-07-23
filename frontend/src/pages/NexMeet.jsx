import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button, Input, IconButton } from '@mui/material';
import io from 'socket.io-client';
import VideoCamIcon from '@mui/icons-material/VideoCam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic'
import MicIconOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShareIcon'

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
  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  let videoRef = useRef([]);

  let { url } = useParams();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState(true);
  let [showModal, setModal] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(3);
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
        setScreenAvailable(true);
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

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    let ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
      }
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      if (window.localStream) {
        window.localStream.getTracks().forEach(track => {
          connections[id].addTrack(track, window.localStream);
        });
      }

      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            if (socketRef.current) {
              socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
            }
          })
          .catch(e => console.log(e));
      });
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);

      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) {
        console.log(e);
      }

      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = window.localStream;
      }

      for (let id in connections) {
        if (window.localStream) {
          window.localStream.getTracks().forEach(track => {
            connections[id].addTrack(track, window.localStream);
          });
        }
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              if (socketRef.current) {
                socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
              }
            }).catch(e => console.log(e));
        });
      }
    });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) {
        console.log("No tracks to stop:", e);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                if (socketRef.current) {
                  socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));
                }
              });
            });
          }
        }).catch(e => console.log(e));
      }

      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
      }
    }
  };

  let addMessage = () => {};

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null && socketRef.current) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
          };

          connections[socketListId].ontrack = (event) => {
            let videoExists = videoRef.current.find(video => video.socketId === socketListId);

            if (videoExists) {
              setVideos(videos => {
                const updatedVideos = videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: event.streams[0] } : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.streams[0],
                autoPlay: true,
                playsinline: true
              };

              setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream !== undefined && window.localStream !== null) {
            window.localStream.getTracks().forEach(track => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            window.localStream.getTracks().forEach(track => {
              connections[socketListId].addTrack(track, window.localStream);
            });
          }
        });

        if (id === socketIdRef.current) return;

        try {
          if (connections[id]) {
            connections[id].createOffer().then((description) => {
              connections[id].setLocalDescription(description)
                .then(() => {
                  if (socketRef.current) {
                    socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                  }
                })
                .catch(e => console.log(e));
            });
          }
        } catch (e) {
          console.log(e);
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };


  let handleVideo = () => {
    setVideo(!video);
  }

  let handleAudio = () => {
    setAudio(!audio)
  }


  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2 style={{ color: "white", fontSize: "2rem", margin: 0 }}> Enter into lobby </h2>
          <div style={{ display: "flex", gap: "15px", alignItems: "center", width: "100%", marginTop: "15px" }}>
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
            <div className={styles.meetVideoContainer}>

              <div className={styles.buttonContainers}>

                <IconButton onClick={handleVideo} style={{color: "white" }}>
                  {(video === true) ? <VideocamIcon /> : <VideocamOffIcon /> }
                </IconButton>

                <IconButton style={{color: "white"}}>
                  <CallEndIcon />
                </IconButton>

                <IconButton onClick={handleAudio} style={{color: "white"}}>
                  {audio === true ? <MicIcon /> : <MicOffIcon/>}
                </IconButton>


                {screenAvailable === true ?
                <IconButton>
                  {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon /> }
                </IconButton> : <></>
                }

                <Badge badgeContent={newMessages} max={999} color='orange'>
                  <IconButton style={{ color: "white" }}>
                <ChatIcon/>
                </IconButton>
                </Badge>

              </div>

              <video
                className={styles.meetUserVideo}
                ref={localVideoRef}
                autoPlay
                muted
                style={{
                  width: "100%",
                  maxWidth: "1200px",
                  marginTop: "20px",
                  height: "auto",
                  display: "block"
                }}
              />

              {videos.map((video) => (
                <div className={styles.conferenceView} key={video.socketId}>
                  <h2>{video.socketId}</h2>
                  <video
                  class
                    data-socket={video.socketId}
                    ref={ref => {
                      if (ref && video.stream) {
                        ref.srcObject = video.stream;
                      }
                    }}
                    autoPlay
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ color: "white", padding: "20px" }}>
          <h2>Connected to Call as: {username}</h2>
          </div>
      )}
    </div>
  );
}



