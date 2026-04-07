const SettingModel = require('../models/setting');

const loadCommonData = async (req, res, next) => {
  try {
    const settings = await SettingModel.findOne();
    // Always provide a safe default so templates never crash on null
    res.locals.settings = settings || {
      website_title: 'News Portal',
      website_logo: '',
      footer_description: '© Copyright 2025 News Portal'
    };
    next();
  } catch (err) {
    console.error('Error loading common data:', err);
    // Even on error, provide defaults so the app keeps running
    res.locals.settings = {
      website_title: 'News Portal',
      website_logo: '',
      footer_description: '© Copyright 2025 News Portal'
    };
    next();
  }
};

module.exports = loadCommonData;