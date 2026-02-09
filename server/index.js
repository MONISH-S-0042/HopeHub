require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');

const { mockDonations, mockOrganizations, mockPOCs } = require('./mockData');
const passportConfig = require('./passportConfig');
const User = require('./models/User');
const Request = require('./models/Request');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Mongo connection (default to `carehub` database for development)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/carehub';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Mongo connection error', err));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

// Passport
passportConfig(passport);
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, type, phone, district, state } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });
    if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: 'Password too short' });
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) return res.status(400).json({ message: 'Invalid email' });
    // POC-specific server-side check
    if (type === 'poc' && !email.toLowerCase().endsWith('poc.com')) {
      return res.status(400).json({ message: 'POC email must end with poc.com' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = new User({ name, email, type, phone, district, state });
    await user.setPassword(password);
    await user.save();
    req.login(user, err => {
      if (err) return res.status(500).json({ message: 'Login failed after register' });
      const safe = user.toObject(); delete safe.passwordHash; res.json(safe);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });
  if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ message: 'Invalid password' });
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info?.message || 'Unauthorized' });
    req.login(user, err => {
      if (err) return next(err);
      const safe = user.toObject(); delete safe.passwordHash; res.json(safe);
    });
  })(req, res, next);
});

app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ ok: true });
  });
});

app.get('/api/auth/user', (req, res) => {
  if (req.user) return res.json(req.user);
  res.status(401).json({ user: null });
});

// Existing mock data endpoints (public)
app.get('/api/requests', async (req, res) => {
  try {
    const dbRequests = await Request.find().lean();
    let results = dbRequests || [];

    // If user is authenticated, filter out their own requests
    if (req.user && req.user._id) {
      const userIdStr = String(req.user._id);
      results = results.filter(r => String(r.userId) !== userIdStr);
    }

    res.json(results);
  } catch (err) {
    console.error('Error fetching requests', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new request (authenticated users only)
app.post('/api/requests', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const {
      address,
      landmark,
      district,
      state,
      coordinates,
      category,
      specificResource,
      quantity,
      unit,
      urgency,
      neededBy,
      deliveryPreference,
      peopleAffected,
      specialRequirements,
    } = req.body;

    // Basic validations
    if (!category || !specificResource) return res.status(400).json({ message: 'Category and resource are required' });
    const qty = Number(quantity || 0);
    if (isNaN(qty) || qty <= 0) return res.status(400).json({ message: 'Quantity must be a positive number' });
    const allowedUrgency = ['critical', 'high', 'medium', 'low'];
    if (urgency && !allowedUrgency.includes(urgency)) return res.status(400).json({ message: 'Invalid urgency' });
    let neededDate = null;
    if (neededBy) {
      neededDate = new Date(neededBy);
      if (isNaN(neededDate.getTime())) return res.status(400).json({ message: 'Invalid neededBy date' });
    }

    // Determine if this request should be held for POC verification
    const sensitiveKeywords = ['cash', 'money', 'fund', 'finance', 'donation', 'loan'];
    const lowerSpec = String(specificResource || '').toLowerCase();
    const isSensitive = sensitiveKeywords.some(k => lowerSpec.includes(k));

    const thresholds = {
      'food-nutrition': 500,
      'medical-healthcare': 50,
      'shelter-clothing': 200,
      'water-sanitation': 1000,
      'rescue-safety': 50,
      'transportation-fuel': 500,
      'communication-equipment': 20,
      other: 10,
    };
    const threshold = thresholds[category] ?? 100;
    const isUnreasonableAmount = qty > threshold;

    let status = 'active';
    let assignedPOC = undefined;

    if (isSensitive || isUnreasonableAmount) {
      status = 'pending-verification';
      // assign a POC only when there's an exact district match (no state fallback)
      const pocByDistrict = mockPOCs.find(p => p.district && p.district.toLowerCase() === String(district || '').toLowerCase());
      if (pocByDistrict) {
        assignedPOC = { id: pocByDistrict.id, name: pocByDistrict.name, email: pocByDistrict.email };
      }
    }

    const newReq = new Request({
      userId: req.user._id,
      userName: req.user.name,
      userType: req.user.type,
      address,
      landmark,
      district,
      state,
      coordinates,
      category,
      specificResource,
      quantity: qty,
      unit,
      urgency: urgency || 'medium',
      neededBy: neededDate,
      deliveryPreference,
      peopleAffected,
      specialRequirements,
      status,
      assignedPOC,
      notifiedPOC: assignedPOC ? false : true,
    });

    await newReq.save();
    res.status(201).json(newReq);
  } catch (err) {
    console.error('Error creating request', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POC approves a pending request
app.post('/api/requests/:id/approve', async (req, res) => {
  try {
    if (!req.user || req.user.type !== 'poc') return res.status(403).json({ message: 'POC access required' });
    const { id } = req.params;
    const reqDoc = await Request.findById(id);
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending-verification') return res.status(400).json({ message: 'Request not pending verification' });
    // Ensure the logged-in POC is the assigned POC for this request
    if (!reqDoc.assignedPOC || !req.user.email || req.user.email.toLowerCase() !== String(reqDoc.assignedPOC.email || '').toLowerCase()) {
      return res.status(403).json({ message: 'Not authorized to approve this request' });
    }
    reqDoc.status = 'active';
    reqDoc.notifiedPOC = true;
    reqDoc.verifiedBy = { id: req.user._id, name: req.user.name, email: req.user.email };
    reqDoc.verifiedAt = new Date();
    await reqDoc.save();
    res.json(reqDoc);
  } catch (err) {
    console.error('Approve error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POC rejects (removes) a pending request
app.post('/api/requests/:id/reject', async (req, res) => {
  try {
    if (!req.user || req.user.type !== 'poc') return res.status(403).json({ message: 'POC access required' });
    const { id } = req.params;
    const reqDoc = await Request.findById(id);
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
    if (reqDoc.status !== 'pending-verification') return res.status(400).json({ message: 'Request not pending verification' });
    // Ensure the logged-in POC is the assigned POC for this request
    if (!reqDoc.assignedPOC || !req.user.email || req.user.email.toLowerCase() !== String(reqDoc.assignedPOC.email || '').toLowerCase()) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }
    const { reason } = req.body || {};
    reqDoc.status = 'rejected';
    if (reason) reqDoc.rejectionReason = reason;
    reqDoc.verifiedBy = { id: req.user._id, name: req.user.name, email: req.user.email };
    reqDoc.verifiedAt = new Date();
    await reqDoc.save();
    res.json(reqDoc);
  } catch (err) {
    console.error('Reject error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logged-in user's own requests
app.get('/api/requests/mine', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const mine = await Request.find({ userId: req.user._id }).lean();
    res.json(mine);
  } catch (err) {
    console.error('Error fetching user requests', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/donations', (req, res) => {
  res.json(mockDonations);
});

app.get('/api/organizations', (req, res) => {
  res.json(mockOrganizations);
});

app.get('/api/pocs', (req, res) => {
  res.json(mockPOCs);
});

app.get('/api/stats/urgency', async (req, res) => {
  try {
    const agg = await Request.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);
    const map = { critical: 0, high: 0, medium: 0, low: 0 };
    agg.forEach(item => { map[item._id] = item.count; });
    res.json(map);
  } catch (err) {
    console.error('Error computing urgency stats', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/stats/categories', async (req, res) => {
  try {
    const agg = await Request.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const stats = {};
    agg.forEach(item => { stats[item._id] = item.count; });
    res.json(stats);
  } catch (err) {
    console.error('Error computing category stats', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => res.send('Carehub API running'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
