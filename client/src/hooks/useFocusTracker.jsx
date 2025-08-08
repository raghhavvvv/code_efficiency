import { useRef, useCallback, useEffect } from 'react';
import api from '../services/api';

export const useFocusTracker = (sessionId, isActive) => {
    const focusStartTime = useRef(null);
    const contextSwitches = useRef(0);

    const recordFocusPeriod = useCallback(async (isBlur = false) => {
        if (!isActive || !sessionId || !focusStartTime.current) return;
        
        const duration = Date.now() - focusStartTime.current;
        contextSwitches.current++;
        
        try {
            await api.post('/api/focus-data', {
                sessionId,
                duration,
                contextSwitches: contextSwitches.current
            });
        } catch (error) { console.error("Failed to send focus data", error); }
        
        focusStartTime.current = isBlur ? null : Date.now();
    }, [isActive, sessionId]);
    
    const handleFocus = useCallback(() => {
        if (isActive && sessionId) focusStartTime.current = Date.now();
    }, [isActive, sessionId]);

    const handleBlur = useCallback(() => recordFocusPeriod(true), [recordFocusPeriod]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                recordFocusPeriod(true);
            } else {
                handleFocus();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [handleFocus, recordFocusPeriod]);

    return { handleFocus, handleBlur };
};