import React, { useEffect, useRef, useState } from 'react';

export const CallComponent = ({ user, targetUserId, connection }) => {
    const [callActive, setCallActive] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);

    const servers = {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            }
        ]
    };

    useEffect(() => {
        if (connection) {
            connection.on('ReceiveSignal', handleSignal);
        }

        return () => {
            if (connection) {   
                connection.off('ReceiveSignal', handleSignal);
            }
        };
    }, [connection]);

    const handleSignal = async (signal) => {
        const data = JSON.parse(signal);
        if (data.type === 'offer') {
            await handleOffer(data.offer);
        } else if (data.type === 'answer') {
            await handleAnswer(data.answer);
        } else if (data.type === 'candidate') {
            await handleCandidate(data.candidate);
        }
    };

    const startCall = async () => {
        setCallActive(true);
        await startPeerConnection();
    };

    const answerCall = async () => {
        setCallActive(true);
        await startPeerConnection();
    };

    const startPeerConnection = async () => {
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localVideoRef.current.srcObject = localStream;

        const peerConnection = new RTCPeerConnection(servers);
        peerConnectionRef.current = peerConnection;

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                sendSignal({
                    type: 'candidate',
                    candidate: event.candidate
                });
            }
        };

        peerConnection.ontrack = event => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        if (user.id < targetUserId) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            await sendSignal({
                type: 'offer',
                offer: peerConnection.localDescription
            });
        }
    };

    const handleOffer = async (offer) => {
        const peerConnection = peerConnectionRef.current;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await sendSignal({
            type: 'answer',
            answer: peerConnection.localDescription
        });
    };

    const handleAnswer = async (answer) => {
        const peerConnection = peerConnectionRef.current;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleCandidate = async (candidate) => {
        const peerConnection = peerConnectionRef.current;
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const sendSignal = async (data) => {
        await connection.invoke('SendSignal', targetUserId.toString(), JSON.stringify(data));
    };

    return (
        <div>
            {callActive ? (
                <div>
                    <video ref={localVideoRef} autoPlay muted style={{ width: '300px', height: '200px' }} />
                    <video ref={remoteVideoRef} autoPlay style={{ width: '300px', height: '200px' }} />
                </div>
            ) : (
                <div>
                    <button onClick={startCall}>Начать звонок</button>
                    <button onClick={answerCall}>Ответить на звонок</button>
                </div>
            )}
        </div>
    );
};
