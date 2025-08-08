// src/pages/StatsPage.jsx
import React, { useState, useEffect } from 'react';
import { Line, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale, Filler } from 'chart.js';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// Register all the necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale, Filler);

const StatsPage = () => {
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/api/user/stats');
                setStatsData(data);
            } catch (err) {
                setError('Failed to load statistics. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
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
    
    if (error) {
         return (
            <div className="bg-gray-900 min-h-screen text-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">An Error Occurred</h2>
                    <p className="text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!statsData || statsData.length === 0) {
        return (
             <div className="bg-gray-900 min-h-screen text-white flex flex-col">
                <Navbar />
                <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
                    <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
                    <p className="text-gray-400">Complete a few coding sessions to see your stats here.</p>
                </div>
            </div>
        )
    }

    // Prepare data for charts
    const trendLabels = statsData.map(s => new Date(s.endTime).toLocaleDateString());
    const trendData = {
        labels: trendLabels,
        datasets: [{
            label: 'NET Score',
            data: statsData.map(s => s.netScore.toFixed(2)),
            borderColor: '#22d3ee',
            backgroundColor: 'rgba(34, 211, 238, 0.2)',
            fill: true,
            tension: 0.3,
        }],
    };

    const calculateAverages = () => {
        const total = statsData.length;
        const sums = statsData.reduce((acc, session) => {
            acc.keystroke += session.keystrokeScore;
            acc.focus += session.focusScore;
            acc.error += session.errorScore;
            acc.task += session.taskScore;
            return acc;
        }, { keystroke: 0, focus: 0, error: 0, task: 0 });

        return [
            (sums.keystroke / total),
            (sums.focus / total),
            (sums.error / total),
            (sums.task / total),
        ];
    };

    const averageData = {
        labels: ['Keystroke Efficiency', 'Focus', 'Error Handling', 'Task Completion'],
        datasets: [{
            label: 'Average Skill Score',
            data: calculateAverages(),
            backgroundColor: 'rgba(34, 211, 238, 0.2)',
            borderColor: '#22d3ee',
            pointBackgroundColor: '#22d3ee',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#22d3ee',
        }],
    };
    
    const chartOptions = {
        plugins: { legend: { labels: { color: '#e5e7eb' } } },
        scales: {
            y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
            x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
            r: { // For Radar chart
                angleLines: { color: '#4b5563' },
                grid: { color: '#374151' },
                pointLabels: { color: '#e5e7eb', font: { size: 14 } },
                ticks: { backdropColor: '#111827', color: '#9ca3af' }
            }
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col">
            <Navbar />
            <main className="container mx-auto p-4 flex-grow">
                <h1 className="text-4xl font-bold mb-8">My Performance Statistics</h1>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Main Chart */}
                    <div className="lg:col-span-3 bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">NET Score Over Time</h2>
                        <Line options={chartOptions} data={trendData} />
                    </div>
                    {/* Radar Chart */}
                    <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-lg">
                         <h2 className="text-2xl font-semibold mb-4">Average Skill Breakdown</h2>
                         <Radar data={averageData} options={chartOptions} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StatsPage;