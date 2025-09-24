// import React, { useState, useEffect, useRef } from 'react';
// import Sidebar from './components/Sidebar';
// import Dashboard from './components/Dashboard';
// import RobotControl from './components/RobotControl';
// import RouteExecutor from './components/RouteExecutor';
// import RouteList from './components/RouteList';
// import ManualControl from './components/ManualControl';
// import { db } from './services/firebase';
// import { ref, onValue, off, set, update } from 'firebase/database';
// import './styles/App.css';


// function App() {
//   // Navigation state
//   const [activeView, setActiveView] = useState('dashboard');
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


//   // Route editing state
//   const [routeToEdit, setRouteToEdit] = useState(null);


//   // Route execution state
//   const [routes, setRoutes] = useState([]);
//   const [selectedRouteId, setSelectedRouteId] = useState('');
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [executingRouteName, setExecutingRouteName] = useState('');
//   const [currentMove, setCurrentMove] = useState(null);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [statusMessage, setStatusMessage] = useState('Ready to Execute');


//   // Refs for execution engine
//   const executionTimeoutRef = useRef(null);
//   const countdownIntervalRef = useRef(null);


//   const executionStateRef = useRef({
//     route: null,
//     moveIndex: 0,
//     remainingDuration: 0,
//     isPaused: false,
//     pauseCondition: null,
//   });


//   // Fetch all routes from Firebase
//   useEffect(() => {
//     const routesRef = ref(db, 'routes');
//     const listener = onValue(routesRef, (snapshot) => {
//       const data = snapshot.val();
//       const routesArray = data ? Object.keys(data).map(key => {
//         const moves = data[key].moves ? Object.values(data[key].moves) : [];
//         return { id: key, name: data[key].name, moves };
//       }) : [];
//       setRoutes(routesArray);
//     });
//     return () => off(routesRef, 'value', listener);
//   }, []);


//   // Sensor/Detection listener
//   useEffect(() => {
//     const robotRouteRef = ref(db, 'currentRobotRoute');


//     const listener = onValue(robotRouteRef, (snapshot) => {
//       if (!isPlaying && !executionStateRef.current.isPaused) {
//         return;
//       }
//       if (executionStateRef.current.pauseCondition === 'user') {
//         return;
//       }


//       const data = snapshot.val();
//       const sensorValue = data?.sensor ?? 100;
//       const detectedValue = Number(data?.detected ?? 0);


//       const isSystemPaused = executionStateRef.current.isPaused &&
//         (executionStateRef.current.pauseCondition === 'sensor' ||
//           executionStateRef.current.pauseCondition === 'detected');


//       if (sensorValue < 40) {
//         if (!executionStateRef.current.isPaused) {
//           pauseExecution('sensor');
//         }
//       } else if (detectedValue === 1) {
//         if (!executionStateRef.current.isPaused) {
//           pauseExecution('detected');
//         }
//       } else {
//         if (isSystemPaused) {
//           resumeExecution();
//         }
//       }
//     });


//     return () => off(robotRouteRef, 'value', listener);
//   }, [isPlaying]);


//   // MODIFIED: Core execution engine with aggressive timer cleanup
//   const runExecutionLoop = () => {
//     // KEY FIX: Aggressively clear any lingering timers before starting new ones.
//     // This prevents multiple intervals from running simultaneously.
//     clearTimeout(executionTimeoutRef.current);
//     clearInterval(countdownIntervalRef.current);


//     const { route, moveIndex } = executionStateRef.current;
//     if (!route || !route.moves || !route.moves[moveIndex]) {
//       handleStop();
//       return;
//     }


//     const move = route.moves[moveIndex];
//     const duration = executionStateRef.current.remainingDuration > 0
//       ? executionStateRef.current.remainingDuration
//       : move.duration;


//     const getDirectionCommand = (direction) => {
//       switch (direction.toLowerCase()) {
//         case 'forward': return 'F';
//         case 'backward': return 'B';
//         case 'left': return 'L';
//         case 'right': return 'R';
//         default: return direction.charAt(0).toUpperCase();
//       }
//     };


//     const directionCommand = getDirectionCommand(move.direction);


//     setCurrentMove(move);
//     setTimeLeft(duration);
//     setStatusMessage(`Moving: ${move.direction}`);


//     update(ref(db, 'currentRobotRoute'), {
//       direction: directionCommand,
//       duration: move.duration,
//       timestamp: new Date().toISOString(),
//     });


//     executionTimeoutRef.current = setTimeout(() => {
//       if (executionStateRef.current.isPaused) return;


//       executionStateRef.current.moveIndex = (moveIndex + 1) % route.moves.length;
//       executionStateRef.current.remainingDuration = 0;
//       runExecutionLoop();
//     }, duration * 1000);


//     countdownIntervalRef.current = setInterval(() => {
//       // This guard is still useful as a secondary check.
//       if (executionStateRef.current.isPaused) {
//         clearInterval(countdownIntervalRef.current); // Also clear here to be safe
//         return;
//       }


//       setTimeLeft(prev => {
//         const newTime = Math.max(0, prev - 1); // Ensure time doesn't go negative
//         executionStateRef.current.remainingDuration = newTime;
//         if (newTime <= 0) {
//           clearInterval(countdownIntervalRef.current);
//         }
//         return newTime;
//       });
//     }, 1000);
//   };


//   // Execution control functions
//   const pauseExecution = (reason) => {
//     // These clear operations are now slightly redundant but harmless.
//     // They ensure the system stops responding immediately.
//     clearTimeout(executionTimeoutRef.current);
//     clearInterval(countdownIntervalRef.current);


//     update(ref(db, 'currentRobotRoute'), {
//       direction: "S"
//     });


//     executionStateRef.current.isPaused = true;
//     executionStateRef.current.pauseCondition = reason;
//     setIsPlaying(false);


//     switch (reason) {
//       case 'sensor':
//         setStatusMessage('Paused: Low sensor value detected.');
//         break;
//       case 'detected':
//         setStatusMessage('Paused: Obstacle detected. Awaiting clear.');
//         break;
//       case 'user':
//         setStatusMessage('Paused by user.');
//         break;
//       default:
//         setStatusMessage('Paused.');
//     }
//   };


//   const resumeExecution = () => {
//     executionStateRef.current.isPaused = false;
//     executionStateRef.current.pauseCondition = null;
//     setIsPlaying(true);
//     runExecutionLoop();
//   };


//   const handlePlay = (routeId = selectedRouteId) => {
//     const route = routes.find(r => r.id === routeId);
//     if (!route || route.moves.length === 0) {
//       alert('Please select a route with at least one move.');
//       return;
//     }


//     if (executionStateRef.current.isPaused && executionStateRef.current.pauseCondition === 'user') {
//       resumeExecution();
//     } else {
//       if (!selectedRouteId || selectedRouteId !== routeId) {
//         setSelectedRouteId(routeId);
//         setExecutingRouteName(route.name);
//       }


//       executionStateRef.current = {
//         route,
//         moveIndex: 0,
//         remainingDuration: 0,
//         isPaused: false,
//         pauseCondition: null
//       };
//       setIsPlaying(true);
//       runExecutionLoop();
//     }
//   };


//   const handleStop = () => {
//     clearTimeout(executionTimeoutRef.current);
//     clearInterval(countdownIntervalRef.current);


//     set(ref(db, 'currentRobotRoute'), {
//       direction: "S",
//       duration: 0,
//       timestamp: new Date().toISOString(),
//       sensor: null,
//       detected: null
//     });


//     executionStateRef.current = {
//       route: null,
//       moveIndex: 0,
//       remainingDuration: 0,
//       isPaused: false,
//       pauseCondition: null
//     };


//     setIsPlaying(false);
//     setSelectedRouteId('');
//     setExecutingRouteName('');
//     setCurrentMove(null);
//     setTimeLeft(0);
//     setStatusMessage('Stopped.');
//   };


//   const handlePause = () => {
//     if (isPlaying) {
//       pauseExecution('user');
//     }
//   };


//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       clearTimeout(executionTimeoutRef.current);
//       clearInterval(countdownIntervalRef.current);
//     };
//   }, []);


//   const handleViewChange = (viewId) => {
//     console.log('Switching to view:', viewId);
//     setActiveView(viewId);
//     if (viewId !== 'route-creation') {
//       setRouteToEdit(null);
//     }
//   };


//   const handleToggleSidebar = () => {
//     setSidebarCollapsed(!sidebarCollapsed);
//   };


//   const handleEditRoute = (route) => {
//     setRouteToEdit(route);
//     setActiveView('route-creation');
//   };


//   const handleFinishEditing = () => {
//     setRouteToEdit(null);
//     setActiveView('route-management');
//   };


//   const handleRouteSelection = (routeId, routeName) => {
//     if (!isPlaying) {
//       setSelectedRouteId(routeId);
//       if (routeName) {
//         setExecutingRouteName(routeName);
//       }
//     }
//   };


//   const renderContent = () => {
//     try {
//       switch (activeView) {
//         case 'dashboard':
//           return (
//             <div className="view-container dashboard-view">
//               <Dashboard />
//             </div>
//           );


//         case 'route-creation':
//           return (
//             <div className="view-container">
//               <div className="view-header">
//                 <h1>Route Creation</h1>
//                 <p>Create and map new robot routes</p>
//               </div>
//               <RobotControl
//                 routeToEdit={routeToEdit}
//                 onFinishEditing={handleFinishEditing}
//               />
//             </div>
//           );


//         case 'route-execution':
//           return (
//             <div className="view-container">
//               <div className="view-header">
//                 <h1>Route Execution</h1>
//                 <p>Execute your saved robot routes</p>
//               </div>
//               <RouteExecutor
//                 routes={routes}
//                 selectedRouteId={selectedRouteId}
//                 isPlaying={isPlaying}
//                 currentMove={currentMove}
//                 timeLeft={timeLeft}
//                 statusMessage={statusMessage}
//                 executionStateRef={executionStateRef}
//                 onRouteSelect={handleRouteSelection}
//                 onPlay={handlePlay}
//                 onPause={handlePause}
//                 onStop={handleStop}
//               />
//             </div>
//           );


//         case 'route-management':
//           return (
//             <div className="view-container">
//               <div className="view-header">
//                 <h1>Route Management</h1>
//                 <p>Manage and organize your saved routes</p>
//               </div>
//               <RouteList onEdit={handleEditRoute} />
//             </div>
//           );


//         case 'manual-control':
//           return (
//             <div className="view-container">
//               <div className="view-header">
//                 <h1>Manual Robot Movement</h1>
//                 <p>Direct control of robot movement</p>
//               </div>
//               <ManualControl />
//             </div>
//           );


//         case 'settings':
//           return (
//             <div className="view-container">
//               <div className="settings-panel">
//                 <div className="settings-container">
//                   <h1>System Settings</h1>
//                   <div className="settings-content">
//                     <div className="settings-section">
//                       <h2>Detection Settings</h2>
//                       <div className="setting-item">
//                         <label>Fire Detection Confidence</label>
//                         <input type="range" min="0.5" max="1.0" step="0.1" defaultValue="0.8" />
//                         <span>80%</span>
//                       </div>
//                       <div className="setting-item">
//                         <label>Person Detection Confidence</label>
//                         <input type="range" min="0.3" max="0.9" step="0.1" defaultValue="0.5" />
//                         <span>50%</span>
//                       </div>
//                       <div className="setting-item">
//                         <label>Gender Detection Confidence</label>
//                         <input type="range" min="0.5" max="1.0" step="0.1" defaultValue="0.7" />
//                         <span>70%</span>
//                       </div>
//                     </div>


//                     <div className="settings-section">
//                       <h2>System Configuration</h2>
//                       <div className="setting-item">
//                         <label>Camera Source</label>
//                         <select defaultValue="0">
//                           <option value="0">Built-in Camera</option>
//                           <option value="1">External Camera 1</option>
//                           <option value="2">External Camera 2</option>
//                         </select>
//                       </div>
//                       <div className="setting-item">
//                         <label>Auto-save Routes</label>
//                         <input type="checkbox" defaultChecked />
//                       </div>
//                       <div className="setting-item">
//                         <label>Enable Notifications</label>
//                         <input type="checkbox" defaultChecked />
//                       </div>
//                     </div>


//                     <div className="settings-section">
//                       <h2>Display Options</h2>
//                       <div className="setting-item">
//                         <label>Theme</label>
//                         <select defaultValue="dark">
//                           <option value="dark">Dark</option>
//                           <option value="light">Light</option>
//                           <option value="auto">Auto</option>
//                         </select>
//                       </div>
//                       <div className="setting-item">
//                         <label>Animation Speed</label>
//                         <select defaultValue="normal">
//                           <option value="slow">Slow</option>
//                           <option value="normal">Normal</option>
//                           <option value="fast">Fast</option>
//                           <option value="off">Disabled</option>
//                         </select>
//                       </div>
//                     </div>


//                     <div className="settings-actions">
//                       <button className="save-settings">Save Settings</button>
//                       <button className="reset-settings secondary">Reset to Defaults</button>
//                       <button className="export-settings tertiary">Export Configuration</button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );


//         default:
//           return (
//             <div className="view-container">
//               <Dashboard />
//             </div>
//           );
//       }
//     } catch (error) {
//       console.error('Error rendering content:', error);
//       return (
//         <div className="view-container">
//           <div className="error-fallback">
//             <div className="error-container">
//               <div className="error-icon">⚠️</div>
//               <h2>View Error</h2>
//               <p>There was an error loading this view. Please try refreshing the page.</p>
//               <button onClick={() => setActiveView('dashboard')} className="retry-button">
//                 Go to Dashboard
//               </button>
//             </div>
//           </div>
//         </div>
//       );
//     }
//   };


//   return (
//     <div className="app">
//       <Sidebar
//         activeView={activeView}
//         onViewChange={handleViewChange}
//         isCollapsed={sidebarCollapsed}
//         onToggleCollapse={handleToggleSidebar}
//         isRouteExecuting={isPlaying}
//         executingRouteName={executingRouteName}
//         currentMove={currentMove}
//         timeLeft={timeLeft}
//         statusMessage={statusMessage}
//         onStop={handleStop}
//         onPause={handlePause}
//         onPlay={() => handlePlay()}
//         isPaused={executionStateRef.current.isPaused}
//       />


//       <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
//         <div className="content-wrapper">
//           {renderContent()}
//         </div>
//       </main>
//     </div>
//   );
// }


// export default App;









import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RobotControl from './components/RobotControl';
import RouteExecutor from './components/RouteExecutor';
import RouteList from './components/RouteList';
import ManualControl from './components/ManualControl';
import { db } from './services/firebase';
import { ref, onValue, off, set, update } from 'firebase/database';
import './styles/App.css';

function App() {
  // Navigation state
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Route editing state
  const [routeToEdit, setRouteToEdit] = useState(null);

  // Route execution state
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [executingRouteName, setExecutingRouteName] = useState('');
  const [currentMove, setCurrentMove] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready to Execute');

  // Refs for execution engine
  const executionTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const currentTimeRef = useRef(0); // Track current time in real-time

  const executionStateRef = useRef({
    route: null,
    moveIndex: 0,
    remainingDuration: 0,
    isPaused: false,
    pauseCondition: null,
  });

  // Clear all timers function
  const clearAllTimers = () => {
    if (executionTimeoutRef.current) {
      clearTimeout(executionTimeoutRef.current);
      executionTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // Fetch all routes from Firebase
  useEffect(() => {
    const routesRef = ref(db, 'routes');
    const listener = onValue(routesRef, (snapshot) => {
      const data = snapshot.val();
      const routesArray = data ? Object.keys(data).map(key => {
        const moves = data[key].moves ? Object.values(data[key].moves) : [];
        return { id: key, name: data[key].name, moves };
      }) : [];
      setRoutes(routesArray);
    });
    return () => off(routesRef, 'value', listener);
  }, []);

  // Detection listener - simplified and reliable
  useEffect(() => {
    if (!isPlaying && !executionStateRef.current.isPaused) return;

    const robotRouteRef = ref(db, 'currentRobotRoute');
    const listener = onValue(robotRouteRef, (snapshot) => {
      const data = snapshot.val();

      // Get detection value
      let detectionValue = 0;
      if (data?.detection) {
        if (typeof data.detection === 'number') {
          detectionValue = data.detection;
        } else if (data.detection.status !== undefined) {
          detectionValue = data.detection.status;
        }
      }

      console.log('Detection value:', detectionValue);

      // Handle detection changes
      if (detectionValue === 1 && !executionStateRef.current.isPaused) {
        console.log('Dust detected - pausing execution');
        pauseForDetection();
      }
      else if (detectionValue === 0 && executionStateRef.current.pauseCondition === 'detection') {
        console.log('Dust cleared - resuming execution');
        resumeFromDetection();
      }
    });

    return () => off(robotRouteRef, 'value', listener);
  }, [isPlaying]);

  // Pause for detection - use real-time ref value
  const pauseForDetection = () => {
    console.log('PAUSING FOR DETECTION');

    clearAllTimers();

    // Use the real-time ref value, not state
    const actualRemainingTime = currentTimeRef.current;
    console.log('Actual remaining time from ref:', actualRemainingTime);

    // Stop robot
    update(ref(db, 'currentRobotRoute'), { direction: "S" });

    // Save state using ref value
    executionStateRef.current.remainingDuration = actualRemainingTime;
    executionStateRef.current.isPaused = true;
    executionStateRef.current.pauseCondition = 'detection';

    setIsPlaying(false);
    setStatusMessage(`DUST DETECTED - Paused (${actualRemainingTime}s remaining)`);

    console.log('Paused with remaining:', actualRemainingTime);
  };

  // Resume from detection
  const resumeFromDetection = () => {
    console.log('RESUMING FROM DETECTION');
    console.log('Saved remaining duration:', executionStateRef.current.remainingDuration);

    executionStateRef.current.isPaused = false;
    executionStateRef.current.pauseCondition = null;
    setIsPlaying(true);
    setStatusMessage('Resuming...');

    // Continue with saved time
    continueCurrentMove();
  };

  // Continue current move with remaining time
  const continueCurrentMove = () => {
    const { route, moveIndex, remainingDuration } = executionStateRef.current;

    if (!route || !route.moves || moveIndex >= route.moves.length) {
      handleStop();
      return;
    }

    const move = route.moves[moveIndex];
    const timeToUse = remainingDuration;

    console.log('CONTINUING MOVE:', {
      move: move.direction,
      originalDuration: move.duration,
      remainingTime: remainingDuration,
      usingTime: timeToUse
    });

    // Clear any existing timers
    clearAllTimers();

    // Convert direction to command
    const getDirectionCommand = (direction) => {
      const dirMap = {
        'forward': 'F',
        'backward': 'B',
        'left': 'L',
        'right': 'R'
      };
      return dirMap[direction.toLowerCase()] || direction.charAt(0).toUpperCase();
    };

    // Update UI
    setCurrentMove(move);
    setTimeLeft(timeToUse);
    setStatusMessage(`Continuing: ${move.direction} (${timeToUse}s remaining)`);
    currentTimeRef.current = timeToUse; // Set ref to current time

    // Send command to robot
    update(ref(db, 'currentRobotRoute'), {
      direction: getDirectionCommand(move.direction),
      duration: move.duration,
      timestamp: new Date().toISOString(),
    });

    // Set timeout for move completion
    executionTimeoutRef.current = setTimeout(() => {
      if (!executionStateRef.current.isPaused) {
        // Move completed - go to next
        console.log('Move completed, advancing to next');
        executionStateRef.current.moveIndex = (moveIndex + 1) % route.moves.length;
        executionStateRef.current.remainingDuration = 0;
        startNewMove();
      }
    }, timeToUse * 1000);

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      if (executionStateRef.current.isPaused) {
        return;
      }

      currentTimeRef.current = Math.max(0, currentTimeRef.current - 1);
      setTimeLeft(currentTimeRef.current);
      executionStateRef.current.remainingDuration = currentTimeRef.current;
    }, 1000);
  };

  // Start a new move (from beginning)
  const startNewMove = () => {
    const { route, moveIndex } = executionStateRef.current;

    if (!route || !route.moves || moveIndex >= route.moves.length) {
      handleStop();
      return;
    }

    const move = route.moves[moveIndex];
    const duration = move.duration;

    console.log('STARTING NEW MOVE:', move.direction, 'for', duration, 'seconds');

    clearAllTimers();

    const getDirectionCommand = (direction) => {
      const dirMap = {
        'forward': 'F',
        'backward': 'B',
        'left': 'L',
        'right': 'R'
      };
      return dirMap[direction.toLowerCase()] || direction.charAt(0).toUpperCase();
    };

    // Update UI
    setCurrentMove(move);
    setTimeLeft(duration);
    setStatusMessage(`Moving: ${move.direction}`);
    currentTimeRef.current = duration; // Set ref to full duration

    // Send command to robot
    update(ref(db, 'currentRobotRoute'), {
      direction: getDirectionCommand(move.direction),
      duration: move.duration,
      timestamp: new Date().toISOString(),
    });

    // Set timeout for move completion
    executionTimeoutRef.current = setTimeout(() => {
      if (!executionStateRef.current.isPaused) {
        // Move completed - go to next
        executionStateRef.current.moveIndex = (moveIndex + 1) % route.moves.length;
        executionStateRef.current.remainingDuration = 0;
        startNewMove();
      }
    }, duration * 1000);

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      if (executionStateRef.current.isPaused) {
        return;
      }

      currentTimeRef.current = Math.max(0, currentTimeRef.current - 1);
      setTimeLeft(currentTimeRef.current);
      executionStateRef.current.remainingDuration = currentTimeRef.current;
    }, 1000);
  };

  const handlePlay = (routeId = selectedRouteId) => {
    const route = routes.find(r => r.id === routeId);
    if (!route || route.moves.length === 0) {
      alert('Please select a route with at least one move.');
      return;
    }

    if (!selectedRouteId || selectedRouteId !== routeId) {
      setSelectedRouteId(routeId);
      setExecutingRouteName(route.name);
    }

    executionStateRef.current = {
      route,
      moveIndex: 0,
      remainingDuration: 0,
      isPaused: false,
      pauseCondition: null
    };

    setIsPlaying(true);
    startNewMove();
  };

  const handleStop = () => {
    console.log('Stopping execution...');

    clearAllTimers();

    // Stop robot
    set(ref(db, 'currentRobotRoute'), {
      direction: "S",
      duration: 0,
      timestamp: new Date().toISOString(),
    });

    // Reset state
    executionStateRef.current = {
      route: null,
      moveIndex: 0,
      remainingDuration: 0,
      isPaused: false,
      pauseCondition: null
    };

    currentTimeRef.current = 0;
    setIsPlaying(false);
    setSelectedRouteId('');
    setExecutingRouteName('');
    setCurrentMove(null);
    setTimeLeft(0);
    setStatusMessage('Stopped');
  };

  const handlePause = () => {
    if (isPlaying && executionStateRef.current.pauseCondition !== 'detection') {
      clearAllTimers();
      update(ref(db, 'currentRobotRoute'), { direction: "S" });

      executionStateRef.current.remainingDuration = currentTimeRef.current;
      executionStateRef.current.isPaused = true;
      executionStateRef.current.pauseCondition = 'user';
      setIsPlaying(false);
      setStatusMessage('Paused by user');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  const handleViewChange = (viewId) => {
    console.log('Switching to view:', viewId);
    setActiveView(viewId);
    if (viewId !== 'route-creation') {
      setRouteToEdit(null);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleEditRoute = (route) => {
    setRouteToEdit(route);
    setActiveView('route-creation');
  };

  const handleFinishEditing = () => {
    setRouteToEdit(null);
    setActiveView('route-management');
  };

  const handleRouteSelection = (routeId, routeName) => {
    if (!isPlaying) {
      setSelectedRouteId(routeId);
      if (routeName) {
        setExecutingRouteName(routeName);
      }
    }
  };

  const renderContent = () => {
    try {
      switch (activeView) {
        case 'dashboard':
          return (
            <div className="view-container dashboard-view">
              <Dashboard />
            </div>
          );

        case 'route-creation':
          return (
            <div className="view-container">
              <div className="view-header">
                <h1>Route Creation</h1>
                <p>Create and map new robot routes</p>
              </div>
              <RobotControl
                routeToEdit={routeToEdit}
                onFinishEditing={handleFinishEditing}
              />
            </div>
          );

        case 'route-execution':
          return (
            <div className="view-container">
              <div className="view-header">
                <h1>Route Execution</h1>
                <p>Execute your saved robot routes</p>
              </div>
              <RouteExecutor
                routes={routes}
                selectedRouteId={selectedRouteId}
                isPlaying={isPlaying}
                currentMove={currentMove}
                timeLeft={timeLeft}
                statusMessage={statusMessage}
                executionStateRef={executionStateRef}
                onRouteSelect={handleRouteSelection}
                onPlay={handlePlay}
                onPause={handlePause}
                onStop={handleStop}
              />
            </div>
          );

        case 'route-management':
          return (
            <div className="view-container">
              <div className="view-header">
                <h1>Route Management</h1>
                <p>Manage and organize your saved routes</p>
              </div>
              <RouteList onEdit={handleEditRoute} />
            </div>
          );

        case 'manual-control':
          return (
            <div className="view-container">
              <div className="view-header">
                <h1>Manual Robot Movement</h1>
                <p>Direct control of robot movement</p>
              </div>
              <ManualControl />
            </div>
          );

        default:
          return (
            <div className="view-container">
              <Dashboard />
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="view-container">
          <div className="error-fallback">
            <div className="error-container">
              <div className="error-icon">Warning</div>
              <h2>View Error</h2>
              <p>There was an error loading this view. Please try refreshing the page.</p>
              <button onClick={() => setActiveView('dashboard')} className="retry-button">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isRouteExecuting={isPlaying}
        executingRouteName={executingRouteName}
        currentMove={currentMove}
        timeLeft={timeLeft}
        statusMessage={statusMessage}
        onStop={handleStop}
        onPause={handlePause}
        onPlay={() => handlePlay()}
        isPaused={executionStateRef.current.isPaused}
      />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;