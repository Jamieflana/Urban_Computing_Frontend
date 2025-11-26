export default function GPSLogger({
  status,
  isCollecting,
  startLogging,
  stopLogging,
}) {
  return (
    <div className="gps-logger-row">
      <span className="gps-logger-label">Click to Find your closest available bike</span>
      
      <button
        className={`circle-btn-small ${isCollecting ? "stop" : "start"}`}
        onClick={isCollecting ? stopLogging : startLogging}
      >
        {isCollecting ? "■" : "▶"}
      </button>
    </div>
  );
}
