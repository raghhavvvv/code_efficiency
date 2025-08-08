const express = require('express');
const router = express.Router();
router.get('/stats', (req, res) => res.json({ message: "Admin Stats OK" }));
module.exports = router;