const mongoose = require('mongoose');
const Request = require('../models/Request');

exports.createRequest = async (req, res) => {
  try {
    console.log("🟢 Creating request for user:", req.user); // log isi token

    const newRequest = new Request({
      title: req.body.title,
      description: req.body.description,
      userId: req.user.id, // harus dari token
      status: 'pending'
    });

    const saved = await newRequest.save();

    // Populate userId untuk mendapatkan username
    await saved.populate('userId', 'username nama email');

    console.log("✅ Saved request:", saved);

    // 🔔 Emit real-time notification ke ADMIN
    const io = req.app.get('io');
    io.to('admin').emit('newRequest', {
      message: `Pengajuan baru dari ${saved.userId.nama}`,
      request: saved
    });

    res.json(saved);
  } catch (err) {
    console.error('❌ Error creating request:', err);
    res.status(500).json({ message: 'Gagal membuat pengajuan' });
  }
};


// User melihat daftar request miliknya
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await Request.find({
      $or: [
        { userId: new mongoose.Types.ObjectId(userId) }, // cocok ke ObjectId
        { userId: userId } // cocok ke string lama
      ]
    }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('❌ Error fetching requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin melihat semua request
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('userId', 'username email role')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin menyetujui request
exports.approveRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const adminId = req.user.id;

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: 'approved', approvedBy: adminId, updatedAt: Date.now() },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // 🔔 Emit real-time notification ke USER yang bersangkutan
    const io = req.app.get('io');
    io.to(request.userId._id.toString()).emit('requestApproved', {
      message: `Pengajuan "${request.title}" telah disetujui!`,
      request: request
    });

    res.json({ message: 'Request approved', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin menolak request
exports.rejectRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const adminId = req.user.userId;

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: 'rejected', approvedBy: adminId, updatedAt: Date.now() },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // 🔔 Emit real-time notification ke USER yang bersangkutan
    const io = req.app.get('io');
    io.to(request.userId._id.toString()).emit('requestRejected', {
      message: `Pengajuan "${request.title}" ditolak.`,
      request: request
    });

    res.json({ message: 'Request rejected', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🆕 User update request (hanya pending)
exports.updateRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    const { title, description } = req.body;

    // Cari request
    const request = await Request.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Cek apakah milik user yang login
    if (request.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Cek apakah masih pending
    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Tidak dapat mengedit pengajuan yang sudah diproses' 
      });
    }

    // Update
    request.title = title;
    request.description = description;
    request.updatedAt = Date.now();
    
    await request.save();

    res.json({ 
      message: 'Request updated successfully', 
      request 
    });
  } catch (error) {
    console.error('❌ Error updating request:', error);
    res.status(500).json({ message: error.message });
  }
};

// 🆕 User delete request (hanya pending)
exports.deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    // Cari request
    const request = await Request.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Cek apakah milik user yang login
    if (request.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Cek apakah masih pending
    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Tidak dapat menghapus pengajuan yang sudah diproses' 
      });
    }

    // Delete
    await Request.findByIdAndDelete(requestId);

    res.json({ 
      message: 'Request deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting request:', error);
    res.status(500).json({ message: error.message });
  }
};
