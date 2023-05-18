import mongoose from "mongoose";

const CommentSchema = mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const MemeSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  imageURL: {
    type: String,
    required: true
  },
  regionalContent: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  creator: {
    type: String,
    ref: 'User',
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  shared_count: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  comments: [CommentSchema],
  comment_count: {
    type: Number,
    default: 0
  },
});

const Meme = mongoose.model('Meme', MemeSchema);

export default Meme;
