// client/src/pages/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import Navbar from '../components/Navbar.jsx';
import api from '../services/api.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faUsers, faCodeBranch } from '@fortawesome/free-solid-svg-icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const AdminDashboardPage = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersResponse, statsResponse] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/stats')
                ]);
                setUsers(usersResponse.data);
                setStats(statsResponse.data);
            } catch (error) {
                console.error("Failed to fetch admin data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
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
    
    const topUsersChartData = {
        labels: stats.topUsers.map(u => u.username),
        datasets: [{
            label: 'NET Score',
            data: stats.topUsers.map(u => u.netScore.toFixed(2)),
            backgroundColor: 'rgba(34, 211, 238, 0.6)',
            borderColor: 'rgba(34, 211, 238, 1)',
            borderWidth: 1,
        }],
    };

    const chartOptions = {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
            y: { ticks: { color: '#e5e7eb' }, grid: { color: '#374151' } },
            x: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } },
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white flex flex-col">
            <Navbar />
            <main className="container mx-auto p-4 flex-grow">
                <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-4">
                        <FontAwesomeIcon icon={faUsers} className="text-4xl text-cyan-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Total Users</p>
                            <p className="text-3xl font-bold">{stats.totalUsers}</p>
                        </div>
                    </div>
                     <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-4">
                        <FontAwesomeIcon icon={faCodeBranch} className="text-4xl text-cyan-400" />
                        <div>
                            <p className="text-gray-400 text-sm">Completed Sessions</p>
                            <p className="text-3xl font-bold">{stats.totalSessions}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Users Table */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">Registered Users</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-700">
                                    <tr>
                                        <th className="p-2">ID</th>
                                        <th className="p-2">Username</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">NET Score</th>
                                        <th className="p-2">Sessions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/50">
                                            <td className="p-2">{user.id}</td>
                                            <td className="p-2 font-semibold">{user.username}</td>
                                            <td className="p-2 text-gray-400">{user.email}</td>
                                            <td className="p-2 text-cyan-400 font-mono">{user.netScore.toFixed(2)}</td>
                                            <td className="p-2">{user._count.sessions}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                     {/* Top Users Chart */}
                    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4">Top 5 Users by NET Score</h2>
                        <Bar options={chartOptions} data={topUsersChartData} />
                    </div>
                </div>

            </main>
        </div>
    );
};

export default AdminDashboardPage;