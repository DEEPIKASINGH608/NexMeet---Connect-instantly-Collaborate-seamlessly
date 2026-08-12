import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, IconButton, Badge } from '@mui/material';
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
import server from '../environment';


const server_url = server;

var connections = {};

const peerConfigConnections = {
  "iceServers": [
    {
      "urls": "stun:stun.l.google.com:19302"
    }
  ]
};

export default function NexMeetComponent() {
  const navigate = useNavigate();
  const { url } = useParams();
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const videoRef = useRef([]);

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [showModal, setModal] = useState(false);

  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 1.7777777778 }
        },
        audio: true
      });
      if (userMediaStream) {
        window.localStream = userMediaStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userMediaStream;
        }
        setVideoAvailable(true);
        setAudioAvailable(true);
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
    } catch (err) {
      console.log("Permissions rejected or unavailable:", err);
      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (!askForUsername && localVideoRef.current && window.localStream) {
      localVideoRef.current.srcObject = window.localStream;
    }
  }, [askForUsername]);

  const toggleChatModal = () => {
    setModal((prev) => {
      if (!prev) setNewMessages(0);
      return !prev;
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
       connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            return connections[fromId].createAnswer();
          }
        })
        .then((answer) => {
          if (answer) {
            return connections[fromId].setLocalDescription(answer);
          }
        })
        .then(() => {
          if (connections[fromId].localDescription && socketRef.current) {
            socketRef.current.emit(
              "signal",
              fromId,
              JSON.stringify({ "sdp": connections[fromId].localDescription })
            );
          }
        })
        .catch((e) => console.error("SDP processing error:", e));
    }

    if (signal.ice) {
      connections[fromId]
        .addIceCandidate(new RTCIceCandidate(signal.ice))
        .catch((e) => console.error("ICE Candidate error:", e));
    }
  }
};


  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data }
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevCount) => prevCount + 1);
    }
  };

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
          }
        });

        if (id === socketIdRef.current) return;

        try {
          if (connections[id]) {
            if (connections[id].signalingState === "stable") {
              connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                  .then(() => {
                    if (socketRef.current) {
                      socketRef.current.emit(
                        "signal",
                        id,
                        JSON.stringify({ "sdp": connections[id].localDescription })
                      );
                    }
                  })
                  .catch((e) => console.error("Error setting local description:", e));
              }).catch((e) => console.error("Error creating offer:", e));
            }
          }
        } catch (e) {
          console.error("Signal offer creation failed:", e);
        }
      });
    });
  };

  let connect = () => {
    if (!username.trim()) {
      alert("Please enter a username to continue.");
      return;
    }
    setAskForUsername(false);
    setVideo(videoAvailable);
    setAudio(audioAvailable);

    connectToSocketServer();
  };



  let routeTo = useNavigate();

  let handleVideo = () => {
    if (window.localStream) {
      const videoTrack = window.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideo(videoTrack.enabled);
      }
    }
  };

  let handleAudio = () => {
    if (window.localStream) {
      const audioTrack = window.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudio(audioTrack.enabled);
      }
    }
  };

  const handleScreenShare = async () => {
    if (!screen) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        for (let id in connections) {
          if (id === socketIdRef.current) continue;
          let senders = connections[id].getSenders();
          let videoSender = senders.find(s => s.track && s.track.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(stream.getVideoTracks()[0]);
          }
        }

        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };

        setScreen(true);
      } catch (err) {
        console.log("Screen share cancelled or failed:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (window.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = window.localStream;

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

  const handleEndCall = () => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop());
      }

      for (let id in connections) {
        if (connections[id]) {
          connections[id].close();
        }
      }
      connections = {};

      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      navigate('/home');
    } catch (err) {
      console.error("Error ending call:", err);
    }
  };

  const sendMessage = () => {
    if (message.trim() !== "" && socketRef.current) {
      socketRef.current.emit("chat-message", message, username);
      setMessage("");

    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      backgroundColor: "#030826",
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
                display: "block",
                transform: "scaleX(-1)"
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
          backgroundColor: "#030826",
          overflow: "hidden",
          boxSizing: "border-box"
        }}>
          <div className={styles.mainLayout}>
            <div className={styles.meetVideoContainer}>
              {videos.map((vid) => (
                <div key={vid.socketId} className={styles.remoteVideoCard}>
                  <video
                    data-socket={vid.socketId}
                    ref={ref => {
                      if (ref && vid.stream) ref.srcObject = vid.stream;
                    }}
                    autoPlay
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>

            <video
              className={styles.meetUserVideo}
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ transform: "scaleX(-1)" }}
            />

            {showModal && (
              <div className={styles.chatRoom}>
                <div className={styles.chatContainer}>
                  <h1 style={{ color: "#000", margin: "0 0 24px 0", fontSize: "2rem", fontWeight: "bold" }}>
                    Chat
                  </h1>

                  <div className={styles.chattingDisplay}>
                    {messages.length > 0 ? messages.map((item, index) => (
                      <div style={{ marginBottom: "12px" }} key={index}>
                        <p style={{ fontWeight: "bold", margin: "0 0 4px 0", color: "#2563eb" }}>{item.sender}</p>
                        <p style={{ margin: 0, color: "#333" }}>{item.data}</p>
                      </div>
                    )) : <p style={{ color: "#888" }}>No Messages Yet</p>}
                  </div>


                  <div className={styles.chatt}>
                    <TextField
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      id="outlined-basic"
                      label="Outlined"
                      variant="outlined"
                      fullWidth
                    />
                    <Button
                      variant='contained'
                      onClick={sendMessage}
                      style={{ marginTop: "12px" }}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
              <IconButton onClick={handleScreenShare} style={{ color: screen ? "#4caf50" : "#fff", backgroundColor: "#333", padding: "12px" }}>
                {screen ? <StopScreenShareIcon style={{ fontSize: 24 }} /> : <ScreenShareIcon style={{ fontSize: 24 }} />}
              </IconButton>
            )}

            <Badge badgeContent={newMessages} color="primary">
              <IconButton onClick={toggleChatModal} style={{ color: "#fff", backgroundColor: "#333", padding: "12px" }}>
                <ChatIcon style={{ fontSize: 24 }} />
              </IconButton>
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

