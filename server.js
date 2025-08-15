const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
  secret: 'raygram_secret',
  resave: false,
  saveUninitialized: true
}));

// Store users and messages in memory
let users = []; // { username, password }
let messages = []; // { from, to, message, timestamp }

// Signup
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  users.push({ username, password });
  res.json({ success: true });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  req.session.username = username;
  res.json({ success: true });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Get account list (excluding self)
app.get('/accounts', (req, res) => {
  if (!req.session.username) return res.status(401).json({ error: 'Not logged in' });
  const accountList = users
    .filter(u => u.username !== req.session.username)
    .map(u => ({ username: u.username }));
  res.json(accountList);
});

// Send message
app.post('/message', (req, res) => {
  const { to, message } = req.body;
  if (!req.session.username) return res.status(401).json({ error: 'Not logged in' });
  messages.push({
    from: req.session.username,
    to,
    message,
    timestamp: new Date()
  });
  res.json({ success: true });
});

// Get messages between two users
app.get('/get-messages', (req, res) => {
  const { withUser } = req.query;
  if (!req.session.username) return res.status(401).json({ error: 'Not logged in' });
  const chat = messages.filter(
    m =>
      (m.from === req.session.username && m.to === withUser) ||
      (m.from === withUser && m.to === req.session.username)
  );
  res.json(chat);
});

app.listen(PORT, () => {
  console.log(`Raygram server running at http://localhost:${PORT}`);
});
