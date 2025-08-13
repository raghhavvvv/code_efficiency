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


module.exports = router;