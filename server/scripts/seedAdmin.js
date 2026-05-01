const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
        console.log('Admin already exists:', existing.email);
        process.exit(0);
    }

    await User.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
    });

    console.log('Admin seeded:', process.env.ADMIN_EMAIL);
    process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
