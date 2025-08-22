// client/src/pages/CodingSessionPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSpinner, 
    faPlay, 
    faStop, 
    faClock, 
    faCode,
    faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

const CodingSessionPage = () => {
    const { challengeId } = useParams();
    const navigate = useNavigate();
    
    const [challenge, setChallenge] = useState(null);
    const [code, setCode] = useState('');
    const [sessionStarted, setSessionStarted] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const response = await api.get(`/api/challenges/${challengeId}`);
                setChallenge(response.data);
            } catch (error) {
                console.error("Failed to load challenge", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [challengeId]);

    useEffect(() => {
        let interval;
        if (sessionStarted && startTime) {
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [sessionStarted, startTime]);

    const startSession = async () => {
        try {
            const response = await api.post('/api/sessions/start', {
                challengeId: parseInt(challengeId)
            });
            setSessionId(response.data.sessionId);
            setSessionStarted(true);
            setStartTime(Date.now());
        } catch (error) {
            console.error("Failed to start session", error);
        }
    };

    const submitCode = async () => {
        if (!sessionId) return;
        
        try {
            await api.post(`/api/sessions/${sessionId}/submit`, {
                code: code
            });
            
            setSessionStarted(false);
            navigate('/stats');
        } catch (error) {
            console.error("Failed to submit code", error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="bg-gray-900 min-h-screen text-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <FontAwesomeIcon icon={faSpinner} className="text-5xl text-cyan-400 animate-spin" />
                </div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div className="bg-gray-900 min-h-screen text-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Challenge not found</h2>
                        <button
                            onClick={() => navigate('/challenges')}
                            className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg"
                        >
                            Back to Challenges
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col">
            <Navbar />
            <main className="container mx-auto p-4 flex-grow">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/challenges')}
                            className="text-gray-400 hover:text-white"
                        >
                            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold">{challenge.title}</h1>
                            <div className="flex items-center gap-4 mt-2">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                    challenge.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                    challenge.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                }`}>
                                    {challenge.difficulty}
                                </span>
                                <span className="text-gray-400 text-sm">
                                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                                    Expected: {challenge.expectedCompletionTime}s
                                </span>
                                <span className="text-gray-400 text-sm">
                                    <FontAwesomeIcon icon={faCode} className="mr-1" />
                                    {challenge.language}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {sessionStarted && (
                        <div className="text-right">
                            <div className="text-2xl font-mono text-cyan-400">
                                {formatTime(elapsedTime)}
                            </div>
                            <div className="text-sm text-gray-400">Elapsed Time</div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Challenge Description */}
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-4">Challenge Description</h2>
                        <p className="text-gray-300 mb-6">{challenge.description}</p>
                        
                        {!sessionStarted ? (
                            <button
                                onClick={startSession}
                                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faPlay} />
                                Start Coding Session
                            </button>
                        ) : (
                            <button
                                onClick={submitCode}
                                className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                            >
                                <FontAwesomeIcon icon={faStop} />
                                Submit Solution
                            </button>
                        )}
                    </div>

                    {/* Code Editor */}
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-4">Your Solution</h2>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={`Write your ${challenge.language} solution here...`}
                            className="w-full h-96 bg-gray-900 text-white p-4 rounded-lg font-mono text-sm border border-gray-700 focus:border-cyan-400 focus:outline-none resize-none"
                            disabled={!sessionStarted}
                        />
                        
                        {!sessionStarted && (
                            <p className="text-gray-500 text-sm mt-2">
                                Start the session to begin coding
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CodingSessionPage;
