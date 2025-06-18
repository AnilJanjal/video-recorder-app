import { useState, useRef, useEffect } from 'react';
import './AudioRecorder.css';

const AudioRecorder = ({ addRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);
        addRecording({
          type: 'audio',
          url: audioUrl,
          duration: recordingTime,
          timestamp: new Date().toISOString()
        });
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      startTimer();
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      stopTimer();
    }
  };

  const downloadAudio = () => {
    if (!recordedAudio) return;
    const a = document.createElement('a');
    a.href = recordedAudio;
    a.download = `audio-recording-${new Date().toISOString()}.webm`;
    a.click();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-recorder">
      <h2>Audio Recorder</h2>
      
      {!isRecording && !recordedAudio && (
        <button className="btn record-btn" onClick={startRecording}>
          Start Recording
        </button>
      )}
      
      {isRecording && (
        <div className="recording-controls">
          <div className="timer">Recording: {formatTime(recordingTime)}</div>
          <button className="btn stop-btn" onClick={stopRecording}>
            Stop Recording
          </button>
        </div>
      )}
      
      {recordedAudio && (
        <div className="playback-controls">
          <audio src={recordedAudio} controls />
          <button className="btn download-btn" onClick={downloadAudio}>
            Download
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;