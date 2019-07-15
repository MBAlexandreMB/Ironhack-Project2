const mongoose = require('mongoose');

const Process = new mongoose.model('processes', new mongoose.Schema({
  title: String,
  jobRole: String,
  hierarchyOfRole: {type: String, enum: [
    'Auxiliar/Operational', 
    'Technical', 
    'Internship', 
    'Junior/Trainee',
    'Full', 
    'Senior',
    'Supervision/Coordination',
    'Management',
    'Direction']},
  prerequisites: [{type: mongoose.Schema.Types.ObjectId, ref: 'categories'}],
}, {
    timestamps: true,
  }));

  module.exports = Process;