import React, { useState, useRef, useEffect } from 'react';
import * as signalR from "@microsoft/signalr";
import {useUnit} from "effector-react";
import {$backBaseUrl} from "../../Store/config.js";



export const CallComponent = ({ user, targetUserId }) => {
    const [connection, setConnection] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const localAudioRef = useRef();
    const remoteAudioRef = useRef();
    const peerConnection = useRef(null);
    const baseUrl = useUnit($backBaseUrl)

    useEffect(() => {
        const newConnection = new  signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/callHub`) // Убедитесь, что URL совпадает
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);

        newConnection.start()
            .then(() => {
                console.log('Connected!');

                newConnection.on("ReceiveSignal", async (signal) => {
                    const message = JSON.parse(signal);

                    if (message.type === 'offer') {
                        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(message));
                        const answer = await peerConnection.current.createAnswer();
                        await peerConnection.current.setLocalDescription(answer);
                        await newConnection.invoke("SendSignal", targetUserId.toString(), JSON.stringify(peerConnection.current.localDescription));
                    } else if (message.type === 'answer') {
                        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(message));
                    } else if (message.type === 'candidate') {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(message.candidate));
                    }
                });

                newConnection.on("ReceiveCall", async (callerId) => {
                    // Start the call with the caller
                    await initiateCall(callerId);
                });
            })
            .catch(e => console.log('Connection failed: ', e));

        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, [targetUserId]);

    const initiateCall = async (targetUserId) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream);
            localAudioRef.current.srcObject = stream;

            peerConnection.current = new RTCPeerConnection();
            stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

            peerConnection.current.ontrack = event => {
                setRemoteStream(event.streams[0]);
                remoteAudioRef.current.srcObject = event.streams[0];
            };

            peerConnection.current.onicecandidate = event => {
                if (event.candidate) {
                    sendSignal(targetUserId, { type: 'candidate', candidate: event.candidate });
                }
            };

            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            sendSignal(targetUserId, peerConnection.current.localDescription);
        } catch (error) {
            console.error('Error accessing media devices.', error);
            alert('Could not access audio devices. Please ensure that your microphone is connected and permissions are granted.');
        }
    };

    const sendSignal = async (targetUserId, signal) => {
        try {
            console.log(connection)
            await connection.invoke("SendSignal", targetUserId.toString(), JSON.stringify(signal));
        } catch (error) {
            console.error('Failed to send signal:', error);
        }
    };


    const handleCallUser = async () => {
        await initiateCall(targetUserId);
        await connection.invoke("CallUser", targetUserId.toString(), user.id.toString());
    };
    
    
    return (
        <div>
            <audio ref={localAudioRef} autoPlay playsInline muted></audio>
            <audio ref={remoteAudioRef} autoPlay playsInline></audio>
            <button onClick={handleCallUser}>Call User</button>
        </div>
    );
};

