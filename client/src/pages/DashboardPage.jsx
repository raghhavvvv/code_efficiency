// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import ToastNotification from '../components/ToastNotification.jsx';
import api from '../services/api.js';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faSpinner, faCogs, faStop, faCheckCircle, faClock, faKeyboard } from '@fortawesome/free-solid-svg-icons';
import { useKeystrokeTracker } from '../hooks/useKeystrokeTracker.jsx';
import { useFocusTracker } from '../hooks/useFocusTracker.jsx';
import { useIdleTimer } from '../hooks/useIdleTimer.jsx';
import { usePasteTracker } from '../hooks/usePasteTracker.jsx';

// --- Constants and Helper Functions ---
const PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";
const LANGUAGES = [
    { name: 'JavaScript', value: 'javascript', version: '18.15.0' },
    { name: 'Python', value: 'python', version: '3.10.0' },
    { name: 'Java', value: 'java', version: '15.0.2' },
    { name: 'C++', value: 'cpp', version: '10.2.0' },
    { name: 'Go', value: 'go', version: '1.16.2' },
];

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

// --- Component ---
const DashboardPage = () => {
    // Session State
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [sessionResult, setSessionResult] = useState(null);
    const [challenge, setChallenge] = useState(null);

    // IDE State
    const [code, setCode] = useState('// Start a session and begin coding!');
    const [output, setOutput] = useState({ text: 'Output will appear here.', type: 'info' });
    const [language, setLanguage] = useState(LANGUAGES[0].value);
    const [isRunning, setIsRunning] = useState(false);
    
    // Live Stats State
    const [elapsedTime, setElapsedTime] = useState(0);
    const [toast, setToast] = useState({ show: false, message: '' });

    // --- Hooks for Data Collection ---
    const handlePasteDetected = (pasteLength) => {
        setToast({
            show: true,
            message: `Paste detected: ${pasteLength} characters were pasted.`,
        });
    };

    const { handleKeyDown, sendKeystrokeData, keyCount, resetKeyCount } = useKeystrokeTracker(sessionId, isSessionActive);
    const { handleFocus, handleBlur } = useFocusTracker(sessionId, isSessionActive);
    const { handlePaste } = usePasteTracker(sessionId, isSessionActive, handlePasteDetected);
    useIdleTimer(sessionId, isSessionActive);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isSessionActive) {
            interval = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isSessionActive]);

    const startSession = async () => {
        try {
            const { data } = await api.post('/api/coding-session/start', { challengeId: 1 });
            setSessionId(data.sessionId);
            setSessionResult(null);
            setOutput({ text: "Click 'Run Code' to see the output.", type: 'info' });
            setCode('');
            resetKeyCount();
            setElapsedTime(0);
            setIsSessionActive(true);
        } catch (error) { console.error("Failed to start session", error); }
    };

    const endSession = async () => {
        if (!sessionId) return;
        setIsSessionActive(false);
        try {
            sendKeystrokeData();
            const { data } = await api.post(`/api/coding-session/${sessionId}/end`, { codeSubmitted: code });
            setSessionResult(data);
            setSessionId(null);
            setCode('// Session ended. Start a new one to continue.');
        } catch (error) { console.error("Failed to end session", error); }
    };
    
    const runCode = async () => {
        setIsRunning(true);
        setOutput({ text: 'Executing code...', type: 'info' });
        const selectedLanguage = LANGUAGES.find(l => l.value === language);
        try {
            const response = await axios.post(PISTON_API_URL, {
                language: selectedLanguage.value,
                version: selectedLanguage.version,
                files: [{ content: code }]
            });
            if(response.data.run.stderr) {
                setOutput({ text: response.data.run.stderr, type: 'error' });
            } else {
                setOutput({ text: response.data.run.stdout || "Code executed successfully with no output.", type: 'success' });
            }
        } catch (error) {
            setOutput({ text: "An error occurred while communicating with the execution engine.", type: 'error' });
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col">
            <Navbar />

            {toast.show && (
                <ToastNotification
                    message={toast.message}
                    onClose={() => setToast({ show: false, message: '' })}
                />
            )}

            <div className="flex-grow container mx-auto p-4 flex flex-col gap-4">
                
                {/* Top Control Panel */}
                <div className="bg-gray-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Your Dashboard</h1>
                        <p className="text-gray-400 text-sm">{isSessionActive ? "Coding session in progress..." : "Start a session to begin a challenge."}</p>
                    </div>

                    {isSessionActive && (
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <div className="text-xs text-gray-400">TIME</div>
                                <div className="text-2xl font-mono font-bold text-cyan-400 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faClock} />
                                    {formatTime(elapsedTime)}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs text-gray-400">KEYSTROKES</div>
                                <div className="text-2xl font-mono font-bold text-cyan-400 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faKeyboard} />
                                    {keyCount}
                                </div>
                            </div>
                        </div>
                    )}

                     {!isSessionActive ? (
                        <button onClick={startSession} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">
                            <FontAwesomeIcon icon={faPlay} /> Start New Session
                        </button>
                    ) : (
                        <button onClick={endSession} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105">
                           <FontAwesomeIcon icon={faStop} /> End & Submit Session
                        </button>
                    )}
                </div>

                {/* Main IDE Area */}
                <div className="flex-grow bg-gray-800 p-4 rounded-xl shadow-lg flex flex-col">
                    <div className="flex items-center justify-end mb-2 p-2 bg-gray-900/50 rounded-t-lg border-b border-gray-700">
                         <div className="flex items-center space-x-4">
                             <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-gray-700 border border-gray-600 text-white px-3 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm" disabled={!isSessionActive}>
                                {LANGUAGES.map(lang => <option key={lang.value} value={lang.value}>{lang.name}</option>)}
                            </select>
                            <button onClick={runCode} disabled={!isSessionActive || isRunning} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
                                {isRunning ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faCogs} />}
                                <span>Run Code</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[55vh]">
                        <div className="bg-gray-900 rounded-b-lg overflow-hidden border border-gray-700">
                             <CodeEditor 
                                language={language} 
                                code={code} 
                                setCode={setCode} 
                                isSessionActive={isSessionActive} 
                                onKeyDown={handleKeyDown} 
                                onFocus={handleFocus} 
                                onBlur={handleBlur}
                                onPaste={handlePaste}
                            />
                        </div>
                        <div className="bg-gray-900 rounded-lg border border-gray-700 flex flex-col">
                            <div className="text-sm font-semibold p-2.5 bg-gray-900/50 rounded-t-lg border-b border-gray-700">Output</div>
                            <pre className={`w-full flex-grow p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap ${
                                output.type === 'error' ? 'text-red-400' : 'text-gray-300'
                            }`}>{output.text}</pre>
                        </div>
                    </div>
                </div>

                {sessionResult && (
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg mt-4 flex items-center gap-4 border border-green-500/50">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-4xl text-green-400" />
                        <div>
                            <h2 className="text-2xl font-bold">Session Complete!</h2>
                            <p className="text-lg mt-1">Your NET Score: <span className="font-bold text-cyan-400 text-2xl">{sessionResult.netScore.toFixed(2)}</span></p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;