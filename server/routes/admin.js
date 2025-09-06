// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

const prisma = new PrismaClient();

// This middleware will apply to all routes in this file
// It first verifies the user is logged in, then checks if they are an admin.
router.use(verifyToken, adminMiddleware);


// GET /admin/users - Fetches a list of all users
router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                netScore: true,
                lastActive: true,
                _count: { // Count the number of sessions for each user
                    select: { sessions: true }
                }
            },
            orderBy: {
                id: 'asc'
            }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// GET /admin/stats - Fetches aggregated system stats
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalSessions = await prisma.codingSession.count({
            where: { endTime: { not: null } }
        });

        // Get top 5 users by NET score
        const topUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { netScore: 'desc' },
            select: {
                username: true,
                netScore: true,
            }
        });

        res.status(200).json({
            totalUsers,
            totalSessions,
            topUsers,
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /admin/metrics/summary - Fetches aggregated metrics summary
router.get('/metrics/summary', async (req, res) => {
    try {
        // Get keystroke metrics averages
        const keystrokeStats = await prisma.keystrokeMetrics.aggregate({
            _avg: { typingSpeed: true, efficiencyScore: true },
            _min: { typingSpeed: true },
            _max: { typingSpeed: true }
        });

        // Get error metrics averages
        const errorStats = await prisma.errorMetrics.aggregate({
            _avg: { errorFrequency: true, efficiencyScore: true },
            _min: { errorFrequency: true },
            _max: { errorFrequency: true }
        });

        // Get focus metrics averages
        const focusStats = await prisma.focusMetrics.aggregate({
            _avg: { efficiencyScore: true },
            _min: { efficiencyScore: true },
            _max: { efficiencyScore: true }
        });

        const totalStudents = await prisma.user.count({ where: { role: 'user' } });
        const totalSessions = await prisma.codingSession.count({ where: { endTime: { not: null } } });

        res.status(200).json({
            totalStudents,
            totalSessions,
            metrics: {
                typingSpeed: {
                    avg: Math.round(keystrokeStats._avg.typingSpeed || 0),
                    min: Math.round(keystrokeStats._min.typingSpeed || 0),
                    max: Math.round(keystrokeStats._max.typingSpeed || 0)
                },
                errorRate: {
                    avg: Math.round(errorStats._avg.errorFrequency || 0),
                    min: errorStats._min.errorFrequency || 0,
                    max: errorStats._max.errorFrequency || 0
                },
                focusScore: {
                    avg: Math.round(focusStats._avg.efficiencyScore || 0),
                    min: Math.round(focusStats._min.efficiencyScore || 0),
                    max: Math.round(focusStats._max.efficiencyScore || 0)
                }
            }
        });
    } catch (error) {
        console.error("Error fetching metrics summary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /admin/students/filter - Fetches filtered and sorted student data
router.get('/students/filter', async (req, res) => {
    try {
        const { metric = 'netScore', order = 'desc', limit = 10, minSessions = 1, search = '' } = req.query;
        
        let orderBy = {};
        let include = {
            sessions: {
                include: {
                    keystrokeMetrics: true,
                    errorMetrics: true,
                    focusMetrics: true,
                    taskMetrics: true
                }
            }
        };

        // Base query to get users with minimum sessions
        const users = await prisma.user.findMany({
            where: {
                role: 'user',
                sessions: {
                    some: {
                        endTime: { not: null }
                    }
                }
            },
            include,
            orderBy: { netScore: order }
        });

        // Filter users with minimum sessions and calculate metrics
        const processedUsers = users
            .map(user => {
                const completedSessions = user.sessions.filter(s => s.endTime);
                
                if (completedSessions.length < parseInt(minSessions)) {
                    return null;
                }

                // Calculate aggregated metrics
                const keystrokeMetrics = completedSessions
                    .map(s => s.keystrokeMetrics)
                    .filter(Boolean);
                
                const errorMetrics = completedSessions
                    .map(s => s.errorMetrics)
                    .filter(Boolean);
                
                const focusMetrics = completedSessions
                    .map(s => s.focusMetrics)
                    .filter(Boolean);

                const taskMetrics = completedSessions
                    .map(s => s.taskMetrics)
                    .filter(Boolean);

                let metricValue = user.netScore;

                switch (metric) {
                    case 'typingSpeed':
                        metricValue = keystrokeMetrics.length > 0 
                            ? Math.round(keystrokeMetrics.reduce((sum, m) => sum + m.typingSpeed, 0) / keystrokeMetrics.length)
                            : 0;
                        break;
                    case 'errorRate':
                        metricValue = errorMetrics.length > 0 
                            ? Math.round(errorMetrics.reduce((sum, m) => sum + m.errorFrequency, 0) / errorMetrics.length)
                            : 0;
                        break;
                    case 'focusScore':
                        metricValue = focusMetrics.length > 0 
                            ? Math.round(focusMetrics.reduce((sum, m) => sum + (m.efficiencyScore || 0), 0) / focusMetrics.length)
                            : 0;
                        break;
                    case 'keystrokeEfficiency':
                        metricValue = keystrokeMetrics.length > 0 
                            ? Math.round(keystrokeMetrics.reduce((sum, m) => sum + (m.efficiencyScore || 0), 0) / keystrokeMetrics.length)
                            : 0;
                        break;
                    case 'completionTime':
                        metricValue = taskMetrics.length > 0 
                            ? Math.round(taskMetrics.reduce((sum, m) => sum + (m.completionTime || 0), 0) / taskMetrics.length)
                            : 0;
                        break;
                    default:
                        metricValue = user.netScore;
                }

                return {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    netScore: user.netScore,
                    lastActive: user.lastActive,
                    sessionCount: completedSessions.length,
                    metricValue
                };
            })
            .filter(Boolean)
            .filter(user => {
                // Apply search filter
                if (!search) return true;
                
                const searchLower = search.toLowerCase();
                return (
                    user.username.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    user.metricValue.toString().includes(searchLower) ||
                    user.netScore.toString().includes(searchLower)
                );
            });

        // Sort by the selected metric
        processedUsers.sort((a, b) => {
            if (order === 'desc') {
                return b.metricValue - a.metricValue;
            } else {
                return a.metricValue - b.metricValue;
            }
        });

        // Apply limit
        const limitedResults = processedUsers.slice(0, parseInt(limit));

        res.status(200).json({
            results: limitedResults,
            total: processedUsers.length
        });
    } catch (error) {
        console.error("Error fetching filtered students:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /admin/students/export - Export student data
router.get('/students/export', async (req, res) => {
    try {
        const { format = 'json' } = req.query;
        
        const users = await prisma.user.findMany({
            where: { role: 'user' },
            include: {
                sessions: {
                    include: {
                        keystrokeMetrics: true,
                        errorMetrics: true,
                        focusMetrics: true,
                        taskMetrics: true,
                        idleMetrics: true
                    }
                }
            }
        });

        const exportData = users.map(user => {
            const completedSessions = user.sessions.filter(s => s.endTime);
            
            // Calculate aggregated metrics
            const keystrokeMetrics = completedSessions.map(s => s.keystrokeMetrics).filter(Boolean);
            const errorMetrics = completedSessions.map(s => s.errorMetrics).filter(Boolean);
            const focusMetrics = completedSessions.map(s => s.focusMetrics).filter(Boolean);
            
            return {
                username: user.username,
                email: user.email,
                netScore: user.netScore,
                lastActive: user.lastActive,
                totalSessions: completedSessions.length,
                avgTypingSpeed: keystrokeMetrics.length > 0 
                    ? Math.round(keystrokeMetrics.reduce((sum, m) => sum + m.typingSpeed, 0) / keystrokeMetrics.length)
                    : 0,
                avgErrorRate: errorMetrics.length > 0 
                    ? Math.round(errorMetrics.reduce((sum, m) => sum + m.errorFrequency, 0) / errorMetrics.length)
                    : 0,
                avgFocusScore: focusMetrics.length > 0 
                    ? Math.round(focusMetrics.reduce((sum, m) => sum + (m.efficiencyScore || 0), 0) / focusMetrics.length)
                    : 0
            };
        });

        if (format === 'csv') {
            // Convert to CSV
            const headers = Object.keys(exportData[0] || {});
            const csvContent = [
                headers.join(','),
                ...exportData.map(row => 
                    headers.map(header => 
                        typeof row[header] === 'string' ? `"${row[header]}"` : row[header]
                    ).join(',')
                )
            ].join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="student_data.csv"');
            res.send(csvContent);
        } else {
            res.status(200).json(exportData);
        }
    } catch (error) {
        console.error("Error exporting student data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Challenge Management Routes

// GET /admin/challenges - Get all challenges
router.get('/challenges', async (req, res) => {
    try {
        const challenges = await prisma.challenge.findMany({
            orderBy: { id: 'desc' }
        });
        
        // Map database fields to admin interface fields
        const mappedChallenges = challenges.map(challenge => ({
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            difficulty: challenge.difficulty,
            language: challenge.language,
            timeLimit: Math.round(challenge.expectedCompletionTime / 60), // Convert seconds to minutes
            starterCode: '', // Not in current schema
            testCases: challenge.optimalKeywords || '',
            expectedOutput: '' // Not in current schema
        }));
        
        res.json(mappedChallenges);
    } catch (error) {
        console.error("Error fetching challenges:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /admin/challenges - Create new challenge
router.post('/challenges', async (req, res) => {
    try {
        const {
            title,
            description,
            difficulty,
            language,
            starterCode,
            testCases,
            expectedOutput,
            timeLimit
        } = req.body;

        // Validate required fields
        if (!title || !description || !difficulty || !language) {
            return res.status(400).json({ 
                error: "Title, description, difficulty, and language are required" 
            });
        }

        const challenge = await prisma.challenge.create({
            data: {
                title,
                description,
                difficulty,
                language,
                expectedCompletionTime: (parseInt(timeLimit) || 30) * 60, // Convert minutes to seconds
                optimalKeywords: testCases || ''
            }
        });

        res.status(201).json(challenge);
    } catch (error) {
        console.error("Error creating challenge:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// PUT /admin/challenges/:id - Update challenge
router.put('/challenges/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            difficulty,
            language,
            starterCode,
            testCases,
            expectedOutput,
            timeLimit
        } = req.body;

        const challenge = await prisma.challenge.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                difficulty,
                language,
                expectedCompletionTime: (parseInt(timeLimit) || 30) * 60, // Convert minutes to seconds
                optimalKeywords: testCases || ''
            }
        });

        res.json(challenge);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Challenge not found" });
        }
        console.error("Error updating challenge:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /admin/challenges/:id - Delete challenge
router.delete('/challenges/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if challenge has associated sessions
        const sessionsCount = await prisma.codingSession.count({
            where: { challengeId: parseInt(id) }
        });

        if (sessionsCount > 0) {
            return res.status(400).json({ 
                error: "Cannot delete challenge with existing coding sessions" 
            });
        }

        await prisma.challenge.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: "Challenge deleted successfully" });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Challenge not found" });
        }
        console.error("Error deleting challenge:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;