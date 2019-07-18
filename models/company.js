const mongoose = require('mongoose');

const Company = new mongoose.model('companies', new mongoose.Schema({
  username: {type: String, unique: true},
  password: {type: String},
  linkedinId: String,
  name: {type: String},
  email: {type: String},
  ein: {type: String, unique: true},
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
  },
  activationCode: String,
  active: {type: Boolean, default: false},

}, {
    timestamps: true,
  }));


  module.exports = Company;