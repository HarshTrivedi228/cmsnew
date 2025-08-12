const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  website_title: {
    type: String,
    required: true,
    trim: true
  },
  website_logo: {
    type: String,
    trim: true
  },
  footer_description: {
    type: String,
    trim: true
  }
});

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;

