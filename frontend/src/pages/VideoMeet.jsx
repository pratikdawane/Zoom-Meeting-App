
import React, { useEffect, useRef, useState } from 'react'
import styles from "./VideoMeet.module.css"
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import server from "../envirenment.js"

import withAuth from '../utils/withAuth';

const server_url =  "http://localhost:3000";
// const server_url =  server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeet() {

    var socketRef = useRef();     // for socket name and other info
    let socketIdRef = useRef();    // for getting socket ID 

    let localVideoref = useRef();   // for self video (our device video )

    let [videoAvailable, setVideoAvailable] = useState(true);   // permission for our device allow to video ( camera on permission)

    let [audioAvailable, setAudioAvailable] = useState(true);    // permission for our device allow to audio ( mic on permission) 

    let [video, setVideo] = useState([]);    // for our video camera on or off ( mute and unmute video )

    let [audio, setAudio] = useState();      // for our audio mic on or off ( mute and unmute mice )

    let [screen, setScreen] = useState();    // for screen shearing to other user

    let [showModal, setModal] = useState(true);   // for popup model ()

    let [screenAvailable, setScreenAvailable] = useState();   // permission for our device allow to screen shearing 

    let [messages, setMessages] = useState([])    // for all messages of our meeting

    let [message, setMessage] = useState("");     // for our message ()

    let [newMessages, setNewMessages] = useState(3);   // for new message popup (alert)

    let [askForUsername, setAskForUsername] = useState(true);    // for when some one Geust Login

    let [username, setUsername] = useState("");   // for getting our username from textField

    const videoRef = useRef([])   // for getting info of all videos 

    let [videos, setVideos] = useState([])   // for getting all videos

    // TODO
    // if(isChrome() === false) {


    // }


    // Auto showing our permissions when we go on meeting page
    useEffect(() => {
        console.log("HELLO")
        getPermissions();

    })


    // This function starts screen sharing when we click on share button.
    let getDisplayMedia = () => {
        if (screen) {              // Checks if screen sharing is allowed or available 
            if (navigator.mediaDevices.getDisplayMedia) {    // chack if the browser supports the screen sharing
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })   // Asks the browser to show the screen sharing selection dialog ( popUp )
                    .then(getDisplayMediaSuccess)    // If you select a screen/window to share, it calls getDislayMediaSuccess to show our screen to others
                    .then((stream) => { })         // This appears to be an empty/unused success handler 
                    .catch((e) => console.log(e));
            }
        }
    }


    //  For Video and Audio Permission of our Device
    const getPermissions = async () => {
        try {
            // For Video Permission
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            // For Audio Permission
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }


            // for Screen Shearing to other device
            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }


            // if video and audio are available then we ready for meeting   ( in lobby [ befor join the meeting ])
            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }

        } catch (error) {
            console.log(error);
        }
    };



    // auto set the video and audio for starting the meeting ( after giving the permission ) in Lobby
    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }

    }, [video, audio])



    // if video and audio available then connect to our socket ( connect to meeting )
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }



    // This function runs when your browser gets successfully access to your camera/microphone.
    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        // Sharing Your Stream with Others
        for (let id in connections) {                 // Go through all the peoples which you're connected with in the call ( show your camera/mic to others)
            if (id === socketIdRef.current) continue    // Skips yourself (no need to send video to yourself)

            connections[id].addStream(window.localStream)  // Send your camera/mic feed to the joining person

            connections[id].createOffer().then((description) => {    // Creates a "connection offer" to start video chatting with them
                console.log(description)                       // 
                connections[id].setLocalDescription(description)  // Saves this offer on your side  ( setLocalDescription() )
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))  // Sends this offer to the other persons through the server 
                    })
                    .catch(e => console.log(e))
            })
        }


        // this Fun. When Our Track is Distrac (not work properly ) Or When You Turn Off Your Camera/Microphone then off your camera and mute your mic for other peaples
        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);     // Updates the UI to show your camera/mic is off
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()     // Gets your current video/audio tracks
                tracks.forEach(track => track.stop())      // Stops all your camera/mic tracks
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])    // Creates a black video with no sound (to keep the connection alive)
            window.localStream = blackSilence()     // Replaces your camera feed with the black screen when we off our camera
            localVideoref.current.srcObject = window.localStream    // Shows the black screen on your video

            for (let id in connections) {      // go throuth the all joining peaple and show them black screen and mute mic
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {      // create the offer and show them mute video and mic
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }


    // when video and audio are avialable in meeting then show on our meeting ( after start in meeting video call )
    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()    // But when we click on mute button then stop video and audio 
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }


    // This function runs when you successfully start sharing your screen. ( when we click on screen share button )
    let getDisplayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())   // Stop if any existing camera/mic  ( Stops your current camera/mic feed (if any) )
        } catch (e) { console.log(e) }

        window.localStream = stream    // Save the new screen share stream
        localVideoref.current.srcObject = stream   // Show your screen on your video element


        // Sends your screen to all other participants
        for (let id in connections) {  
            if (id === socketIdRef.current) continue    // Skip yourself to sharing screan

            connections[id].addStream(window.localStream)   // Send your screen to other person

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))   // Send the technical connection data ( Updates the technical WebRTC connection for each ) 
                    })
                    .catch(e => console.log(e))
            })
        }


        // this Fun. When You Stop Sharing your screen
        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)       // Update UI to show sharing stopped
 
            try {
                let tracks = localVideoref.current.srcObject.getTracks()   // get the sharing tracks
                tracks.forEach(track => track.stop())                      // Stop all screen sharing tracks
            } catch (e) { console.log(e) }


            let blackSilence = (...args) => new MediaStream([black(...args), silence()])     // Create black video/silent audio 
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()   // utomatically switches back to your normal camera/mic 

        })
    }


    // This function processes incoming WebRTC signaling messages (SDP offers) from other peers via the signaling server.
    let gotMessageFromServer = (fromId, message) => {   
        var signal = JSON.parse(message)        // Converts the string into a usable JavaScript object (signal).

        if (fromId !== socketIdRef.current) {    //  Ignore Messages from Self ( for not return self msg only return others msg )
            if (signal.sdp) {                  // Check if the Signal Contains SDP ( Session Description Protocol ) 
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {    // Takes the received SDP (signal.sdp) and sets it as the remote description for the peer connection (connections[fromId]).    
                    
                    if (signal.sdp.type === 'offer') {       // Check if SDP is an Offer and Then Create Answer) [ createAnswer() generates an SDP answer based on our local media setup.]
                        connections[fromId].createAnswer().then((description) => {    
                            connections[fromId].setLocalDescription(description).then(() => {      // Set Local Description (Our Answer) [ Stores our answer in the local RTCPeerConnection object. ]
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))     // answer must be sent back to the peer that sent the offer. [Uses the signaling server (socketRef.current.emit) to relay the answer.]
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {     // Check if the Signal Contains ICE Candidates (for Network Connectivity)
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))    // Add ICE Candidate to Peer Connection ( RTCPeerConnection )
            }
        }
    }



    // WebRTC socket.io connect from backend socket.io
    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)            // for user join the meeting 
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)       // for chat message

            socketRef.current.on('user-left', (id) => {                   // for exit the user from meeting
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })


            socketRef.current.on('user-joined', (id, clients) => {       // for when any user join our meeting
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);   // applying WebRTC peerToPeer Connection ( for directly user to user ( bidirectional) connections )
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their new video stream meeting ( when we join others meeting ) On Add Stream 
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);   // current video referance
                        console.log("FINDING ID: ", socketListId);  // user socket ID 

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);   // Check new video is exist in meeting and check this video Socket ID == this user socket ID

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video ( update our stream with new and existing video stream )
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video    // ternary oprator : if new video and the new video user is match then give to show new updated video stream , Otherwise show old video stream (video)
                                );
                                videoRef.current = updatedVideos;    // set the current video with updated new video stream
                                return updatedVideos;     // return new updated video stream
                            });

                        } else {
                            // Create a new video frame (after when someone new join in our meeting )
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {    // and set it new video frame  on our meeting 
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream) 
                    } else {
                        // and when we mute the video stream then show black screen
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]) 
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }

                })


                // when a new user joins the meeting (triggered by the 'user-joined' socket event). It's responsible for initiating the WebRTC offer/answer negotiation process between peers.    
                if (id === socketIdRef.current) {   // This checks if the joining user's ID (id) matches our own socket ID (socketIdRef.current) , This means we're the ones who just joined the meeting (not another participant)
                    for (let id2 in connections) {

                        if (id2 === socketIdRef.current) continue   // Skip our own connection (no need to connect to ourselves).

                        try {
                            connections[id2].addStream(window.localStream)  // Our local camera/microphone (or screen-sharing) stream. and [ addStream()] attaches our media stream to the peer connection.
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {    // Generates an SDP (Session Description Protocol) offer describing our media capabilities (video/audio codecs, network info(IP and port address ), etc.).
                            connections[id2].setLocalDescription(description)     // Stores the offer locally in the RTCPeerConnection object.
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))    // Sends the SDP ( session description ) offer to peer id2 via WebSocket (socketRef.current).
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })

        })
    }



    // this functions when we mute our mic   (no sound create) ) ( search on ChatGPT for more info )
    let silence = () => {
        let ctx = new AudioContext()   // Create an invisible audio workspace (AudioContext) ( search on google )
        let oscillator = ctx.createOscillator()   // Make a sound generator that produces no sound (Oscillator)
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()   // // Starts silent sound generation
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })   // Returns a completely silent, disabled audio track
    }

    // this functions when we mute our video     (no video show ) ( search on ChatGPT for more info )
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })   // Creates an invisible drawing board (canvas)
        canvas.getContext('2d').fillRect(0, 0, width, height)     // Paints it completely black
        let stream = canvas.captureStream()                     // show the black drawing into a video stream
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })    // Returns a  black video track
    }


    // handle the video icon modal ( true or false) video mute and unmute
    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }

    // handle the audio icon modal ( true or false) audio mute and unmute
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    // handle the screen sharing icon modal ( true or false) screen sharing on and off
    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])


    let handleScreen = () => {
        setScreen(!screen);
    }


    // when we click on End Call button then stop and end the call
    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/home"
    }


    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }

    let closeChat = () => {
        setModal(false);
    }

    let handleMessage = (e) => {
        setMessage(e.target.value);
    }


    // For Add new messages
    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };


    // Set the messages in our chat ( both self and others )
    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    
    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }


    return (

        <div className={styles.mainContainer}>
            {askForUsername === true ? (
            <div className={styles.entryContainer}>
                <div className={styles.entryForm}>
                    <h1 className={styles.entryTitle}>Enter into Lobby</h1>
                    <TextField 
                        id="outlined-basic" 
                        label="Enter Your Username" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        variant="outlined" 
                        className={styles.usernameInput} 
                        required
                    /> 
                    <Button 
                        className={styles.connectButton} 
                        variant='contained' 
                        onClick={connect}
                    >
                        Connect
                    </Button>
                </div>

                <div className={styles.previewVideo}>
                    <video 
                        ref={localVideoref} 
                        autoPlay 
                        muted
                    ></video>
                </div>
            </div>
            ) : (
            <div className={styles.meetContainer}>
                {showModal && (
                <div className={styles.chatRoom}>
                    <div className={styles.chatContainer}>
                        <h1 className={styles.chatHeader}>Chat</h1> 
                        <div className={styles.chattingDisplay}>
                            {messages.length !== 0 ? messages.map((item, index) => (
                            <div className={styles.message} key={index}>
                                <p className={styles.sender}>{item.sender}</p>
                                <p className={styles.messageText}>{item.data}</p>
                            </div>
                            )) : <p>No Messages Yet</p>}
                        </div>
                        <div className={styles.chattingArea}>
                            <input 
                            type="text" 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)} 
                            placeholder='Type your message' 
                            className={styles.messageInput}
                            />
                            <Button 
                            className={styles.sendButton} 
                            variant='contained' 
                            onClick={sendMessage}
                            >
                            Send
                            </Button>
                        </div>
                    </div>
                </div>
                )}

                <div className={styles.controls}>
                    <IconButton onClick={handleVideo} className={styles.controlButton}>
                        {video ? <VideocamIcon /> : <VideocamOffIcon />}
                    </IconButton>
                    <IconButton onClick={handleEndCall} className={`${styles.controlButton} ${styles.endCall}`}>
                        <CallEndIcon />
                    </IconButton>
                    <IconButton onClick={handleAudio} className={styles.controlButton}>
                        {audio ? <MicIcon /> : <MicOffIcon />}
                    </IconButton>

                    {screenAvailable && (
                        <IconButton onClick={handleScreen} className={styles.controlButton}>
                        {screen ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                        </IconButton>
                    )}

                
                    <IconButton 
                    onClick={() => setModal(!showModal)} 
                    className={styles.controlButton}
                    >
                    <ChatIcon />
                    </IconButton>
                    
                </div>

                <div className={styles.videoContainer}>
                    <video 
                        className={styles.localVideo} 
                        ref={localVideoref} 
                        autoPlay 
                        muted
                    ></video>

                    <div className={styles.remoteVideos}>
                        {videos.map((video) => (
                        <div key={video.socketId} className={styles.remoteVideoWrapper}>
                            <h3 className={styles.participantName}>{video.username || video.socketId}</h3>
                            <video
                            className={styles.remoteVideo}
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
            )}
        </div>

    )
}





