import './RecordingList.css';

const RecordingList = ({ recordings }) => {
  const handleDownload = (url, type) => {
    const extension = type === 'audio' ? 'webm' : 'webm';
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().toISOString()}.${extension}`;
    a.click();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recording-list">
      <h3>Previous Recordings</h3>
      
      {recordings.length === 0 ? (
        <p>No recordings yet</p>
      ) : (
        <ul>
          {recordings.map((recording, index) => (
            <li key={index} className="recording-item">
              <div className="recording-header">
                <span className="recording-type">
                  {recording.type === 'audio' ? '🎤 Audio' : '🎥 Video'}
                </span>
                <span className="recording-duration">
                  {formatTime(recording.duration)}
                </span>
              </div>
              
              <div className="recording-player">
                {recording.type === 'audio' ? (
                  <audio src={recording.url} controls />
                ) : (
                  <video src={recording.url} controls />
                )}
              </div>
              
              <button 
                className="download-btn"
                onClick={() => handleDownload(recording.url, recording.type)}
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecordingList;