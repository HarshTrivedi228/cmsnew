const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();

const startServer = async () => {
  try {
    // Connect to MongoDB
   mongoose.connect(
  'mongodb+srv://HarshTrivedi:harsh@cluster0.o8dwibi.mongodb.net/news-blog?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => {
  console.log('✅ MongoDB connected');
}).catch(err => {
  console.error('❌ Connection error:', err);
});



    // View Engine Setup
    app.set('view engine', 'ejs');
    app.use(expressLayouts);
    app.set('layout', 'layout'); // default layout

    // Middleware
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));

    // Session & Flash
    app.use(session({
      secret: process.env.SESSION_SECRET || 'secret',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false } // use true only in production with HTTPS
    }));
    app.use(flash());

    const NewsModel = require('./models/news');

    // Fetch latest news middleware
    app.use(async (req, res, next) => {
      try {
        const latestNews = await NewsModel.find().sort({ createdAt: -1 }).limit(5);
        res.locals.latestNews = latestNews;
        next();
      } catch (err) {
        console.error('Error fetching latest news:', err);
        res.locals.latestNews = [];
        next();
      }
    });

    // Flash messages to locals
    app.use((req, res, next) => {
      res.locals.success_msg = req.flash('success_msg');
      res.locals.error_msg = req.flash('error_msg');
      res.locals.error = req.flash('error');
      next();
    });

    // Routes
    app.use('/', require('./routes/frontend'));

    // Admin layout middleware
    app.use('/admin', (req, res, next) => {
      res.locals.layout = 'admin/layout';
      next();
    });
    app.use('/admin', require('./routes/admin'));

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
  }
};

startServer();
