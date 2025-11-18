const User = require('../models/User');
const bcrypt = require('bcryptjs');

// 🔹 Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Update user profile (untuk user biasa)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama, bagian, email, password, currentPassword } = req.body;

    // Cari user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Jika update password, validasi password lama
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ 
          message: 'Password lama harus diisi untuk mengganti password' 
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Password lama tidak sesuai' });
      }

      // Hash password baru
      user.password = await bcrypt.hash(password, 10);
    }

    // Update data lainnya
    if (nama) user.nama = nama;
    if (bagian) user.bagian = bagian;
    if (email) user.email = email;

    await user.save();

    // Return user tanpa password
    const updatedUser = await User.findById(userId).select('-password');
    res.json({ 
      message: 'Profile berhasil diupdate', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Admin: Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Admin: Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Admin: Update user (termasuk role)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, nama, bagian, email, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (username) user.username = username;
    if (nama) user.nama = nama;
    if (bagian) user.bagian = bagian;
    if (email) user.email = email;
    if (role) user.role = role;
    
    // Hash password baru jika diubah
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const updatedUser = await User.findById(id).select('-password');
    res.json({ 
      message: 'User berhasil diupdate', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Username atau email sudah digunakan' 
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Admin: Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Jangan izinkan admin hapus diri sendiri
    if (id === req.user.id) {
      return res.status(400).json({ 
        message: 'Tidak dapat menghapus akun sendiri' 
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: error.message });
  }
};