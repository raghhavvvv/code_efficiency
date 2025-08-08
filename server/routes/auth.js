// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/authMiddleware');

const prisma = new PrismaClient();

// --- Helper Function to Generate JWT ---
const generateToken = (res, user) => {
    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Token expires in 1 day
    );

    // Send token in an HTTP-Only cookie for security
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Mitigates CSRF
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
};

// --- 1. User Registration ---
// POST /auth/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "Please provide all required fields." });
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if (existingUser) {
            return res.status(409).json({ error: "Username or email already exists." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create new user in the database
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
            },
        });

        // Generate token and set cookie
        generateToken(res, newUser);
        
        // Return user data (without the password hash)
        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// --- 2. User Login ---
// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please provide email and password." });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }
        
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }
        
        // Generate token and set cookie
        generateToken(res, user);
        
        res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// --- 3. User Logout ---
// POST /auth/logout
router.post('/logout', (req, res) => {
    // Clear the cookie by setting it to an empty value with a past expiration date
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully." });
});


// --- 4. Get Current User Info ---
// GET /auth/me
// This endpoint is used by the frontend on page load to check if a user is already authenticated
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { // Select only the fields you want to send to the client
                id: true,
                username: true,
                email: true,
                role: true,
                netScore: true,
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


module.exports = router;