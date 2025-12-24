const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    const token = authHeader && authHeader.split(' ')[1];

    // Check if token is provided
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }

    // Verify the token
    jwt.verify(token, 'supersecret123', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid access token' });
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;