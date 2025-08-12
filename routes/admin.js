const express = require('express');
const router = express.Router();
const  upload= require('../middleware/multer');
const usercontroler = require('../controler/usercontroler');
const categoryControllers = require('../controler/categoryControllers');
const articlecontroler = require('../controler/articlecontroler');
const commentController = require('../controler/commentController');

const isLoggedIn= require('../middleware/isLoggedin');
const isAdmin = require('../middleware/isAdmin');
const isValid= require('../middleware/validation');
// Login Routes
router.get('/', usercontroler.loginPage);
router.post('/index',isValid.loginValidation, usercontroler.adminLogin);
router.get('/logout', usercontroler.logout);
router.get('/dashboard',isLoggedIn, usercontroler.dashboard);
router.get('/settings', isLoggedIn, isAdmin, usercontroler.settings);
router.post('/save-settings', isLoggedIn, isAdmin, upload.single('website_logo'), usercontroler.saveSettings);
// User CRUD Routes
router.get('/users',   isLoggedIn,isAdmin, usercontroler.allUsers);
router.get('/add-user', isLoggedIn, isAdmin, usercontroler.addUserPage);
router.post('/add-user', isLoggedIn, isAdmin, usercontroler.addUser);
router.get('/update-user/:id', isLoggedIn, isAdmin, usercontroler.updateUserPage);
router.post('/update-user/:id',   isLoggedIn, isAdmin, usercontroler.updateUser);
router.get('/delete-user/:id', isLoggedIn, isAdmin, usercontroler.deleteUser);  

router.get('/add-request/:id', isLoggedIn, isAdmin, usercontroler.addrequestpage);
router.get('/delete-request/:id', isLoggedIn, isAdmin, usercontroler.deleteRequest);
router.get('/requests', isLoggedIn, isAdmin, usercontroler.allRequests);

// Category CRUD Routes
router.get('/categories', isLoggedIn, isAdmin, categoryControllers.allCategories);
router.get('/add-category', isLoggedIn, isAdmin, categoryControllers.addCategoryPage);
router.post('/add-category', isLoggedIn, isAdmin, categoryControllers.addCategory);
router.get('/update-category/:id', isLoggedIn, isAdmin, categoryControllers.updateCategoryPage);
router.post('/update-category/:id', isLoggedIn, isAdmin, categoryControllers.updateCategory);
router.get('/delete-category/:id', isLoggedIn, isAdmin, categoryControllers.deleteCategory); 

// Article CRUD Routes
router.get('/article', isLoggedIn,  articlecontroler.allArticles);
router.get('/add-article', isLoggedIn, articlecontroler.addArticlePage);
router.post('/add-article', isLoggedIn, upload.single('image') ,articlecontroler.addArticle);
router.get('/update-article/:id', isLoggedIn, articlecontroler.updateArticlePage);
router.post('/update-article/:id', isLoggedIn, upload.single('image') , articlecontroler.updateArticle);
router.get('/delete-article/:id', isLoggedIn, articlecontroler.deleteArticle); 

// Comment Route
router.get('/comments', isLoggedIn, commentController.allComment);
router.put('/comments/update-status/:id', isLoggedIn, commentController.updateCommentStatus);
router.delete('/delete-comment/:id', isLoggedIn, commentController.deleteComment);

//authwanna Route

router.get('/authwanna',  usercontroler.authwannapage);
router.post('/authwanna', usercontroler.authwanna);
// 404 handler
router.use((req, res, next) => {
  const error = new Error('Page not found');
  error.status = 404;

  if (req.xhr) {
    return res.status(404).json({ error: 'Page not found' });
  }

  res.status(404).render('admin/404', {
    message: 'Page not found',
    role: req.role || null
  });
});

// 500 error handler
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('admin/500', {
    message: 'Internal Server Error',
    error: err || null,
    role: req.role || null
  });
  next(err);
});
//500 middleware
// ⚠️ Place this AFTER all your other routes
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('admin/500', {
    message: 'Internal Server Error',
    error: err || null,
    role: req.role || null // safe check if req.role undefined
  
  });
  next(err); // pass the error to the next middleware

});
module.exports = router;
