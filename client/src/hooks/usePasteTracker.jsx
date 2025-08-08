// client/src/hooks/usePasteTracker.jsx
import { useCallback } from 'react';
import api from '../services/api.js';

// This hook is now simple and correct. It just calls the function it receives.
export const usePasteTracker = (sessionId, isActive, onPasteDetected) => {
    const handlePaste = useCallback(async (pastedText) => {
        if (!isActive || !sessionId) return;
        
        if (typeof pastedText !== 'string' || pastedText.length === 0) return;
        
        // Call the handler function received from props
        if (onPasteDetected) {
            onPasteDetected(pastedText.length);
        }
        
        try {
            await api.post('/api/paste-event', {
                sessionId,
                pasteLength: pastedText.length,
                pasteContent: pastedText.substring(0, 500),
            });
        } catch (error) {
            console.error("Failed to send paste event data:", error);
        }

    }, [isActive, sessionId, onPasteDetected]); // Dependency on onPasteDetected is key
    
    return { handlePaste };
};