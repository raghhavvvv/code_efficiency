// client/src/hooks/useKeystrokeTracker.js
import { useRef, useCallback, useState } from 'react';
import api from '../services/api.js';

const BATCH_SIZE = 50;

export const useKeystrokeTracker = (sessionId, isActive) => {
    const keystrokes = useRef([]);
    const backspaceCount = useRef(0);
    const startTime = useRef(Date.now());
    const [keyCount, setKeyCount] = useState(0); // <-- State for UI display

    const sendData = useCallback(async () => {
        if (!sessionId || keystrokes.current.length === 0) return;
        try {
            await api.post('/api/keystroke-data', {
                sessionId,
                keystrokes: keystrokes.current,
                backspaceCount: backspaceCount.current,
            });
            // Reset batching arrays after sending
            keystrokes.current = [];
            backspaceCount.current = 0;
        } catch (error) { console.error('Failed to send keystroke data', error); }
    }, [sessionId]);

    const handleKeyDown = useCallback((event) => {
        if (!isActive || !sessionId) return;
        
        // Increment the display count on any key press
        setKeyCount(prevCount => prevCount + 1);

        keystrokes.current.push({ key: event.key, timestamp: Date.now() - startTime.current });
        if (event.key === 'Backspace' || event.key === 'Delete') {
            backspaceCount.current++;
        }
        if (keystrokes.current.length >= BATCH_SIZE) {
            sendData();
        }
    }, [isActive, sessionId, sendData]);

    // Function to reset the count from the parent component
    const resetKeyCount = () => {
        setKeyCount(0);
    };

    return { handleKeyDown, sendKeystrokeData: sendData, keyCount, resetKeyCount };
};