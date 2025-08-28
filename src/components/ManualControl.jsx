// import React, { useState } from 'react';
// import { db } from '../services/firebase';
// import { ref, set } from 'firebase/database';
// import './ManualControl.css';

// const ManualControl = () => {
//     const [lastCommand, setLastCommand] = useState('');
//     const [commandTime, setCommandTime] = useState('');

//     const sendDirection = async (direction) => {
//         try {
//             await set(ref(db, 'currentRobotRoute'), {
//                 direction: direction,
//                 duration: 0, // Manual commands don't have duration
//                 timestamp: new Date().toISOString(),
//                 manual: true // Flag to indicate manual control
//             });

//             setLastCommand(direction);
//             setCommandTime(new Date().toLocaleTimeString());
//             console.log(`Manual command sent: ${direction}`);
//         } catch (error) {
//             console.error('Error sending direction to Firebase:', error);
//             alert('Failed to send command. Please check your connection.');
//         }
//     };

//     const stopRobot = async () => {
//         try {
//             await set(ref(db, 'currentRobotRoute'), {
//                 direction: 'stopped',
//                 duration: 0,
//                 timestamp: new Date().toISOString(),
//                 manual: true
//             });

//             setLastCommand('STOPPED');
//             setCommandTime(new Date().toLocaleTimeString());
//             console.log('Robot stopped');
//         } catch (error) {
//             console.error('Error stopping robot:', error);
//             alert('Failed to stop robot. Please check your connection.');
//         }
//     };

//     return (
//         <div className="manual-control-panel">
//             <div className="manual-control-container">
//                 <div className="control-section">
//                     <h2>Manual Robot Control</h2>
//                     <p className="control-description">
//                         Use the directional buttons below to manually control the robot movement.
//                         Each button sends an immediate command to the robot.
//                     </p>

//                     <div className="manual-movement-controls">
//                         <button
//                             className="direction-btn btn-forward"
//                             onClick={() => sendDirection('F')}
//                             title="Move Forward"
//                         >
//                             <span className="btn-icon">⬆️</span>
//                             <span className="btn-label">Forward</span>
//                             <span className="btn-command">F</span>
//                         </button>

//                         <button
//                             className="direction-btn btn-left"
//                             onClick={() => sendDirection('L')}
//                             title="Turn Left"
//                         >
//                             <span className="btn-icon">⬅️</span>
//                             <span className="btn-label">Left</span>
//                             <span className="btn-command">L</span>
//                         </button>

//                         <button
//                             className="direction-btn btn-stop"
//                             onClick={stopRobot}
//                             title="Stop Robot"
//                         >
//                             <span className="btn-icon">⏹️</span>
//                             <span className="btn-label">Stop</span>
//                             <span className="btn-command">STOP</span>
//                         </button>

//                         <button
//                             className="direction-btn btn-right"
//                             onClick={() => sendDirection('R')}
//                             title="Turn Right"
//                         >
//                             <span className="btn-icon">➡️</span>
//                             <span className="btn-label">Right</span>
//                             <span className="btn-command">R</span>
//                         </button>

//                         <button
//                             className="direction-btn btn-backward"
//                             onClick={() => sendDirection('B')}
//                             title="Move Backward"
//                         >
//                             <span className="btn-icon">⬇️</span>
//                             <span className="btn-label">Backward</span>
//                             <span className="btn-command">B</span>
//                         </button>
//                     </div>

//                     {lastCommand && (
//                         <div className="command-status">
//                             <div className="status-indicator">
//                                 <h3>Last Command</h3>
//                                 <div className="status-details">
//                                     <span className="command-sent">Command: <strong>{lastCommand}</strong></span>
//                                     <span className="command-timestamp">Time: {commandTime}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     <div className="control-info">
//                         <div className="info-card">
//                             <h4>📋 Control Instructions</h4>
//                             <ul>
//                                 <li><strong>Forward:</strong> Sends "F" - Robot moves forward</li>
//                                 <li><strong>Left:</strong> Sends "L" - Robot turns left</li>
//                                 <li><strong>Right:</strong> Sends "R" - Robot turns right</li>
//                                 <li><strong>Backward:</strong> Sends "B" - Robot moves backward</li>
//                                 <li><strong>Stop:</strong> Stops all robot movement</li>
//                             </ul>
//                         </div>

//                         <div className="info-card">
//                             <h4>⚠️ Safety Notes</h4>
//                             <ul>
//                                 <li>Commands are sent immediately when buttons are pressed</li>
//                                 <li>Use the Stop button to halt all movement</li>
//                                 <li>Manual control overrides automatic route execution</li>
//                                 <li>Ensure clear path before sending movement commands</li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ManualControl;





import React, { useState } from 'react';
import { db } from '../services/firebase';
import { ref, set } from 'firebase/database';
import './ManualControl.css';

const ManualControl = () => {
    const [lastCommand, setLastCommand] = useState('');
    const [commandTime, setCommandTime] = useState('');

    const sendDirection = async (direction) => {
        try {
            await set(ref(db, 'currentRobotRoute'), {
                direction: direction,
                duration: 0, // Manual commands don't have duration
                timestamp: new Date().toISOString(),
                manual: true // Flag to indicate manual control
            });

            setLastCommand(direction);
            setCommandTime(new Date().toLocaleTimeString());
            console.log(`Manual command sent: ${direction}`);
        } catch (error) {
            console.error('Error sending direction to Firebase:', error);
            alert('Failed to send command. Please check your connection.');
        }
    };

    const setIdle = async () => {
        try {
            await set(ref(db, 'currentRobotRoute'), {
                direction: 'S',
                duration: 0,
                timestamp: new Date().toISOString(),
                manual: true
            });

            setLastCommand('IDLE');
            setCommandTime(new Date().toLocaleTimeString());
            console.log('Robot set to idle');
        } catch (error) {
            console.error('Error setting robot to idle:', error);
            alert('Failed to set robot to idle. Please check your connection.');
        }
    };

    return (
        <div className="manual-control-panel">
            <div className="manual-control-container">
                <div className="control-section">
                    <h2>Manual Robot Control</h2>
                    <p className="control-description">
                        Use the directional buttons below to manually control the robot movement.
                        Each button sends an immediate command to the robot.
                    </p>

                    <div className="manual-movement-controls">
                        <div className="control-row top-row">
                            <button
                                className="direction-btn btn-left"
                                onClick={() => sendDirection('L')}
                                title="Turn Left"
                            >
                                Left
                            </button>
                        </div>

                        <div className="control-row middle-row">
                            <button
                                className="direction-btn btn-forward"
                                onClick={() => sendDirection('F')}
                                title="Move Forward"
                            >
                                Forward
                            </button>

                            <button
                                className="direction-btn btn-idle"
                                onClick={setIdle}
                                title="Stop"
                            >
                                Stop
                            </button>
                            <button
                                className="direction-btn btn-backward"
                                onClick={() => sendDirection('B')}
                                title="Move Backward"
                            >
                                Backward
                            </button>

                        </div>

                        <div className="control-row bottom-row">
                            <button
                                className="direction-btn btn-right"
                                onClick={() => sendDirection('R')}
                                title="Turn Right"
                            >
                                Right
                            </button>
                        </div>
                    </div>

                    {/* {lastCommand && (
                        <div className="command-status">
                            <div className="status-indicator">
                                <h3>Last Command</h3>
                                <div className="status-details">
                                    <span className="command-sent">Command: <strong>{lastCommand}</strong></span>
                                    <span className="command-timestamp">Time: {commandTime}</span>
                                </div>
                            </div>
                        </div>
                    )} */}

                    <div className="control-info">
                        <div className="info-card">
                            <h4>📋 Control Instructions</h4>
                            <ul>
                                <li><strong>Forward:</strong> Sends "F" - Robot moves forward</li>
                                <li><strong>Left:</strong> Sends "L" - Robot turns left</li>
                                <li><strong>Right:</strong> Sends "R" - Robot turns right</li>
                                <li><strong>Backward:</strong> Sends "B" - Robot moves backward</li>
                                <li><strong>Stop:</strong> Sets robot to idle state</li>
                            </ul>
                        </div>

                        <div className="info-card">
                            <h4>⚠️ Safety Notes</h4>
                            <ul>
                                <li>Commands are sent immediately when buttons are pressed</li>
                                <li>Use the Idle button to set robot to neutral state</li>
                                <li>Manual control overrides automatic route execution</li>
                                <li>Ensure clear path before sending movement commands</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManualControl;