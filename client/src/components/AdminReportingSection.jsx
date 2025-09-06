// client/src/components/AdminReportingSection.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faDownload, 
    faFilter, 
    faSpinner, 
    faTrophy, 
    faKeyboard, 
    faExclamationTriangle,
    faEye,
    faClock,
    faChartBar,
    faChartLine,
    faChartPie,
    faUsers,
    faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import api from '../services/api.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const AdminReportingSection = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [metricsSummary, setMetricsSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    
    // Filter states
    const [selectedMetric, setSelectedMetric] = useState('netScore');
    const [sortOrder, setSortOrder] = useState('desc');
    const [resultLimit, setResultLimit] = useState(10);
    const [minSessions, setMinSessions] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [chartData, setChartData] = useState({
        performanceDistribution: null,
        metricComparison: null,
        sessionActivity: null,
        skillBreakdown: null
    });

    const metricOptions = [
        { value: 'netScore', label: 'Overall NET Score', icon: faTrophy },
        { value: 'typingSpeed', label: 'Typing Speed (WPM)', icon: faKeyboard },
        { value: 'errorRate', label: 'Error Rate (Lower is Better)', icon: faExclamationTriangle },
        { value: 'focusScore', label: 'Focus Score', icon: faEye },
        { value: 'keystrokeEfficiency', label: 'Keystroke Efficiency', icon: faKeyboard },
        { value: 'completionTime', label: 'Average Completion Time', icon: faClock }
    ];

    useEffect(() => {
        fetchMetricsSummary();
        fetchFilteredStudents();
    }, []);

    useEffect(() => {
        fetchFilteredStudents();
    }, [selectedMetric, sortOrder, resultLimit, minSessions, searchQuery]);

    useEffect(() => {
        if (filteredStudents.length > 0) {
            generateChartData();
        }
    }, [filteredStudents]);

    const fetchMetricsSummary = async () => {
        try {
            const response = await api.get('/admin/metrics/summary');
            setMetricsSummary(response.data);
        } catch (error) {
            console.error('Failed to fetch metrics summary:', error);
        }
    };

    const fetchFilteredStudents = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/students/filter', {
                params: {
                    metric: selectedMetric,
                    order: sortOrder,
                    limit: resultLimit,
                    minSessions: minSessions,
                    search: searchQuery
                }
            });
            setFilteredStudents(response.data.results);
        } catch (error) {
            console.error('Failed to fetch filtered students:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateChartData = () => {
        if (!filteredStudents.length) return;

        // Performance Distribution Chart
        const scoreRanges = ['0-20', '21-40', '41-60', '61-80', '81-100'];
        const distribution = scoreRanges.map(range => {
            const [min, max] = range.split('-').map(Number);
            return filteredStudents.filter(student => 
                student.netScore >= min && student.netScore <= max
            ).length;
        });

        const performanceDistribution = {
            labels: scoreRanges,
            datasets: [{
                label: 'Number of Students',
                data: distribution,
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',   // red
                    'rgba(245, 158, 11, 0.8)',  // amber
                    'rgba(59, 130, 246, 0.8)',  // blue
                    'rgba(16, 185, 129, 0.8)',  // emerald
                    'rgba(34, 197, 94, 0.8)'    // green
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(34, 197, 94, 1)'
                ],
                borderWidth: 2
            }]
        };

        // Metric Comparison Chart
        const topStudents = filteredStudents.slice(0, 10);
        const metricComparison = {
            labels: topStudents.map(s => s.username),
            datasets: [{
                label: 'NET Score',
                data: topStudents.map(s => s.netScore),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 2
            }, {
                label: 'Metric Value',
                data: topStudents.map(s => s.metricValue),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2
            }]
        };

        // Session Activity Chart
        const sessionCounts = {};
        filteredStudents.forEach(student => {
            const count = student.sessionCount;
            sessionCounts[count] = (sessionCounts[count] || 0) + 1;
        });

        const sessionActivity = {
            labels: Object.keys(sessionCounts).sort((a, b) => Number(a) - Number(b)),
            datasets: [{
                label: 'Students',
                data: Object.keys(sessionCounts).sort((a, b) => Number(a) - Number(b)).map(key => sessionCounts[key]),
                fill: true,
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                borderColor: 'rgba(168, 85, 247, 1)',
                borderWidth: 3,
                pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        };

        // Skill Breakdown (Performance Levels)
        const excellent = filteredStudents.filter(s => s.netScore >= 80).length;
        const good = filteredStudents.filter(s => s.netScore >= 60 && s.netScore < 80).length;
        const average = filteredStudents.filter(s => s.netScore >= 40 && s.netScore < 60).length;
        const needsImprovement = filteredStudents.filter(s => s.netScore < 40).length;

        const skillBreakdown = {
            labels: ['Excellent (80+)', 'Good (60-79)', 'Average (40-59)', 'Needs Improvement (<40)'],
            datasets: [{
                data: [excellent, good, average, needsImprovement],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',   // green
                    'rgba(59, 130, 246, 0.8)',  // blue
                    'rgba(245, 158, 11, 0.8)',  // amber
                    'rgba(239, 68, 68, 0.8)'    // red
                ],
                borderColor: [
                    'rgba(34, 197, 94, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        };

        setChartData({
            performanceDistribution,
            metricComparison,
            sessionActivity,
            skillBreakdown
        });
    };

    const handleExport = async (format) => {
        setExportLoading(true);
        try {
            const response = await api.get('/admin/students/export', {
                params: { 
                    format,
                    metric: selectedMetric,
                    order: sortOrder,
                    limit: resultLimit,
                    minSessions: minSessions,
                    search: searchQuery
                },
                responseType: format === 'csv' ? 'blob' : 'json'
            });

            if (format === 'csv') {
                // Handle CSV download
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'student_data.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                // Handle JSON download
                const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
                    type: 'application/json' 
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'student_data.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Failed to export data:', error);
        } finally {
            setExportLoading(false);
        }
    };

    const getMetricIcon = (metric) => {
        const option = metricOptions.find(opt => opt.value === metric);
        return option ? option.icon : faChartBar;
    };

    const formatMetricValue = (value, metric) => {
        if (metric === 'typingSpeed') return `${value} WPM`;
        if (metric === 'errorRate') return `${value} errors`;
        if (metric === 'completionTime') return `${value}s`;
        if (metric === 'focusScore' || metric === 'keystrokeEfficiency') return `${value}%`;
        return value;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Student Performance Reports</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleExport('json')}
                        disabled={exportLoading}
                        className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <FontAwesomeIcon icon={exportLoading ? faSpinner : faDownload} 
                            className={exportLoading ? 'animate-spin' : ''} />
                        Export JSON
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={exportLoading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <FontAwesomeIcon icon={exportLoading ? faSpinner : faDownload} 
                            className={exportLoading ? 'animate-spin' : ''} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Metrics Summary */}
            {metricsSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Students</p>
                                <p className="text-3xl font-bold text-white">{metricsSummary.totalStudents}</p>
                            </div>
                            <FontAwesomeIcon icon={faUsers} className="text-cyan-400 text-2xl" />
                        </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Avg NET Score</p>
                                <p className="text-3xl font-bold text-green-400">{metricsSummary.averageNetScore}</p>
                            </div>
                            <FontAwesomeIcon icon={faTrophy} className="text-green-400 text-2xl" />
                        </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Total Sessions</p>
                                <p className="text-3xl font-bold text-blue-400">{metricsSummary.totalSessions}</p>
                            </div>
                            <FontAwesomeIcon icon={faKeyboard} className="text-blue-400 text-2xl" />
                        </div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm">Active This Week</p>
                                <p className="text-3xl font-bold text-purple-400">{metricsSummary.activeThisWeek}</p>
                            </div>
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-purple-400 text-2xl" />
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Analytics Charts */}
            {chartData.performanceDistribution && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Performance Distribution Chart */}
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartBar} />
                            Performance Distribution
                        </h3>
                        <div className="h-80">
                            <Bar 
                                data={chartData.performanceDistribution}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            labels: { color: '#e5e7eb' }
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => `${context.parsed.y} students`
                                            }
                                        }
                                    },
                                    scales: {
                                        x: { 
                                            ticks: { color: '#9ca3af' },
                                            grid: { color: '#374151' }
                                        },
                                        y: { 
                                            ticks: { color: '#9ca3af' },
                                            grid: { color: '#374151' }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4 text-sm text-gray-400">
                            Distribution of NET scores across all filtered students
                        </div>
                    </div>

                    {/* Skill Level Breakdown */}
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartPie} />
                            Skill Level Breakdown
                        </h3>
                        <div className="h-80">
                            <Doughnut 
                                data={chartData.skillBreakdown}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                            labels: { 
                                                color: '#e5e7eb',
                                                padding: 20
                                            }
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => {
                                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                                    return `${context.label}: ${context.parsed} students (${percentage}%)`;
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4 text-sm text-gray-400">
                            Performance categories based on NET scores
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Analytics */}
            {chartData.metricComparison && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Performers Comparison */}
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartBar} />
                            Top 10 Performers - Metric Comparison
                        </h3>
                        <div className="h-80">
                            <Bar 
                                data={chartData.metricComparison}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            labels: { color: '#e5e7eb' }
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => {
                                                    const metric = context.datasetIndex === 0 ? 'NET Score' : 
                                                        metricOptions.find(opt => opt.value === selectedMetric)?.label || 'Metric';
                                                    return `${metric}: ${formatMetricValue(context.parsed.y, selectedMetric)}`;
                                                }
                                            }
                                        }
                                    },
                                    scales: {
                                        x: { 
                                            ticks: { 
                                                color: '#9ca3af',
                                                maxRotation: 45
                                            },
                                            grid: { color: '#374151' }
                                        },
                                        y: { 
                                            ticks: { color: '#9ca3af' },
                                            grid: { color: '#374151' }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4 text-sm text-gray-400">
                            Comparing NET scores with selected metric for top performers
                        </div>
                    </div>

                    {/* Session Activity Distribution */}
                    <div className="bg-gray-800 p-6 rounded-xl">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FontAwesomeIcon icon={faChartLine} />
                            Session Activity Distribution
                        </h3>
                        <div className="h-80">
                            <Line 
                                data={chartData.sessionActivity}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            labels: { color: '#e5e7eb' }
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => `${context.parsed.y} students with ${context.label} sessions`
                                            }
                                        }
                                    },
                                    scales: {
                                        x: { 
                                            title: {
                                                display: true,
                                                text: 'Number of Sessions',
                                                color: '#9ca3af'
                                            },
                                            ticks: { color: '#9ca3af' },
                                            grid: { color: '#374151' }
                                        },
                                        y: { 
                                            title: {
                                                display: true,
                                                text: 'Number of Students',
                                                color: '#9ca3af'
                                            },
                                            ticks: { color: '#9ca3af' },
                                            grid: { color: '#374151' }
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4 text-sm text-gray-400">
                            How many students have completed each number of sessions
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilter} />
                    Performance Filters
                </h3>
                
                {/* Search Bar */}
                <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">Search Students</label>
                    <input
                        type="text"
                        placeholder="Search by name, email, or metric value..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Metric</label>
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                            {metricOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Sort Order</label>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="desc">Highest to Lowest</option>
                            <option value="asc">Lowest to Highest</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Results Limit</label>
                        <select
                            value={resultLimit}
                            onChange={(e) => setResultLimit(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        >
                            <option value="5">Top 5</option>
                            <option value="10">Top 10</option>
                            <option value="20">Top 20</option>
                            <option value="50">Top 50</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Min Sessions</label>
                        <input
                            type="number"
                            min="1"
                            value={minSessions}
                            onChange={(e) => setMinSessions(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                        <FontAwesomeIcon icon={getMetricIcon(selectedMetric)} />
                        {metricOptions.find(opt => opt.value === selectedMetric)?.label} Rankings
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Showing {sortOrder === 'desc' ? 'top' : 'bottom'} {resultLimit} performers
                    </p>
                </div>
                
                {loading ? (
                    <div className="p-8 text-center">
                        <FontAwesomeIcon icon={faSpinner} className="text-3xl text-cyan-400 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="text-left p-4">Rank</th>
                                    <th className="text-left p-4">Student</th>
                                    <th className="text-left p-4">Email</th>
                                    <th className="text-left p-4">Metric Value</th>
                                    <th className="text-left p-4">NET Score</th>
                                    <th className="text-left p-4">Sessions</th>
                                    <th className="text-left p-4">Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student, index) => (
                                    <tr key={student.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {index < 3 && (
                                                    <FontAwesomeIcon 
                                                        icon={faTrophy} 
                                                        className={`${
                                                            index === 0 ? 'text-yellow-400' :
                                                            index === 1 ? 'text-gray-300' :
                                                            'text-amber-600'
                                                        }`}
                                                    />
                                                )}
                                                <span className="font-bold">#{index + 1}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-semibold">{student.username}</td>
                                        <td className="p-4 text-gray-400">{student.email}</td>
                                        <td className="p-4">
                                            <span className="font-mono text-cyan-400 font-bold">
                                                {formatMetricValue(student.metricValue, selectedMetric)}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono">{student.netScore}</td>
                                        <td className="p-4">{student.sessionCount}</td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {new Date(student.lastActive).toLocaleDateString()}
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

export default AdminReportingSection;
