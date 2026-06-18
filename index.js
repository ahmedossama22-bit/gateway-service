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

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
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
    },
    onError: function (err, req, res) {
        console.error('[Gateway Service] Proxy Error:', err.message);
        res.status(504).json({ error: 'Gateway Proxy Error', message: err.message });
    }
}));


// Global error handler
app.use((err, req, res, next) => {
    console.error('[Gateway Service] Unhandled Error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Gateway Service running on http://localhost:${PORT}`);
});
