// server/middleware/adminMiddleware.js

const adminMiddleware = (req, res, next) => {
    // This middleware should run *after* verifyToken, so req.user will be available.
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, proceed to the route.
    } else {
        res.status(403).json({ error: "Forbidden: Access is restricted to administrators." });
    }
};

module.exports = { adminMiddleware };