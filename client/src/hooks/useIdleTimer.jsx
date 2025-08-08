// client/src/hooks/useIdleTimer.jsx
import { useEffect, useRef, useCallback } from 'react';
import api from '../services/api.js';

const IDLE_TIMEOUT = 300000; // 5 minutes

export const useIdleTimer = (sessionId, isActive) => {
    const timerRef = useRef(null);
    const idleStartTimeRef = useRef(null);
    const isIdleRef = useRef(false);

    const sendIdleData = useCallback(async (duration) => {
        if (!sessionId) return;
        try {
            await api.post('/api/idle-data', { sessionId, duration });
            console.log(`Reported idle period of ${Math.round(duration / 1000)}s`);
        } catch (error) {
            console.error("Failed to send idle data", error);
        }
    }, [sessionId]);
    
    const onIdle = () => {
        isIdleRef.current = true;
        idleStartTimeRef.current = Date.now();
        console.log("User is now idle.");
    };

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        
        // If returning from an idle state, record the duration
        if (isIdleRef.current) {
            const idleDuration = Date.now() - idleStartTimeRef.current;
            sendIdleData(idleDuration);
            isIdleRef.current = false;
        }

        timerRef.current = setTimeout(onIdle, IDLE_TIMEOUT);
    }, [sendIdleData]);
    
    useEffect(() => {
        if (!isActive) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }

        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
        
        resetTimer(); // Start the timer when the session becomes active

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup function
        return () => {
            clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [isActive, resetTimer]);
};