const categorymodel = require('../models/category');
const newsmodel = require('../models/news');
const fs = require('fs');
const path = require('path');

// Show All Articles
const allArticles = async (req, res, next) => {
  try {
    let articles;
    if (req.role === 'admin') {
      articles = await newsmodel
        .find()
        .populate('category', 'name')
        .populate('author', 'fullname')
        .sort({ createdAt: -1 });
    } else {
      articles = await newsmodel
        .find({ author: req.id })
        .populate('category', 'name')
        .populate('author', 'fullname')
        .sort({ createdAt: -1 });
    }
    res.render('admin/articles/index', { role: req.role, articles });
  } catch (error) {
    next(error);
  }
};

// Show Add Article Form
const addArticlePage = async (req, res, next) => {
  try {
    const categories = await categorymodel.find().sort({ name: 1 });
    res.render('admin/articles/create', { categories });
  } catch (error) {
    next(error);
  }
};

// Handle Article Submission
const addArticle = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!title || !content || !category || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newArticle = new newsmodel({
      title,
      content,
      category,
      author: req.id,
      image
    });

    await newArticle.save();
    res.redirect('/admin/article');
  } catch (error) {
    next(error);
  }
};

// Show Update Form
const updateArticlePage = async (req, res, next) => {
  try {
    const id = req.params.id;
    const article = await newsmodel.findById(id).populate('category', 'name').populate('author', 'fullname');
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    const categories = await categorymodel.find().sort({ name: 1 });
    res.render('admin/articles/update', { role: req.role, article, categories });
  } catch (error) {
    next(error);
  }
};

// Update Article
const updateArticle = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { title, content, category } = req.body;
    const article = await newsmodel.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.title = title;
    article.content = content;
    article.category = category;

    if (req.file) {
      const imagepath = path.join(__dirname, '../public/uploads', article.image);
      fs.unlinkSync(imagepath);
      article.image = req.file.filename;
    }

    await article.save();
    res.redirect('/admin/article');
  } catch (error) {
    next(error);
  }
};

// Delete Article
const deleteArticle = async (req, res, next) => {
  try {
    const id = req.params.id;
    const article = await newsmodel.findById(id);
    if (article && article.image) {
      const imagepath = path.join(__dirname, '../public/uploads', article.image);
      fs.unlinkSync(imagepath);
    }
    await newsmodel.findByIdAndDelete(id);
    res.redirect('/admin/article');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  allArticles,
  addArticlePage,
  addArticle,
  updateArticlePage,
  updateArticle,
  deleteArticle
};
