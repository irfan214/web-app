// server.js
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/voiceControlApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Item Schema
const ItemSchema = new mongoose.Schema({
  type: { type: String, required: true },
  details: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', ItemSchema);

// API Routes

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new item
app.post('/api/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Search items
app.get('/api/search', async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const results = await Item.find({
      $or: [
        { type: { $regex: searchTerm, $options: 'i' } },
        { details: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete item by query
app.delete('/api/items', async (req, res) => {
  try {
    const query = req.query.query;
    const result = await Item.deleteMany({
      $or: [
        { type: { $regex: query, $options: 'i' } },
        { details: { $regex: query, $options: 'i' } }
      ]
    });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Auth routes (simplified)
app.post('/api/auth/login', (req, res) => {
  // Simplified login - in a real app, you'd validate credentials
  res.json({ success: true, message: 'Login successful' });
});

app.post('/api/auth/logout', (req, res) => {
  // Simplified logout - in a real app, you'd invalidate sessions
  res.json({ success: true, message: 'Logout successful' });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
