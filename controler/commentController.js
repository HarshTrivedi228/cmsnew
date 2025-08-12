// commentController.js
const commentmodel = require('../models/comment');
const newsmodel = require('../models/news'); // Make sure this is imported

const allComment = async (req, res) => {
  try {
    let comments;
    if (req.role === 'admin') {
      comments = await commentmodel.find().populate('article', 'title').sort({ createdAt: -1 });
    } else {
      const news = await newsmodel.find({ author: req.id });
      const newsId = news.map(item => item._id);
      comments = await commentmodel.find({ article: { $in: newsId } }).populate('article', 'title').sort({ createdAt: -1 });
    }
    res.render('admin/comments', { role: req.role, comments });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const comment = await commentmodel.findByIdAndUpdate(id, { status }, { new: true });

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await commentmodel.findByIdAndDelete(id);
    if (!comment) {
      return res.status(404).json({ success: false });
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

module.exports = {
  allComment,
  updateCommentStatus,
  deleteComment
};
