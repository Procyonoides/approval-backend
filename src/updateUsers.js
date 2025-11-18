const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Update semua user yang belum punya field nama & bagian
    const result = await User.updateMany(
      { 
        $or: [
          { nama: { $exists: false } },
          { bagian: { $exists: false } }
        ]
      },
      { 
        $set: { 
          nama: 'Nama Belum Diisi',
          bagian: 'Belum Diisi'
        } 
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users`);
    
    // Show all users
    const users = await User.find().select('-password');
    console.log('\n📋 All users:');
    users.forEach(user => {
      console.log(`- ${user.username} | ${user.nama} | ${user.bagian} | ${user.role}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });