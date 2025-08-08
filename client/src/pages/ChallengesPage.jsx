// client/src/pages/ChallengesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const DifficultyBadge = ({ difficulty }) => {
    const styles = {
        Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
        Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[difficulty] || ''}`}>
            {difficulty}
        </span>
    );
};

const ChallengesPage = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            try {
                const { data } = await api.get('/api/challenges');
                setChallenges(data);
            } catch (error) {
                console.error("Failed to load challenges", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenges();
    }, []);

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

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col">
            <Navbar />
            <main className="container mx-auto p-4 flex-grow">
                <h1 className="text-4xl font-bold mb-8">Select a Challenge</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map(challenge => (
                        <Link 
                            to={`/dashboard/${challenge.id}`} 
                            key={challenge.id}
                            className="bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-700/50 hover:border-cyan-400 border border-transparent transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-bold text-white">{challenge.title}</h2>
                                <DifficultyBadge difficulty={challenge.difficulty} />
                            </div>
                            <p className="text-gray-400 text-sm mb-4 h-16 overflow-hidden">
                                {challenge.description}
                            </p>
                            <div className="text-xs text-gray-500 font-mono">
                                Language: {challenge.language}
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ChallengesPage;