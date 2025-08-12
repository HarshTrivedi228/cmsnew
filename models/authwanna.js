
 const mongoose = require('mongoose');

 const authorSchema = new mongoose.Schema({
    fullname: {
      type: String,
      required: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true
    }
  }, {
  timestamps: true
}
);
  
  const Author = mongoose.model('Author', authorSchema);
  module.exports = Author;