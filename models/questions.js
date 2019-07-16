const mongoose = require('mongoose');

const Question = new mongoose.model('questions', new mongoose.Schema(
  {
  title: String,
  correctAlternative: String,
  incorrectAlternatives: [{type: String}],
  type: {type: String, enum: ['multipleChoice']},
  category: {type: mongoose.Schema.Types.ObjectId, ref: 'categories'},
  difficulty: Number,
}, {
    timestamps: true,
  }));

module.exports = Question;