
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { ref, push, set, update, onValue, off } from 'firebase/database';

const RobotControl = ({ routeToEdit, onFinishEditing }) => {
    // Session and route state
    const [routeName, setRouteName] = useState('');
    const [currentRouteMoves, setCurrentRouteMoves] = useState([]);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [currentRouteId, setCurrentRouteId] = useState(null);

    // Real-time movement and timer state
    const [isMoving, setIsMoving] = useState(false);
    const [activeDirection, setActiveDirection] = useState(null); // Track which direction is active
    const [activeMoveKey, setActiveMoveKey] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // State for editing a specific move
    const [moveBeingReplaced, setMoveBeingReplaced] = useState(null);

    const intervalRef = useRef(null);

    // Effect to enter edit mode
    useEffect(() => {
        if (routeToEdit) {
            setRouteName(routeToEdit.name);
            setCurrentRouteId(routeToEdit.id);
            setIsSessionActive(true);
        }
    }, [routeToEdit]);

    // Effect to listen for real-time move changes
    useEffect(() => {
        if (!currentRouteId) {
            setCurrentRouteMoves([]);
            return;
        }
        const movesRef = ref(db, `routes/${currentRouteId}/moves`);
        const listener = onValue(movesRef, (snapshot) => {
            const data = snapshot.val();
            const movesArray = data ? Object.keys(data).map(key => ({ key, ...data[key] })) : [];
            setCurrentRouteMoves(movesArray);
        });
        return () => off(movesRef, 'value', listener);
    }, [currentRouteId]);

    // Effect for the timer
    useEffect(() => {
        if (isMoving) {
            const startTime = Date.now();
            intervalRef.current = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isMoving]);

    const handleStartMove = (direction) => {
        if (isMoving || !isSessionActive) return;

        if (moveBeingReplaced) {
            const moveRef = ref(db, `routes/${currentRouteId}/moves/${moveBeingReplaced}`);
            update(moveRef, { direction, duration: 0 })
                .then(() => {
                    setActiveMoveKey(moveBeingReplaced);
                    setActiveDirection(direction);
                    setIsMoving(true);
                    setElapsedTime(0);
                });
        } else {
            const movesRef = ref(db, `routes/${currentRouteId}/moves`);
            const newMoveRef = push(movesRef);
            set(newMoveRef, { direction, duration: 0 })
                .then(() => {
                    setActiveMoveKey(newMoveRef.key);
                    setActiveDirection(direction);
                    setIsMoving(true);
                    setElapsedTime(0);
                });
        }
    };

    const handleStopMove = () => {
        if (!isMoving || !activeMoveKey) return;

        const finalDuration = elapsedTime > 0 ? elapsedTime : 1;
        const moveRef = ref(db, `routes/${currentRouteId}/moves/${activeMoveKey}`);
        update(moveRef, { duration: finalDuration })
            .then(() => {
                setIsMoving(false);
                setActiveDirection(null);
                setActiveMoveKey(null);
                setMoveBeingReplaced(null);
            });
    };

    const handleFinishSession = () => {
        if (routeToEdit) {
            onFinishEditing();
        }
        setIsSessionActive(false);
        setIsMoving(false);
        setActiveDirection(null);
        setMoveBeingReplaced(null);
        setCurrentRouteId(null);
        setRouteName('');
    };

    const handleStartSession = () => {
        if (routeName.trim() === '') {
            alert('Please enter a name for the route.');
            return;
        }
        const newRouteRef = push(ref(db, 'routes'));
        set(newRouteRef, { name: routeName, createdAt: new Date().toISOString() })
            .then(() => {
                setCurrentRouteId(newRouteRef.key);
                setIsSessionActive(true);
            });
    };

    const getButtonClass = (direction) => {
        let baseClass = `btn-${direction}`;
        if (isMoving && activeDirection === direction) {
            baseClass += ' active-movement';
        }
        return baseClass;
    };

    return (
        <div className="control-panel">
            {!isSessionActive ? (
                <div className="start-mapping-container">
                    <h2>Create a New Route</h2>
                    <input
                        type="text"
                        value={routeName}
                        onChange={(e) => setRouteName(e.target.value)}
                        placeholder="Enter Route Name"
                        className="route-input-main"
                    />
                    <button onClick={handleStartSession} className="start-mapping-button">
                        Start Mapping
                    </button>
                </div>
            ) : (
                <>
                    <h2>{routeToEdit ? `Editing: ${routeName}` : `Mapping: ${routeName}`}</h2>

                    {moveBeingReplaced && (
                        <div className="editing-indicator">
                            Replacing Step {currentRouteMoves.findIndex(m => m.key === moveBeingReplaced) + 1}
                            <button onClick={() => setMoveBeingReplaced(null)} className="cancel-replace-btn">
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Updated Movement Controls with Proper Layout */}
                    <div className="movement-controls">
                        <button
                            className={getButtonClass('forward')}
                            onClick={() => handleStartMove('forward')}
                            disabled={isMoving}
                        >
                            Forward
                        </button>

                        <button
                            className={getButtonClass('left')}
                            onClick={() => handleStartMove('left')}
                            disabled={isMoving}
                        >
                            Left
                        </button>

                        <div className="btn-idle">
                            {isMoving ? `${elapsedTime}s` : 'Idle'}
                        </div>

                        <button
                            className={getButtonClass('right')}
                            onClick={() => handleStartMove('right')}
                            disabled={isMoving}
                        >
                            Right
                        </button>

                        <button
                            className={getButtonClass('backward')}
                            onClick={() => handleStartMove('backward')}
                            disabled={isMoving}
                        >
                            Backward
                        </button>
                    </div>

                    {/* Stop Button (when moving) */}
                    {isMoving && (
                        <div className="stop-button-container">
                            <button onClick={handleStopMove} className="stop-button">
                                Stop Movement
                            </button>
                        </div>
                    )}

                    {/* Current Route Display */}
                    <div className="current-route">
                        <h3>Live Route Steps:</h3>
                        <ul>
                            {currentRouteMoves.map((move, index) => (
                                <li key={move.key} className={move.key === moveBeingReplaced ? 'is-editing' : ''}>
                                    <span>{index + 1}. {move.direction} for {move.duration}s</span>
                                    {routeToEdit && (
                                        <button
                                            onClick={() => setMoveBeingReplaced(move.key)}
                                            disabled={isMoving || moveBeingReplaced}
                                            className="replace-btn"
                                        >
                                            Replace
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button
                            onClick={handleFinishSession}
                            disabled={isMoving}
                            className="tertiary"
                        >
                            {routeToEdit ? 'Finish Editing' : 'Finish Mapping'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default RobotControl;