// client/src/components/AdminChallengeSection.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUpload, 
    faPlus, 
    faEdit, 
    faTrash, 
    faSpinner,
    faCode,
    faFileCode,
    faSave,
    faTimes,
    faCheck
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api.js';

const AdminChallengeSection = () => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState(null);
    
    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Easy',
        language: 'JavaScript',
        starterCode: '',
        testCases: '',
        expectedOutput: '',
        timeLimit: 30
    });

    const difficultyOptions = ['Easy', 'Medium', 'Hard'];
    const languageOptions = ['JavaScript', 'Python', 'Java', 'C++', 'Go'];

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/challenges');
            console.log('Fetched challenges:', response.data);
            setChallenges(response.data);
        } catch (error) {
            console.error('Failed to fetch challenges:', error);
            console.error('Error details:', error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploadLoading(true);
        
        try {
            if (editingChallenge) {
                await api.put(`/admin/challenges/${editingChallenge.id}`, formData);
            } else {
                await api.post('/admin/challenges', formData);
            }
            
            await fetchChallenges();
            resetForm();
        } catch (error) {
            console.error('Failed to save challenge:', error);
        } finally {
            setUploadLoading(false);
        }
    };

    const handleEdit = (challenge) => {
        setEditingChallenge(challenge);
        setFormData({
            title: challenge.title,
            description: challenge.description,
            difficulty: challenge.difficulty,
            language: challenge.language,
            starterCode: challenge.starterCode || '',
            testCases: challenge.testCases || '',
            expectedOutput: challenge.expectedOutput || '',
            timeLimit: challenge.timeLimit || 30
        });
        setShowUploadForm(true);
    };

    const handleDelete = async (challengeId) => {
        if (!window.confirm('Are you sure you want to delete this challenge?')) {
            return;
        }
        
        try {
            await api.delete(`/admin/challenges/${challengeId}`);
            await fetchChallenges();
        } catch (error) {
            console.error('Failed to delete challenge:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            difficulty: 'Easy',
            language: 'JavaScript',
            starterCode: '',
            testCases: '',
            expectedOutput: '',
            timeLimit: 30
        });
        setShowUploadForm(false);
        setEditingChallenge(null);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const challengeData = JSON.parse(event.target.result);
                setFormData({
                    title: challengeData.title || '',
                    description: challengeData.description || '',
                    difficulty: challengeData.difficulty || 'Easy',
                    language: challengeData.language || 'JavaScript',
                    starterCode: challengeData.starterCode || '',
                    testCases: challengeData.testCases || '',
                    expectedOutput: challengeData.expectedOutput || '',
                    timeLimit: challengeData.timeLimit || 30
                });
            } catch (error) {
                console.error('Invalid JSON file:', error);
                alert('Please upload a valid JSON file with challenge data.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Challenge Management</h2>
                <div className="flex gap-3">
                    <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                        <FontAwesomeIcon icon={faUpload} />
                        Upload JSON
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={() => setShowUploadForm(true)}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        New Challenge
                    </button>
                </div>
            </div>

            {/* Upload/Edit Form */}
            {showUploadForm && (
                <div className="bg-gray-800 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">
                            {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
                        </h3>
                        <button
                            onClick={resetForm}
                            className="text-gray-400 hover:text-white"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Time Limit (minutes)</label>
                                <input
                                    type="number"
                                    name="timeLimit"
                                    value={formData.timeLimit}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="180"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                >
                                    {difficultyOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Language</label>
                                <select
                                    name="language"
                                    value={formData.language}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                                >
                                    {languageOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows="4"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Starter Code</label>
                            <textarea
                                name="starterCode"
                                value={formData.starterCode}
                                onChange={handleInputChange}
                                rows="6"
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm"
                                placeholder="// Starter code for the challenge..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Test Cases</label>
                                <textarea
                                    name="testCases"
                                    value={formData.testCases}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm"
                                    placeholder="Test cases or input examples..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Expected Output</label>
                                <textarea
                                    name="expectedOutput"
                                    value={formData.expectedOutput}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm"
                                    placeholder="Expected output or solution..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={uploadLoading}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <FontAwesomeIcon icon={uploadLoading ? faSpinner : faSave} 
                                    className={uploadLoading ? 'animate-spin' : ''} />
                                {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Challenges List */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <FontAwesomeIcon icon={faCode} />
                        Existing Challenges ({challenges.length})
                    </h3>
                </div>
                
                {loading ? (
                    <div className="p-8 text-center">
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl text-cyan-400" />
                        <p className="mt-2 text-gray-400">Loading challenges...</p>
                    </div>
                ) : challenges.length === 0 ? (
                    <div className="p-8 text-center">
                        <FontAwesomeIcon icon={faFileCode} className="text-4xl text-gray-600 mb-4" />
                        <p className="text-gray-400">No challenges found. Create your first challenge!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Challenge
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Difficulty
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Language
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Time Limit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {challenges.map((challenge) => (
                                    <tr key={challenge.id} className="hover:bg-gray-700">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-white">
                                                    {challenge.title}
                                                </div>
                                                <div className="text-sm text-gray-400 truncate max-w-xs">
                                                    {challenge.description}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                challenge.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                                challenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {challenge.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {challenge.language}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {challenge.timeLimit || 30} min
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(challenge)}
                                                    className="text-blue-400 hover:text-blue-300"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(challenge.id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChallengeSection;
