             
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true, // ensures username is not duplicated
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['author', 'admin'], // optional: restrict to specific roles
    default: 'author'
  }
});

 userSchema.pre('save', async function(next)  {
  if( this.isModified('password') ){
    this.password = await bcrypt.hash(this.password, 10);
  }
    next();
 } )   

const User = mongoose.model('User', userSchema);

module.exports = User;
                