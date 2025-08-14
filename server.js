const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

const PORT = 3000;
let accounts = [
    { username: 'daley', email: 'daley@example.com', password: 'password123', online: true },
    { username: 'john_doe', email: 'john@example.com', password: 'password123', online: false },
    { username: 'jane_smith', email: 'jane@example.com', password: 'password123', online: true },
    { username: 'alice', email: 'alice@example.com', password: 'password123', online: false },
];
let messages = []; // Store messages here temporarily

app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve HTML/CSS/JS

// Helper: Get client IP (optional)
function getClientIp(req) {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}

// --- ACCOUNTS ---

app.get('/accounts', (req, res) => {
    res.json(accounts);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = accounts.find(a => a.username === username && a.password === password);

    if (user) {
        user.online = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    if (accounts.find(a => a.username === username)) {
        return res.status(409).json({ message: 'Username already exists' });
    }
    accounts.push({ username, email, password, online: false });
    res.json({ success: true });
});

app.post('/logout', (req, res) => {
    const { username } = req.body;
    const user = accounts.find(a => a.username === username);
    if (user) user.online = false;
    res.json({ success: true });
});

// --- MESSAGING ---

// Send a message
app.post('/message', (req, res) => {
    const { from, to, message } = req.body;
    const timestamp = new Date().toISOString();
    messages.push({ from, to, message, timestamp });
    res.json({ success: true });
});

// Get messages between two users
app.post('/get-messages', (req, res) => {
    const { user1, user2 } = req.body;
    const chat = messages.filter(
        msg =>
        (msg.from === user1 && msg.to === user2) ||
        (msg.from === user2 && msg.to === user1)
    );
    res.json(chat);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});