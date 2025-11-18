const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Hapus user lama (opsional)
    // await User.deleteMany({});
    
    // Buat admin
    const admin = new User({
      username: 'admin2',
      nama: 'Administrator',
      bagian: 'IT',
      email: 'admin2@example.com',
      password: 'admin123',
      role: 'admin'
    });
    
    // Buat user biasa
    const user1 = new User({
      username: 'user1',
      nama: 'John Doe',
      bagian: 'Finance',
      email: 'user1@example.com',
      password: 'user123',
      role: 'user'
    });
    
    await admin.save();
    await user1.save();
    
    console.log('✅ Users created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('User1: username=user1, password=user123');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });