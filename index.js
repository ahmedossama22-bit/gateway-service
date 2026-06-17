require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const dotenv = require('dotenv');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/health',(req, res)=> {
    res.status(200).json({status:'ok', timestamp: new Date().toISOString()});
});

// Auth middleware placeholder (to be implemented in the future)
const authMiddleware = (req, res, next) => {
    // TODO: Verify JWT or session
    // For now, let everyone through
    next();
};

// Proxy /api requests to the API Service (running on port 3001)
app.use('/api', authMiddleware, createProxyMiddleware({
    target: process.env.API_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
}));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../frontend-service');
const frontendEnvPath = path.join(frontendPath, '.env');
let frontendEnv = {};
if (fs.existsSync(frontendEnvPath)) {
    frontendEnv = dotenv.parse(fs.readFileSync(frontendEnvPath));
}

// Expose frontend environment variables dynamically
app.get('/env.js', (req, res) => {
    res.type('application/javascript');
    res.send(`window.ENV = ${JSON.stringify(frontendEnv)};`);
});

app.use(express.static(frontendPath));

// Fallback to index.html for SPA routing (if needed)
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Gateway Service running on http://localhost:${PORT}`);
});
