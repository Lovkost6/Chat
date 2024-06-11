import React, { useState, useRef } from 'react';

export const AudioRecorder = ({ onSave }) => {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const audioChunks = useRef([]);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = event => {
            audioChunks.current.push(event.data);
        };
        recorder.onstop = () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
            onSave(audioBlob);
            audioChunks.current = [];
        };
        recorder.start();
        setMediaRecorder(recorder);
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorder.stop();
        setRecording(false);
    };

    return (
        <div>
            {recording ? (
                <button onClick={stopRecording}>Stop Recording</button>
            ) : (
                <button onClick={startRecording}>Start Recording</button>
            )}
        </div>
    );
};

