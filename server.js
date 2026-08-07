const express = require('express');
const fs = require('fs');
const path = require('path');

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
    return { bookings: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function findBooking(id) {
  const db = readDB();
  return { db, index: db.bookings.findIndex(b => b.id === id) };
}

// ========== Seed Demo Data ==========
function seedIfEmpty() {
  const db = readDB();
  if (db.bookings.length > 0) return;
  const now = Date.now();
  db.bookings = [
    {
      id: 'DEMO001', examineeName: 'ShadowBlade', examineeContact: 'demo_qq_001',
      game: 'valorant', gender: 'male', platform: 'pc', rank: '金', gameId: 'ShadowBlade#CN1', server: '腾讯服',
      preferredTime: new Date(now + 86400000).toISOString().slice(0, 16),
      notes: '擅长决斗者位置，主练Jett和Reyna，希望考核实战意识和残局处理',
      assessmentType: null, assessmentMode: null, assessmentTier: null, seasonRank: null, kd: null,
      status: 'pending', examinerName: null, examinerContact: null,
      acceptedAt: null, assessingAt: null, completedAt: null, score: null, feedback: null,
      createdAt: now - 3600000
    },
    {
      id: 'DEMO002', examineeName: 'ClearLove77', examineeContact: 'demo_qq_002',
      game: 'lol', gender: 'male', platform: 'pc', rank: '钻石', gameId: 'ClearLove77', server: '电信一区 艾欧尼亚',
      preferredTime: new Date(now + 172800000).toISOString().slice(0, 16),
      notes: '打野位，擅长盲僧、皇子，希望考核前期节奏和团战开团判断',
      assessmentType: null, assessmentMode: null, assessmentTier: null, seasonRank: null, kd: null,
      status: 'pending', examinerName: null, examinerContact: null,
      acceptedAt: null, assessingAt: null, completedAt: null, score: null, feedback: null,
      createdAt: now - 7200000
    },
    {
      id: 'DEMO003', examineeName: 'DeltaHunter', examineeContact: 'demo_qq_003',
      game: 'delta', gender: 'male', platform: 'pc', rank: '铂金', gameId: 'DeltaHunter_PC', server: '微信区',
      preferredTime: new Date(now + 86400000 * 3).toISOString().slice(0, 16),
      notes: '突击位，擅长M4A1，希望考核枪法和战术配合',
      assessmentType: 'companion', assessmentMode: 'single', assessmentTier: 2, seasonRank: '黑鹰5', kd: '2.1',
      status: 'pending', examinerName: null, examinerContact: null,
      acceptedAt: null, assessingAt: null, completedAt: null, score: null, feedback: null,
      createdAt: now - 1800000
    },
    {
      id: 'DEMO004', examineeName: 'GoddessGamer', examineeContact: 'demo_qq_004',
      game: 'delta', gender: 'female', platform: 'mobile', rank: '黄金', gameId: 'GoddessGamer_M', server: 'QQ区',
      preferredTime: new Date(now + 86400000 * 2).toISOString().slice(0, 16),
      notes: '熟悉地图机制，想考娱乐考核',
      assessmentType: 'entertainment', assessmentMode: null, assessmentTier: null, seasonRank: null, kd: null,
      status: 'pending', examinerName: null, examinerContact: null,
      acceptedAt: null, assessingAt: null, completedAt: null, score: null, feedback: null,
      createdAt: now - 900000
    },
    {
      id: 'DEMO005', examineeName: 'ProEscorts', examineeContact: 'demo_qq_005',
      game: 'delta', gender: 'male', platform: 'pc', rank: '大师', gameId: 'ProEscorts_PC', server: '微信区',
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
  writeDB({ bookings: [] });
  res.json({ message: 'All bookings deleted' });
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
