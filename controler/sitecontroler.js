const mongoose = require('mongoose');
const categorymodel = require('../models/category');
const commentmodel = require('../models/comment');
const newsmodel = require('../models/news');
const usermodel = require('../models/user');
const SettingModel = require('../models/setting');
const paginate=require('../utils/paginate');
// 🔁 Helper to get used categories
const getUsedCategories = async () => {
  const categoriesInUse = await newsmodel.distinct('category');
  return await categorymodel.find({ _id: { $in: categoriesInUse } }).sort({ name: 1 });
};



const index = async (req, res, next) => {
  try {
    // ✅ Latest news without pagination
    const latestNews = await newsmodel
      .find()
      .populate('category', { name: 1, slug: 1 })
      .populate('author', 'fullname')
      .sort({ createdAt: -1 })
      .limit(5);

    // ✅ Paginated news
    const paginatedNews = await paginate(
      newsmodel,
      {},               // Query object
      req.query,        // From URL query params
      {
        sort: '-createdAt',
        populate: [
          {
            path: 'category',
            select: 'name slug'
          },
          {
            path: 'author',
            select: 'fullname'
          }
        ]
      }
    );

    const settings = await SettingModel.findOne();
    const categories = await getUsedCategories();

    res.render('index', {
      paginatedNews,
      categories: categories || [],
      latestNews: latestNews || [],
      settings: settings || {},
      query: req.query
    });

  } catch (error) {
    next(error);
  }
};


const articlesByCategory = async (req, res, next) => {
  try {
    const category = await categorymodel.findOne({ slug: req.params.name });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

     const paginatedNews = await paginate(
      newsmodel,
      { category: category._id },               // Query object
      req.query,        // From URL query params
      {
        sort: '-createdAt',
        populate: [
          {
            path: 'category',
            select: 'name slug'
          },
          {
            path: 'author',
            select: 'fullname'
          }
        ]
      }
    );

    const categories = await getUsedCategories();

    res.render('category', {
      paginatedNews,
      categories: categories || [],
      category,
      query: req.query
    });
  } catch (error) {
    next(error);
  }
};

const singleArticle = async (req, res, next) => {const id = req.params.id;

  // Check if ID is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send("Invalid article ID");
  }
  try {
    const singleNews = await newsmodel.findById(req.params.id)
      .populate('category', { name: 1, slug: 1 })
      .populate('author', 'fullname');

    if (!singleNews) {
      return res.status(404).json({ message: 'News not found' });
    }

    const categories = await getUsedCategories();
    // get all comments
    const comments = await commentmodel.find({ article: req.params.id, status: 'approved' }).sort({ createdAt: -1 });

    res.render('single', {
      singleNews,
      categories: categories || [],
      comments: comments || []
    });
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const query = (req.query.search || '').trim(); // safe default if missing

    const paginatedNews = await paginate(
      newsmodel,
      query
        ? {
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { content: { $regex: query, $options: 'i' } }
            ]
          }
        : {},
      req.query,
      {
        sort: '-createdAt',
        populate: [
          {
            path: 'category',
            select: 'name slug'
          },
          {
            path: 'author',
            select: 'fullname'
          }
        ]
      }
    );

    const categories = await getUsedCategories();

    res.render('search', {
      paginatedNews,
      categories: categories || [],
      query: req.query,
      p: query
    });
  } catch (error) {
    next(error);
  }
};


const author = async (req, res, next) => {
  try {
    const author = await usermodel.findOne({ _id: req.params.name });

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }
    // const news = await newsmodel.find({ author: req.params.name })
    //   .populate('category', { name: 1, slug: 1 })
    //   .populate('author', 'fullname')
    //   .sort({ createdAt: -1 });
    const paginatedNews = await paginate(
      newsmodel,
      {author: req.params.name},               // Query object
      req.query,        // From URL query params
      {
        sort: '-createdAt',
        populate: [
          {
            path: 'category',
            select: 'name slug'
          },
          {
            path: 'author',
            select: 'fullname'
          }
        ]
      }
    );

    const categories = await getUsedCategories();

    res.render('author', {
      paginatedNews,
      categories: categories || [],
      author,
      query: req.query
    });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const {  name, email, content } = req.body;

    const comment = new commentmodel({
      article: req.params.id,
      name,
      email,
      content,
    });
   
    await comment.save();
    res.redirect(`/single/${req.params.id}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  index,
  articlesByCategory,
  singleArticle,
  search,
  author,
  addComment
};
