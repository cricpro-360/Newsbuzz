const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
  name: String,
  phone: String,
  category: String,
  state: String,
  district: String,
  taluk: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Shop', ShopSchema);
