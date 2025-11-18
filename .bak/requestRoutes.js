const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  approveRequest,
  rejectRequest,
  updateRequest,
  deleteRequest
} = require('../controllers/requestController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ✅ User membuat request
router.post('/', verifyToken, createRequest);

// ✅ User melihat request miliknya
router.get('/me', verifyToken, getMyRequests);

// 🆕 User update request (hanya pending)
router.put('/:id', verifyToken, updateRequest);

// 🆕 User delete request (hanya pending)
router.delete('/:id', verifyToken, deleteRequest);

// ✅ Admin melihat semua request
router.get('/', verifyToken, isAdmin, getAllRequests);

// ✅ Admin menyetujui / menolak request
router.put('/:id/approve', verifyToken, isAdmin, approveRequest);
router.put('/:id/reject', verifyToken, isAdmin, rejectRequest);

module.exports = router;