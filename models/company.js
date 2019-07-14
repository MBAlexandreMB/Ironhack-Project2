const mongoose = require('mongoose');

const Company = new mongoose.model('companies', new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  name: {type: String, required: true},
  email: {type: String, required: true},
  ein: {type: String, required: true, unique: true},
  description: {type: String},
  logo: {type: String},
  processes: [{type: mongoose.Schema.Types.ObjectId, ref: 'processes'}],
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