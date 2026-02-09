require('dotenv').config();
// Server initialization
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
const Donation = require('./models/Donation');
const Notification = require('./models/Notification');

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
      'other': 10,
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

    // Reverse Auto-Allocation (Supply -> New Request)
    if (newReq.status === 'active') {
      try {
        const availableSupplies = await Donation.find({
          category: newReq.category,
          district: newReq.district,
          status: 'available',
          remainingQuantity: { $gt: 0 }
        }).sort({ createdAt: 1 }); // Oldest supplies first

        let needed = newReq.quantity;
        let matchedCount = 0;

        for (const donation of availableSupplies) {
          if (needed <= 0) break;

          const available = donation.remainingQuantity;
          const allocate = Math.min(needed, available);

          // Update donation
          donation.remainingQuantity -= allocate;
          if (donation.remainingQuantity === 0) {
            donation.status = 'completed';
          }
          await donation.save();

          // Update donor trust score
          await User.findByIdAndUpdate(donation.donorId, { $inc: { trustScore: 5 } });

          // Create a specific donation record for this match so it shows up in history
          const matchRecord = new Donation({
            requestId: newReq._id,
            donorId: donation.donorId,
            donorName: donation.donorName,
            donorType: donation.donorType,
            category: donation.category,
            specificResource: donation.specificResource,
            quantity: allocate,
            unit: donation.unit,
            remainingQuantity: 0,
            pickupAddress: donation.pickupAddress,
            district: donation.district,
            state: donation.state,
            status: 'completed'
          });
          await matchRecord.save();

          // Update request
          newReq.fulfilledQuantity = (newReq.fulfilledQuantity || 0) + allocate;
          if (!newReq.matchedDonations) newReq.matchedDonations = [];
          newReq.matchedDonations.push(matchRecord._id);

          needed -= allocate;
          matchedCount++;

          // Notify Donor
          try {
            await new Notification({
              userId: donation.donorId,
              title: 'Your donation was matched!',
              message: `Your available supply of ${donation.specificResource} was auto-matched to a new request for ${allocate} ${donation.unit}.`,
              type: 'donation',
              link: '/dashboard'
            }).save();
          } catch (nErr) { console.error(nErr); }
        }

        if (newReq.fulfilledQuantity >= newReq.quantity) {
          newReq.status = 'matched';
        }

        if (matchedCount > 0) {
          await newReq.save();
          // Notify Requester (Local notify is faster, but this for persistence)
          try {
            await new Notification({
              userId: newReq.userId,
              title: 'Request instantly matched!',
              message: `We found ${matchedCount} available supplies that match your request. Check your dashboard.`,
              type: 'fulfillment',
              link: '/dashboard'
            }).save();
          } catch (nErr) { console.error(nErr); }
        }
      } catch (matchErr) {
        console.error('Reverse matching error:', matchErr);
      }
    }

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

// User donates to a specific request
app.post('/api/requests/:id/donate', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const { id } = req.params;
    const { quantity, pickupAddress, district, state } = req.body;

    const reqDoc = await Request.findById(id);
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) return res.status(400).json({ message: 'Invalid quantity' });

    const donation = new Donation({
      requestId: id,
      donorId: req.user._id,
      donorName: req.user.name,
      donorType: req.user.type,
      category: reqDoc.category,
      specificResource: reqDoc.specificResource,
      quantity: qty,
      unit: reqDoc.unit,
      remainingQuantity: 0,
      pickupAddress,
      district: district || req.user.district,
      state: state || req.user.state,
      status: 'completed'
    });

    await donation.save();

    // Update request fulfillment
    reqDoc.fulfilledQuantity = (reqDoc.fulfilledQuantity || 0) + qty;
    if (reqDoc.fulfilledQuantity >= reqDoc.quantity) {
      reqDoc.status = 'matched';
    }

    if (!reqDoc.matchedDonations) reqDoc.matchedDonations = [];
    reqDoc.matchedDonations.push(donation._id);
    await reqDoc.save();

    // Update Trust Score
    await User.findByIdAndUpdate(req.user._id, { $inc: { trustScore: 5 } });

    // Create notification
    try {
      const isFull = reqDoc.fulfilledQuantity >= reqDoc.quantity;
      await new Notification({
        userId: reqDoc.userId,
        title: isFull ? 'Request Fulfilled!' : 'New Donation Received',
        message: isFull
          ? `Your request for ${reqDoc.quantity} ${reqDoc.unit} of ${reqDoc.specificResource} has been fully matched!`
          : `Someone donated ${qty} ${reqDoc.unit} towards your request for ${reqDoc.specificResource}.`,
        type: isFull ? 'fulfillment' : 'donation',
        link: `/dashboard`
      }).save();
    } catch (notifErr) { console.error(notifErr); }

    res.status(201).json({ donation, request: reqDoc });
  } catch (err) {
    console.error('Donation error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// General Donation (Smart Allocation Engine)
app.post('/api/donations', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    console.log('Listing donation:', req.body); // Diagnostic log

    const {
      category, specificResource, quantity, unit, condition,
      pickupAddress, district, state, canDeliver, canPickup, deliveryRadius,
      expiryDate, availableUntil
    } = req.body;

    // Validation
    if (!category || !specificResource || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const initialQty = Number(quantity);
    if (isNaN(initialQty) || initialQty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    let remainingQty = initialQty;

    // Create base donation record
    const donation = new Donation({
      donorId: req.user._id,
      donorName: req.user.name,
      donorType: req.user.type,
      category,
      specificResource,
      quantity: initialQty,
      unit: unit || 'units',
      remainingQuantity: initialQty,
      condition: condition || 'new',
      expiryDate: expiryDate || undefined,
      availableUntil: availableUntil || undefined,
      pickupAddress,
      district: district || req.user.district,
      state: state || req.user.state,
      canDeliver: canDeliver === true,
      canPickup: canPickup === true,
      deliveryRadius: Number(deliveryRadius) || 25,
      status: 'available'
    });

    // Smart Allocation Core
    console.log(`Starting smart allocation for ${remainingQty} ${unit} of ${specificResource} in ${district}`);
    const candidateRequests = await Request.find({
      category,
      status: 'active',
      district: district
    });

    const urgencyMap = { critical: 4, high: 3, medium: 2, low: 1 };
    candidateRequests.sort((a, b) => {
      const urgencyB = urgencyMap[b.urgency] || 0;
      const urgencyA = urgencyMap[a.urgency] || 0;
      if (urgencyB !== urgencyA) return urgencyB - urgencyA;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    let matchedCount = 0;
    const matches = [];

    for (const reqDoc of candidateRequests) {
      if (remainingQty <= 0) break;

      const needed = reqDoc.quantity - (reqDoc.fulfilledQuantity || 0);
      if (needed <= 0) continue;

      const allocate = Math.min(remainingQty, needed);
      if (isNaN(allocate) || allocate <= 0) continue;

      reqDoc.fulfilledQuantity = (reqDoc.fulfilledQuantity || 0) + allocate;
      if (reqDoc.fulfilledQuantity >= reqDoc.quantity) {
        reqDoc.status = 'matched';
      }

      // Create a specific donation record for this match so it shows up in history
      const matchRecord = new Donation({
        requestId: reqDoc._id,
        donorId: req.user._id,
        donorName: req.user.name,
        donorType: req.user.type,
        category: donation.category,
        specificResource: donation.specificResource,
        quantity: allocate,
        unit: donation.unit,
        remainingQuantity: 0,
        pickupAddress: donation.pickupAddress,
        district: donation.district,
        state: donation.state,
        status: 'completed'
      });
      await matchRecord.save();

      if (!reqDoc.matchedDonations) reqDoc.matchedDonations = [];
      reqDoc.matchedDonations.push(matchRecord._id);
      await reqDoc.save();

      remainingQty -= allocate;
      matchedCount++;
      matches.push({ requestId: reqDoc._id, allocated: allocate });

      // Create notification for requester
      try {
        await new Notification({
          userId: reqDoc.userId,
          title: 'Your request was auto-matched!',
          message: `An auto-allocation matched ${allocate} ${unit || 'units'} of ${specificResource} to your request from ${req.user.name}.`,
          type: 'fulfillment',
          link: '/dashboard'
        }).save();
      } catch (notifErr) {
        console.error('Auto-allocation notification error:', notifErr);
      }
    }

    donation.remainingQuantity = remainingQty;
    if (remainingQty === 0) donation.status = 'completed';

    await donation.save();

    if (matchedCount > 0) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { trustScore: matchedCount * 5 } });
    }

    console.log(`Donation listed successfully. Matched with ${matchedCount} requests.`);
    res.status(201).json({ donation, matchedCount, matches });
  } catch (err) {
    console.error('General donation error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// GET global donations feed (available supplies)
app.get('/api/donations', async (req, res) => {
  try {
    const supplies = await Donation.find({ status: 'available', remainingQuantity: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .lean();
    res.json(supplies);
  } catch (err) {
    console.error('Fetch donations error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donations for a specific request
app.get('/api/requests/:id/donations', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const { id } = req.params;
    const donations = await Donation.find({ requestId: id }).sort({ createdAt: -1 }).lean();
    res.json(donations);
  } catch (err) {
    console.error('Fetch request donations error', err);
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

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const notifs = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20).lean();
    res.json(notifs);
  } catch (err) {
    console.error('Fetch notifications error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/notifications/:id/read', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const { id } = req.params;
    await Notification.findOneAndUpdate({ _id: id, userId: req.user._id }, { isRead: true });
    res.json({ ok: true });
  } catch (err) {
    console.error('Mark read error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => res.send('Carehub API running'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
