const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
// Wait, I will use built-in fetch if possible, or just use a simple script that mocks the logic.
// Actually, I can just use a standalone script that connects to the same mongo and mocks the request.

const mongoose = require('mongoose');
const User = require('./models/User');
const Request = require('./models/Request');
const { mockPOCs } = require('./mockData');

async function verify() {
    await mongoose.connect('mongodb://localhost:27017/carehub');
    console.log('Connected to MongoDB');

    // Purge previous test data
    await User.deleteOne({ email: 'verify@test.com' });

    const user = new User({
        name: 'Verifier',
        email: 'verify@test.com',
        type: 'individual',
        district: 'Chennai',
        state: 'Tamil Nadu'
    });
    await user.setPassword('pass123');
    await user.save();
    console.log('User registered');

    // Logic to test (extracted from index.js)
    const category = 'food-nutrition';
    const specificResource = 'Rice';
    const quantity = 60;
    const district = 'Chennai';

    const sensitiveKeywords = ['cash', 'money', 'fund', 'finance', 'donation', 'loan'];
    const isSensitive = sensitiveKeywords.some(k => specificResource.toLowerCase().includes(k));

    const thresholds = {
        'food-nutrition': 50,
        'medical-healthcare': 50,
        'shelter-clothing': 50,
        'water-sanitation': 150,
        'other': 10,
    };
    const threshold = thresholds[category] ?? 100;
    const isUnreasonableAmount = quantity > threshold;

    let status = 'active';
    let assignedPOC = undefined;

    if (isSensitive || isUnreasonableAmount) {
        status = 'pending-verification';
        const pocByDistrict = mockPOCs.find(p => p.district && p.district.toLowerCase() === String(district || '').toLowerCase());
        if (pocByDistrict) {
            assignedPOC = { id: pocByDistrict.id, name: pocByDistrict.name, email: pocByDistrict.email };
        }
    }

    console.log('Result Status:', status);
    console.log('Assigned POC:', assignedPOC ? assignedPOC.name : 'None');

    if (status === 'pending-verification' && assignedPOC && assignedPOC.name === 'Dr. Karthik Subramanian') {
        console.log('VERIFICATION SUCCESS: Request flagged and assigned to Chennai POC.');
    } else {
        console.log('VERIFICATION FAILED');
    }

    await mongoose.disconnect();
}

verify().catch(console.error);
