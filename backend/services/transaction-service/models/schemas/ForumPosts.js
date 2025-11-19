const mongoose = require('mongoose');

const forumPostsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categories' },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'deleted'], default: 'active' },
  views: { type: Number, default: 0 },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPosts' }, // Self-ref
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ForumPosts', forumPostsSchema);