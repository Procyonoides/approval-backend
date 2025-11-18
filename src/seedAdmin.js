const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const existing = await User.findOne({ email: 'admin@example.com' });
    if (existing) {
      console.log('Admin already exists');
      return;
    }

    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin created successfully');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

createAdmin();
