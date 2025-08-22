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
    faChartBar
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api.js';

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
    }, [selectedMetric, sortOrder, resultLimit, minSessions]);

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
                    minSessions: minSessions
                }
            });
            setFilteredStudents(response.data.results);
        } catch (error) {
            console.error('Failed to fetch filtered students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format) => {
        setExportLoading(true);
        try {
            const response = await api.get('/admin/students/export', {
                params: { format },
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

            {/* Metrics Summary Cards */}
            {metricsSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-sm text-gray-400 mb-2">Avg Typing Speed</h3>
                        <p className="text-2xl font-bold text-cyan-400">
                            {metricsSummary.metrics.typingSpeed.avg} WPM
                        </p>
                        <p className="text-xs text-gray-500">
                            Range: {metricsSummary.metrics.typingSpeed.min} - {metricsSummary.metrics.typingSpeed.max}
                        </p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-sm text-gray-400 mb-2">Avg Error Rate</h3>
                        <p className="text-2xl font-bold text-red-400">
                            {metricsSummary.metrics.errorRate.avg}
                        </p>
                        <p className="text-xs text-gray-500">
                            Range: {metricsSummary.metrics.errorRate.min} - {metricsSummary.metrics.errorRate.max}
                        </p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-sm text-gray-400 mb-2">Avg Focus Score</h3>
                        <p className="text-2xl font-bold text-purple-400">
                            {metricsSummary.metrics.focusScore.avg}%
                        </p>
                        <p className="text-xs text-gray-500">
                            Range: {metricsSummary.metrics.focusScore.min} - {metricsSummary.metrics.focusScore.max}
                        </p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-sm text-gray-400 mb-2">Total Students</h3>
                        <p className="text-2xl font-bold text-green-400">
                            {metricsSummary.totalStudents}
                        </p>
                        <p className="text-xs text-gray-500">
                            {metricsSummary.totalSessions} sessions
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faFilter} />
                    Performance Filters
                </h3>
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
