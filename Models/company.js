const mongoose = require('mongoose');

const Company = new mongoose.model('companies', new mongoose.Schema({
  name: {type: String, required: true}, 
  description: {type: String, required: true},
  logo: {type: String},
  processes: [{type: mongoose.Types.ObjectId, ref: 'processes'}],
  address: {
    street: String,
    number: Number,
    district: String,
    city: String,
    state: String,
    country: String,
  }
}, {
    timestamps: true,
  }));

  module.exports = Company;