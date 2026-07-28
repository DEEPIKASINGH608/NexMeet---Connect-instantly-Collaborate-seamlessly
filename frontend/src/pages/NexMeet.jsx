import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button, Input, IconButton, Badge } from '@mui/material';
import io from 'socket.io-client';
import styles from "../styles/videoComponent.module.css";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';



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

  let addMessage = () => { };

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

  let getDisplayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop())
    } catch (e) { console.log(e) }

    window.localStream = stream;
    localVideoRef.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream)
      connections[id].createOffer.then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
          })
          .catch(e => console.log(e))
      })
    }


    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false);

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

      getUserMedia();
    });


  }

  let getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .then((stream) => {

          })
          .catch((e) => console.log(e))
      }
    }
  }

  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia();
    }
  }, [screen])


  let handleScreen = () => {
    setScreen(!screen)
  }


  const handleScreenShare = async () => {
    try {
      // 1. Request the screen media stream
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

      // 2. Update local video preview to show your shared screen
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // 3. Replace video tracks for all connected WebRTC peers
      for (let id in connections) {
        if (id === socketIdRef.current) continue;

        let senders = connections[id].getSenders();
        let videoSender = senders.find(s => s.track && s.track.kind === "video");

        if (videoSender) {
          videoSender.replaceTrack(stream.getVideoTracks()[0]);
        }
      }

      // 4. Handle when the user clicks "Stop sharing" from the browser banner
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      setScreen(true);

    } catch (err) {
      // 💡 Catch permission denials and cancellations cleanly without crashing
      if (err.name === "NotAllowedError") {
        console.log("User cancelled screen sharing or denied permission.");
      } else {
        console.error("Screen share error:", err);
      }
    }
  };


  const stopScreenShare = () => {
    if (window.localStream && localVideoRef.current) {
      // Switch local preview back to webcam
      localVideoRef.current.srcObject = window.localStream;

      // Replace track back to webcam for all connected peers
      for (let id in connections) {
        if (id === socketIdRef.current) continue;

        let senders = connections[id].getSenders();
        let videoSender = senders.find(s => s.track && s.track.kind === "video");

        if (videoSender) {
          videoSender.replaceTrack(window.localStream.getVideoTracks()[0]);
        }
      }
    }
    setScreen(false);
  };


  // Function to safely disconnect media tracks, sockets, and leave the meeting
  const handleEndCall = () => {
    try {
      // 1. Stop all local camera and microphone tracks
      if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
      }

      // 2. Close all active WebRTC peer connections
      for (let id in connections) {
        if (connections[id]) {
          connections[id].close();
        }
      }
      connections = {}; // Reset connections object

      // 3. Disconnect socket connection
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // 4. Redirect user back to home or lobby
      window.location.href = "/home"; // Change "/home" to whatever route you want after leaving
    } catch (err) {
      console.error("Error ending call:", err);
    }
  };


  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      backgroundColor: "#0f1117",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      boxSizing: "border-box",
      fontFamily: "'Segoe UI', Roboto, sans-serif"
    }}>
      {askForUsername === true ? (
        <div style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          backgroundColor: "#1a1d26",
          borderRadius: "16px",
          padding: "30px",
          boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
          gap: "30px",
          maxWidth: "960px",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box"
        }}>

          <div style={{
            flex: "1 1 420px",
            maxWidth: "500px",
            width: "100%",
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: "#000",
            aspectRatio: "16/9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
                display: "block"
              }}
            />
          </div>

          <div style={{
            flex: "1 1 300px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "380px",
            width: "100%"
          }}>
            <div>
              <h2 style={{ color: "#ffffff", fontSize: "1.8rem", margin: "0 0 8px 0" }}>
                Enter into lobby
              </h2>
              <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.95rem" }}>
                Set your name and check your video preview before joining.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <TextField
                id="outlined-basic"
                label="Username"
                variant="outlined"
                value={username}
                onChange={e => setUsername(e.target.value)}
                sx={{
                  width: "100%",
                  background: "#252a37",
                  borderRadius: "8px",
                  input: { color: "#ffffff" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "#3b82f6" },
                    "&.Mui-focused fieldset": { borderColor: "#3b82f6" }
                  },
                  "& .MuiInputLabel-root": { color: "#9ca3af" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" }
                }}
              />

              <Button
                variant="contained"
                onClick={connect}
                size="large"
                style={{
                  backgroundColor: "#2563eb",
                  padding: "12px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  borderRadius: "8px",
                  textTransform: "none"
                }}
              >
                Connect
              </Button>
            </div>
          </div>

        </div>

      ) : (

        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#000000",
          overflow: "hidden",
          boxSizing: "border-box"
        }}>
          <div className={styles?.meetVideoContainer || "meetVideoContainer"} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "16px",
            padding: "20px",
            height: "calc(100vh - 100px)",
            overflowY: "auto",
            boxSizing: "border-box"
          }}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
                borderRadius: "12px",
                backgroundColor: "#1a1d26"
              }}
            />

            {videos.map((video) => (
              <div key={video.socketId} style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
                <video
                  data-socket={video.socketId}
                  ref={ref => {
                    if (ref && video.stream) ref.srcObject = video.stream;
                  }}
                  autoPlay
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>

          <div style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "15px",
            backgroundColor: "rgba(20, 20, 20, 0.85)",
            padding: "10px 25px",
            borderRadius: "30px",
            backdropFilter: "blur(10px)",
            alignItems: "center",
            zIndex: 1000
          }}>
            <IconButton onClick={handleVideo} style={{ color: video ? "#fff" : "#f44336", backgroundColor: "#333", padding: "12px" }}>
              {video ? <VideocamIcon style={{ fontSize: 24 }} /> : <VideocamOffIcon style={{ fontSize: 24 }} />}
            </IconButton>

            <IconButton onClick={handleAudio} style={{ color: audio ? "#fff" : "#f44336", backgroundColor: "#333", padding: "12px" }}>
              {audio ? <MicIcon style={{ fontSize: 24 }} /> : <MicOffIcon style={{ fontSize: 24 }} />}
            </IconButton>

            <IconButton onClick={handleEndCall} style={{ color: "#fff", backgroundColor: "#d32f2f", padding: "12px" }}>
              <CallEndIcon style={{ fontSize: 24 }} />
            </IconButton>

            {screenAvailable && (
              <IconButton onClick={handleScreen} style={{ color: screen ? "#4caf50" : "#fff", backgroundColor: "#333", padding: "12px" }}>
                {screen ? <StopScreenShareIcon style={{ fontSize: 24 }} /> : <ScreenShareIcon style={{ fontSize: 24 }} />}
              </IconButton>
            )}

            <Badge badgeContent={newMessages} color="primary">
              <IconButton onClick={() => setMessages(!messages)} style={{ color: "#fff", backgroundColor: "#333", padding: "12px" }}>
                <ChatIcon style={{ fontSize: 24 }} />
              </IconButton>
            </Badge>
          </div>
        </div>
      )}
    </div>
  );

}



