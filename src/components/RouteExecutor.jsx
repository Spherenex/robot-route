// import React, { useState, useEffect, useRef } from 'react';
// import { db } from '../services/firebase';
// import { ref, onValue, off, set, update } from 'firebase/database';

// const RouteExecutor = ({ selectedRouteId, onRouteSelect, isPlaying, onPlayStateChange }) => {
//     // --- STATE FOR UI RENDERING ---
//     const [routes, setRoutes] = useState([]);
//     const [currentMove, setCurrentMove] = useState(null);
//     const [timeLeft, setTimeLeft] = useState(0);
//     const [statusMessage, setStatusMessage] = useState('Ready to Execute');

//     // --- REFS FOR THE EXECUTION ENGINE ---
//     const executionTimeoutRef = useRef(null);
//     const countdownIntervalRef = useRef(null);
//     const specialPauseTimeoutRef = useRef(null); // For the 20-second detected pause

//     const executionStateRef = useRef({
//         route: null,
//         moveIndex: 0,
//         remainingDuration: 0,
//         isPaused: false,
//         pauseCondition: null, // e.g., 'sensor', 'detected', 'user'
//     });

//     // Fetch all routes from Firebase
//     useEffect(() => {
//         const routesRef = ref(db, 'routes');
//         const listener = onValue(routesRef, (snapshot) => {
//             const data = snapshot.val();
//             const routesArray = data ? Object.keys(data).map(key => {
//                 const moves = data[key].moves ? Object.values(data[key].moves) : [];
//                 return { id: key, name: data[key].name, moves };
//             }) : [];
//             setRoutes(routesArray);
//         });
//         return () => off(routesRef, 'value', listener);
//     }, []);

//     // --- UNIFIED LISTENER FOR SENSOR, DETECTION, AND COMMANDS ---
//     useEffect(() => {
//         const robotRouteRef = ref(db, 'currentRobotRoute');

//         const listener = onValue(robotRouteRef, (snapshot) => {
//             if (!isPlaying || (executionStateRef.current.isPaused && executionStateRef.current.pauseCondition !== 'sensor')) {
//                 return;
//             }

//             const data = snapshot.val();
//             const sensorValue = data?.sensor ?? 100;
//             const detectedValue = data?.detected ?? 0;

//             if (sensorValue < 40) {
//                 if (!executionStateRef.current.isPaused) {
//                     pauseExecution('sensor');
//                 }
//             } else if (detectedValue === 1) {
//                 if (!executionStateRef.current.isPaused) {
//                     pauseExecution('detected');
//                 }
//             } else {
//                 if (executionStateRef.current.isPaused && executionStateRef.current.pauseCondition === 'sensor') {
//                     resumeExecution();
//                 }
//             }
//         });

//         return () => off(robotRouteRef, 'value', listener);
//     }, [isPlaying]);


//     // --- THE EXECUTION ENGINE ---
//     const runExecutionLoop = () => {
//         const { route, moveIndex } = executionStateRef.current;

//         if (!route || !route.moves || !route.moves[moveIndex]) {
//             handleStop();
//             return;
//         }

//         const move = route.moves[moveIndex];
//         const duration = executionStateRef.current.remainingDuration > 0 ? executionStateRef.current.remainingDuration : move.duration;

//         setCurrentMove(move);
//         setTimeLeft(duration);
//         setStatusMessage(`Moving: ${move.direction}`);

//         // Update the currentRobotRoute path with the new move.
//         // Using `update` is safer here as it won't overwrite sensor/detected fields.
//         update(ref(db, 'currentRobotRoute'), {
//             direction: move.direction,
//             duration: move.duration,
//             timestamp: new Date().toISOString(),
//         });

//         executionTimeoutRef.current = setTimeout(() => {
//             executionStateRef.current.moveIndex = (moveIndex + 1) % route.moves.length;
//             executionStateRef.current.remainingDuration = 0;
//             runExecutionLoop();
//         }, duration * 1000);

//         countdownIntervalRef.current = setInterval(() => {
//             setTimeLeft(prev => {
//                 const newTime = prev - 1;
//                 executionStateRef.current.remainingDuration = newTime;
//                 if (newTime <= 0) {
//                     clearInterval(countdownIntervalRef.current);
//                     return 0;
//                 }
//                 return newTime;
//             });
//         }, 1000);
//     };

//     // --- CONTROL FUNCTIONS ---
//     const pauseExecution = (reason) => {
//         clearTimeout(executionTimeoutRef.current);
//         clearInterval(countdownIntervalRef.current);
//         clearTimeout(specialPauseTimeoutRef.current);

//         executionStateRef.current.isPaused = true;
//         executionStateRef.current.pauseCondition = reason;
//         onPlayStateChange(false);

//         switch (reason) {
//             case 'sensor':
//                 setStatusMessage('Paused: Sensor value too low.');
//                 break;
//             case 'detected':
//                 setStatusMessage('Paused: Obstacle detected. Waiting 20s...');
//                 specialPauseTimeoutRef.current = setTimeout(resumeExecution, 20000);
//                 break;
//             case 'user':
//                 setStatusMessage('Paused by user.');
//                 break;
//             default:
//                 setStatusMessage('Paused.');
//         }
//     };

//     const resumeExecution = () => {
//         clearTimeout(specialPauseTimeoutRef.current);
//         executionStateRef.current.isPaused = false;
//         executionStateRef.current.pauseCondition = null;
//         onPlayStateChange(true);
//         runExecutionLoop();
//     };

//     const handlePlay = () => {
//         const route = routes.find(r => r.id === selectedRouteId);
//         if (!route || route.moves.length === 0) {
//             alert('Please select a route with at least one move.');
//             return;
//         }

//         if (executionStateRef.current.isPaused && executionStateRef.current.pauseCondition === 'user') {
//             resumeExecution();
//         } else {
//             executionStateRef.current = {
//                 route,
//                 moveIndex: 0,
//                 remainingDuration: 0,
//                 isPaused: false,
//                 pauseCondition: null
//             };
//             onPlayStateChange(true);
//             runExecutionLoop();
//         }
//     };

//     const handleStop = () => {
//         clearTimeout(executionTimeoutRef.current);
//         clearInterval(countdownIntervalRef.current);
//         clearTimeout(specialPauseTimeoutRef.current);

//         // When stopping, completely overwrite the path to clean it up.
//         set(ref(db, 'currentRobotRoute'), {
//             direction: "stopped",
//             duration: 0,
//             timestamp: new Date().toISOString(),
//             sensor: null, // Clear sensor and detected fields
//             detected: null
//         });

//         executionStateRef.current = { route: null, moveIndex: 0, remainingDuration: 0, isPaused: false, pauseCondition: null };

//         onPlayStateChange(false);
//         setCurrentMove(null);
//         setTimeLeft(0);
//         setStatusMessage('Stopped.');
//     };

//     const handlePause = () => {
//         if (isPlaying) {
//             pauseExecution('user');
//         }
//     };

//     const handleRouteSelection = (e) => {
//         const routeId = e.target.value;
//         const selectedRoute = routes.find(r => r.id === routeId);
//         onRouteSelect(routeId, selectedRoute?.name || '');
//         if (isPlaying || executionStateRef.current.isPaused) {
//             handleStop();
//         }
//     };

//     useEffect(() => {
//         // Cleanup on unmount
//         return handleStop;
//     }, []);

//     const playPauseButton = () => {
//         if (!isPlaying && executionStateRef.current.pauseCondition === 'user') {
//             return <button onClick={handlePlay}>Resume</button>;
//         }
//         if (isPlaying) {
//             return <button onClick={handlePause} className="pause-btn">Pause</button>;
//         }
//         return <button onClick={handlePlay} disabled={!selectedRouteId}>Play</button>;
//     };

//     return (
//         <div className="route-executor-panel">
//             <h2>Route Executor</h2>
//             <div className="route-selection">
//                 <select onChange={handleRouteSelection} value={selectedRouteId} disabled={isPlaying || executionStateRef.current.isPaused}>
//                     <option value="">-- Select a Route --</option>
//                     {routes.map(route => (
//                         <option key={route.id} value={route.id}>{route.name}</option>
//                     ))}
//                 </select>
//             </div>
//             <div className="execution-display">
//                 <div className={`status-light ${isPlaying ? 'playing' : ''} ${executionStateRef.current.isPaused ? 'paused' : ''}`}></div>
//                 <div className="move-info">
//                     {(isPlaying || executionStateRef.current.isPaused) && currentMove ? (
//                         <>
//                             <span className="current-status">{statusMessage}</span>
//                             <span className="time-left">{timeLeft}s left</span>
//                         </>
//                     ) : (
//                         'Ready to Execute'
//                     )}
//                 </div>
//             </div>
//             <div className="execution-controls">
//                 {playPauseButton()}
//                 <button onClick={handleStop} disabled={!isPlaying && !executionStateRef.current.isPaused}>Stop</button>
//             </div>
//         </div>
//     );
// };

// export default RouteExecutor;





import React from 'react';

const RouteExecutor = ({
    routes,
    selectedRouteId,
    isPlaying,
    currentMove,
    timeLeft,
    statusMessage,
    executionStateRef,
    onRouteSelect,
    onPlay,
    onPause,
    onStop
}) => {

    const handleRouteSelection = (e) => {
        const routeId = e.target.value;
        const selectedRoute = routes.find(r => r.id === routeId);
        onRouteSelect(routeId, selectedRoute?.name || '');
    };

    const playPauseButton = () => {
        if (!isPlaying && executionStateRef.current.pauseCondition === 'user') {
            return <button onClick={onPlay}>Resume</button>;
        }
        if (isPlaying) {
            return <button onClick={onPause} className="pause-btn">Pause</button>;
        }
        return <button onClick={() => onPlay(selectedRouteId)} disabled={!selectedRouteId}>Play</button>;
    };

    return (
        <div className="route-executor-panel">
            <h2>Route Executor</h2>
            <div className="route-selection">
                <select
                    onChange={handleRouteSelection}
                    value={selectedRouteId}
                    disabled={isPlaying || executionStateRef.current.isPaused}
                >
                    <option value="">-- Select a Route --</option>
                    {routes.map(route => (
                        <option key={route.id} value={route.id}>{route.name}</option>
                    ))}
                </select>
            </div>
            <div className="execution-display">
                <div className={`status-light ${isPlaying ? 'playing' : ''} ${executionStateRef.current.isPaused ? 'paused' : ''}`}></div>
                <div className="move-info">
                    {(isPlaying || executionStateRef.current.isPaused) && currentMove ? (
                        <>
                            <span className="current-status">{statusMessage}</span>
                            <span className="time-left">{timeLeft}s left</span>
                        </>
                    ) : (
                        statusMessage || 'Ready to Execute'
                    )}
                </div>
            </div>
            <div className="execution-controls">
                {playPauseButton()}
                <button onClick={onStop} disabled={!isPlaying && !executionStateRef.current.isPaused}>Stop</button>
            </div>

            {/* Show current route details when selected */}
            {selectedRouteId && (
                <div className="selected-route-details">
                    <h3>Selected Route</h3>
                    <div className="route-info">
                        <p><strong>Route:</strong> {routes.find(r => r.id === selectedRouteId)?.name}</p>
                        <p><strong>Total Moves:</strong> {routes.find(r => r.id === selectedRouteId)?.moves?.length || 0}</p>
                        {isPlaying && currentMove && (
                            <p><strong>Current Move:</strong> {currentMove.direction} ({currentMove.duration}s)</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteExecutor;