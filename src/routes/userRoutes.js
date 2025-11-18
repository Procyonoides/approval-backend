const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser
} = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// 🔹 User routes (untuk profile sendiri)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// 🔹 Admin routes (untuk kelola semua user)
router.get('/', verifyToken, isAdmin, getAllUsers);
router.get('/', verifyToken, isAdmin, createUser);
router.get('/:id', verifyToken, isAdmin, getUserById);
router.put('/:id', verifyToken, isAdmin, updateUser);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

module.exports = router;