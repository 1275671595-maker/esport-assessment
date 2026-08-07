const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname, { index: 'index.html' }));

// ========== JSON File Database ==========
function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { bookings: [], users: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function findBooking(id) {
  const db = readDB();
  return { db, index: db.bookings.findIndex(b => b.id === id) };
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function findUser(db, username) {
  return db.users.find(u => u.username === username);
}

// ========== Seed Demo Data ==========
function seedIfEmpty() {
  const db = readDB();
  if (!db.users) db.users = [];
  if (db.bookings.length > 0) { writeDB(db); return; }
  const now = Date.now();
  db.bookings = [
    {
      id: 'DEMO001', examineeName: 'DeltaHunter', examineeContact: 'demo_qq_003',
      game: 'delta', gender: 'male', platform: 'pc', wechat: 'DeltaHunter_WX',
      preferredTime: new Date(now + 86400000 * 3).toISOString().slice(0, 16),
      notes: '突击位，擅长M4A1，希望考核枪法和战术配合',
      assessmentType: 'companion', assessmentMode: 'single', assessmentTier: 2, seasonRank: '黑鹰5', kd: '2.1',
      status: 'pending', examinerName: null, examinerContact: null,
      acceptedAt: null, assessingAt: null, completedAt: null, score: null, feedback: null,
      createdAt: now - 1800000
    },
    {
      id: 'DEMO002', examineeName: 'GoddessGamer', examineeContact: 'demo_qq_004',
      game: 'delta', gender: 'female', platform: 'mobile', wechat: 'GoddessGamer_WX',
      preferredTime: new Date(now + 86400000 * 2).toISOString().slice(0, 16),
      notes: '熟悉地图机制，想考娱乐考核',
      assessmentType: 'entertainment', assessmentMode: null, assessmentTier: null, seasonRank: null, kd: null,
      status: 'pending', examinerName: null, examinerContact: null,
      acceptedAt: null, assessingAt: null, completedAt: null, score: null, feedback: null,
      createdAt: now - 900000
    },
    {
      id: 'DEMO003', examineeName: 'ProEscorts', examineeContact: 'demo_qq_005',
      game: 'delta', gender: 'male', platform: 'pc', wechat: 'ProEscorts_WX',
      preferredTime: new Date(now + 86400000 * 2).toISOString().slice(0, 16),
      notes: '老手申请双考技术档，账号巅峰段位KD2.1',
      assessmentType: 'companion', assessmentMode: 'dual', assessmentTier: 2, seasonRank: '巅峰', kd: '2.1',
      status: 'pending', examinerName: null, examinerContact: null,
      acceptedAt: null, assessingAt: null, completedAt: null, score: null, feedback: null,
      createdAt: now - 600000
    }
  ];
  writeDB(db);
  console.log('Demo data seeded.');
}

// ========== API Routes ==========

// Get all bookings
app.get('/api/bookings', (req, res) => {
  const db = readDB();
  res.json(db.bookings);
});

// Get single booking
app.get('/api/bookings/:id', (req, res) => {
  const { db, index } = findBooking(req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Booking not found' });
  res.json(db.bookings[index]);
});

// Create booking
app.post('/api/bookings', (req, res) => {
  const db = readDB();
  const booking = {
    id: 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),
    ...req.body,
    status: req.body.status || 'pending',
    examinerName: null,
    examinerContact: null,
    acceptedAt: null,
    assessingAt: null,
    completedAt: null,
      score: null,
      feedback: null,
      passed: null,
      createdAt: Date.now()
  };
  db.bookings.unshift(booking);
  writeDB(db);
  res.status(201).json(booking);
});

// Accept booking (examiner accepts)
app.patch('/api/bookings/:id/accept', (req, res) => {
  const { db, index } = findBooking(req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Booking not found' });
  const b = db.bookings[index];
  if (b.status !== 'pending') return res.status(400).json({ error: 'Booking is no longer pending' });
  b.status = 'accepted';
  b.examinerName = req.body.examinerName || null;
  b.examinerContact = req.body.examinerContact || null;
  b.acceptedAt = Date.now();
  writeDB(db);
  res.json(b);
});

// Start assessment
app.patch('/api/bookings/:id/start', (req, res) => {
  const { db, index } = findBooking(req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Booking not found' });
  const b = db.bookings[index];
  b.status = 'assessing';
  b.assessingAt = Date.now();
  writeDB(db);
  res.json(b);
});

// Complete assessment (submit score + feedback)
app.patch('/api/bookings/:id/complete', (req, res) => {
  const { db, index } = findBooking(req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Booking not found' });
  const b = db.bookings[index];
  b.status = 'completed';
  b.score = req.body.score;
  b.feedback = req.body.feedback;
  b.passed = req.body.passed;
  b.completedAt = Date.now();
  writeDB(db);
  res.json(b);
});

// Cancel booking
app.patch('/api/bookings/:id/cancel', (req, res) => {
  const { db, index } = findBooking(req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Booking not found' });
  const b = db.bookings[index];
  b.status = 'cancelled';
  writeDB(db);
  res.json(b);
});

// Generic update (for future use)
app.patch('/api/bookings/:id', (req, res) => {
  const { db, index } = findBooking(req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Booking not found' });
  db.bookings[index] = { ...db.bookings[index], ...req.body };
  writeDB(db);
  res.json(db.bookings[index]);
});

// Delete all bookings (admin reset)
app.delete('/api/bookings', (req, res) => {
  const db = readDB();
  db.bookings = [];
  writeDB(db);
  res.json({ message: 'All bookings deleted' });
});

// ========== User Auth Routes ==========

// Get single user (for checking if exists + getting QR code)
app.get('/api/users/:username', (req, res) => {
  const db = readDB();
  const user = findUser(db, req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  // Don't return password hash
  res.json({ username: user.username, role: user.role, qrCode: user.qrCode, createdAt: user.createdAt });
});

// Register new user
app.post('/api/users/register', (req, res) => {
  const db = readDB();
  if (!db.users) db.users = [];
  const { username, password, role, qrCode } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: 'Missing required fields' });
  if (findUser(db, username)) return res.status(409).json({ error: '用户名已存在' });
  const user = {
    username,
    passwordHash: hashPassword(password),
    role,
    qrCode: qrCode || null,
    createdAt: Date.now()
  };
  db.users.push(user);
  writeDB(db);
  res.status(201).json({ username: user.username, role: user.role, qrCode: user.qrCode, createdAt: user.createdAt });
});

// Login (verify password)
app.post('/api/users/login', (req, res) => {
  const db = readDB();
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });
  const user = findUser(db, username);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  if (user.passwordHash !== hashPassword(password)) return res.status(401).json({ error: '密码错误' });
  res.json({ username: user.username, role: user.role, qrCode: user.qrCode, createdAt: user.createdAt });
});

// Change password
app.patch('/api/users/:username/password', (req, res) => {
  const db = readDB();
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Missing passwords' });
  const user = findUser(db, req.params.username);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  if (user.passwordHash !== hashPassword(oldPassword)) return res.status(401).json({ error: '原密码错误' });
  user.passwordHash = hashPassword(newPassword);
  writeDB(db);
  res.json({ username: user.username, message: 'Password changed' });
});

// Change QR code
app.patch('/api/users/:username/qrcode', (req, res) => {
  const db = readDB();
  const { qrCode } = req.body;
  if (!qrCode) return res.status(400).json({ error: 'Missing QR code' });
  const user = findUser(db, req.params.username);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  user.qrCode = qrCode;
  writeDB(db);
  res.json({ username: user.username, qrCode: user.qrCode, message: 'QR code updated' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// SPA fallback - serve index.html for all non-API, non-static routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== Start Server ==========
app.listen(PORT, '0.0.0.0', () => {
  seedIfEmpty();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API base: http://localhost:${PORT}/api`);
});
