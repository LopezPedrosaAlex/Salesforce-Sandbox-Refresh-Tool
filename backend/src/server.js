require('module-alias/register');
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { startPreRefresh, startPostRefresh, getStatus } = require('./controllers/RefreshController.js');
const { getSession, getSessions, loginSession, cliLoginSession } = require('./controllers/SessionController.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for development
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/session', getSession);
app.post('/api/sessions', getSessions);
app.post('/api/session/login', loginSession);
app.post('/api/session/cli-login', cliLoginSession);
app.post('/api/refresh/pre', (req, res) => startPreRefresh(req, res, io));
app.post('/api/refresh/post', (req, res) => startPostRefresh(req, res, io));
app.get('/api/status', getStatus);

// Granular Features
const { getAllFeatures, executeFeature } = require('./controllers/RefreshController.js');
app.get('/api/features', getAllFeatures);
app.post('/api/features/:id', (req, res) => executeFeature(req, res, io));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log(' - GET  /api/session');
    console.log(' - POST /api/sessions');
    console.log(' - POST /api/session/login');
    console.log(' - POST /api/session/cli-login');
    console.log(' - POST /api/refresh/pre');
    console.log(' - POST /api/refresh/post');
    console.log(' - GET  /api/features');
    console.log(' - POST /api/features/:id');
    console.log(' - GET  /api/status');
    console.log(' - WS   /socket.io');
});
