

// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import './Dashboard.css';

// const API_BASE_URL = 'http://localhost:5000'; // Updated to match Flask server

// const Dashboard = () => {
//     const [isFeedError, setIsFeedError] = useState(false);
//     const [authorisedHistory, setAuthorisedHistory] = useState([]);
//     const [unauthorisedHistory, setUnauthorisedHistory] = useState([]);
//     const [registrationName, setRegistrationName] = useState('');
//     const [registrationStatus, setRegistrationStatus] = useState('');
//     const videoFeedUrl = `${API_BASE_URL}/video_feed`;

//     // Use a ref to prevent caching issues with the video feed
//     const videoRef = useRef(null);

//     useEffect(() => {
//         // Function to fetch history
//         const fetchHistory = () => {
//             axios.get(`${API_BASE_URL}/history`)
//                 .then(response => {
//                     const history = response.data;
//                     setAuthorisedHistory(history.filter(item => item.type === 'Authorised'));
//                     setUnauthorisedHistory(history.filter(item => item.type === 'Unauthorised'));
//                     setIsFeedError(false);
//                 })
//                 .catch(error => {
//                     console.error("History API error:", error);
//                     setIsFeedError(true);
//                 });
//         };

//         fetchHistory(); // Initial fetch
//         const interval = setInterval(fetchHistory, 2000); // Fetch every 2 seconds

//         return () => clearInterval(interval);
//     }, []);

//     const handleRegistration = (e) => {
//         e.preventDefault();
//         if (!registrationName) {
//             setRegistrationStatus('Please enter a name.');
//             return;
//         }
//         setRegistrationStatus('Registering...');
//         axios.post(`${API_BASE_URL}/register`, { name: registrationName })
//             .then(response => {
//                 setRegistrationStatus(response.data.message);
//                 setRegistrationName(''); // Clear input on success
//             })
//             .catch(error => {
//                 setRegistrationStatus(error.response?.data?.error || 'Registration failed.');
//             });
//     };

//     return (
//         <div className="dashboard-container">
//             <div className="dashboard-header">
//                 <h1>AI Surveillance Dashboard</h1>
//             </div>
//             <div className="main-content">
//                 <div className="video-section">
//                     <div className="video-feed-container">
//                         {isFeedError ? (
//                             <div className="error-overlay">
//                                 <p>📷 Video Feed Unavailable</p>
//                                 <span>Could not connect to the stream. Is the Python server running?</span>
//                             </div>
//                         ) : (
//                             <img
//                                 ref={videoRef}
//                                 src={videoFeedUrl}
//                                 alt="Live Video Feed"
//                                 onError={() => setIsFeedError(true)}
//                             />
//                         )}
//                     </div>
//                 </div>

//                 <div className="side-panel">
//                     {/* Face Registration Panel */}
//                     <div className="registration-panel card">
//                         <h2><i className="fas fa-user-plus"></i> Register New Face</h2>
//                         <form onSubmit={handleRegistration}>
//                             <input
//                                 type="text"
//                                 value={registrationName}
//                                 onChange={(e) => setRegistrationName(e.target.value)}
//                                 placeholder="Enter name..."
//                                 className="registration-input"
//                             />
//                             <button type="submit" className="registration-button">
//                                 Register Face
//                             </button>
//                         </form>
//                         {registrationStatus && <p className="registration-status">{registrationStatus}</p>}
//                     </div>

//                     {/* Authorised Detections Panel */}
//                     <div className="history-panel card">
//                         <h3><i className="fas fa-check-circle"></i> Authorised Detections</h3>
//                         <ul className="history-list">
//                             {authorisedHistory.length > 0 ? authorisedHistory.slice(0, 5).map((item, index) => (
//                                 <li key={index} className="history-item authorised">
//                                     <span>{item.name}</span>
//                                     <span className="history-time">{item.timestamp.split(' ')[1]}</span>
//                                 </li>
//                             )) : <li>No authorised persons detected.</li>}
//                         </ul>
//                     </div>

//                     {/* Unauthorised Detections Panel */}
//                     <div className="history-panel card">
//                         <h3><i className="fas fa-exclamation-triangle"></i> Unauthorised Detections</h3>
//                         <ul className="history-list">
//                             {unauthorisedHistory.length > 0 ? unauthorisedHistory.slice(0, 5).map((item, index) => (
//                                 <li key={index} className="history-item unauthorised">
//                                     <span>{item.name}</span>
//                                     <span className="history-time">{item.timestamp.split(' ')[1]}</span>
//                                 </li>
//                             )) : <li>Area clear of unknown persons.</li>}
//                         </ul>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;



import React from 'react'

function Dashboard() {
  return (
    <div>Dashboard</div>
  )
}

export default Dashboard