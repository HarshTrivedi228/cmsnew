const categorymodel = require('../models/category');
const newsmodel = require('../models/news');
const allCategories = async (req, res, next) => {
  try {
    const categories = await categorymodel.find({});
    res.render('admin/categories', { role: req.role, categories });
  } catch (error) {
    next(error); // pass to error handler
  }
};

const addCategoryPage = (req, res) => {
  try {
    res.render('admin/categories/create', { role: req.role });
  } catch (error) {
    next(error);
  }
};

const addCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = new categorymodel({ name, description });
    await category.save();
    res.redirect('/admin/categories');
  } catch (err) {
    next(err); // pass to error handler
  }
};

const updateCategoryPage = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const category = await categorymodel.findById(categoryId);
    if (!category) {
      return res.status(404).send("Category not found");
    }
    res.render('admin/categories/update', { role: req.role, category });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const { name, description } = req.body;

    const category = await categorymodel.findById(categoryId);
    if (!category) {
      return res.status(404).send("Category not found");
    }

    category.name = name;
    category.description = description;
    await category.save();

    res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const category = await categorymodel.findById(categoryId);
    if (!category) {
      return res.status(404).send("Category not found");
    }
   const articleCount = await newsmodel.countDocuments({ category: categoryId });
    if (articleCount > 0) {
     return  res.render('admin/categories/deleteerror', {
  message: "Sorry! You cannot delete this category. Articles are linked with it."
});
    }
    await category.deleteOne();
    res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  allCategories,
  addCategoryPage,
  addCategory,
  updateCategoryPage,
  updateCategory,
  deleteCategory
};
