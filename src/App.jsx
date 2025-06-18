import { useState } from 'react';
import AudioRecorder from './components/AudioRecorder/AudioRecorder';
import VideoRecorder from './components/VideoRecorder/VideoRecorder';
import ToggleSwitch from './components/ToggleSwitch/ToggleSwitch';
import RecordingList from './components/RecordingList/RecordingList';
import './App.css';

function App() {
  const [isAudio, setIsAudio] = useState(true);
  const [recordings, setRecordings] = useState([]);

  const addRecording = (recording) => {
    setRecordings(prev => [...prev, recording]);
  };

  return (
    <div className="app">
      <h1>Media Recorder</h1>
      <div className="mode-toggle">
        <span className={isAudio ? 'active' : ''}>Audio</span>
        <ToggleSwitch 
          isOn={!isAudio}
          handleToggle={() => setIsAudio(!isAudio)}
        />
        <span className={!isAudio ? 'active' : ''}>Video</span>
      </div>
      
      <div className="recorder-container">
        {isAudio ? (
          <AudioRecorder addRecording={addRecording} />
        ) : (
          <VideoRecorder addRecording={addRecording} />
        )}
      </div>
      
      {recordings.length > 0 && (
        <RecordingList recordings={recordings} />
      )}
    </div>
  );
}

export default App;