const mongoose = require('mongoose');

const Category = new mongoose.model('categories', new mongoose.Schema({
  name: String,
  description: String,
  hierarchy: Number,
  subcategories: [{type: mongoose.Schema.Types.ObjectId, ref: 'categories'}],
}, {
    timestamps: true,
  }));


  module.exports = Category;

