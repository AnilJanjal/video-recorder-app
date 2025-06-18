import { useState, useRef } from 'react';
import ToggleSwitch from '../ToggleSwitch/ToggleSwitch';
import './VideoRecorder.css';


const VideoRecorder = ({ addRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);
  const previewRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
  };

  const startRecording = async () => {
    try {
      const constraints = {
        video: !isAudioOnly,
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.muted = true;
        previewRef.current.playsInline = true;

        previewRef.current.onloadedmetadata = () => {
          previewRef.current.play();
        };
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      videoChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        setRecordedVideo(videoUrl);

        addRecording?.({
          type: 'video',
          url: videoUrl,
          duration: recordingTime,
          timestamp: new Date().toISOString(),
        });

        stream.getTracks().forEach((track) => track.stop());
        if (previewRef.current) {
          previewRef.current.srcObject = null;
        }
        streamRef.current = null;
      };

      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      startTimer();
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopTimer();
    }
  };

  const downloadVideo = () => {
    if (!recordedVideo) return;
    const a = document.createElement('a');
    a.href = recordedVideo;
    a.download = `video-recording-${new Date().toISOString()}.webm`;
    a.click();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => {
    setIsAudioOnly((prev) => !prev);
  };

  return (
    <div className="video-recorder">
      <h2>Video Recorder</h2>

      <ToggleSwitch isOn={isAudioOnly} handleToggle={handleToggle} />

      {!isRecording && !recordedVideo && (
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

      <div className="video-container">
        {isRecording ? (
          <video
            ref={previewRef}
            autoPlay
            muted
            playsInline
            className="live-preview"
          />
        ) : recordedVideo ? (
          <video src={recordedVideo} controls className="recorded-video" />
        ) : (
          <div className="placeholder">Press "Start Recording" to begin</div>
        )}
      </div>

      {recordedVideo && (
        <button className="btn download-btn" onClick={downloadVideo}>
          Download Video
        </button>
      )}
    </div>
  );
};

export default VideoRecorder;
