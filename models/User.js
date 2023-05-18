import mongoose from "mongoose";

const PlaylistSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  memes: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meme',
    }],
    default: [],
  },
});

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  preferences: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meme',
  }],
  favorites: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meme',
    }],
    default: [],
  },
  following: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    default: [],
  },
  followers: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    default: [],
  },
  following_count: {
    type: Number,
    default: 0,
  },
  follower_count: {
    type: Number,
    default: 0,
  },
  blocked_content: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meme',
    }],
    default: [],
  },
  blocked_people: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    default: [],
  },
  playlists: [PlaylistSchema],

  sharedMemes: [
    {
      meme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  sentMessages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  receivedMessages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  chat_count: {
    type: Number,
    default: 0,
  },

});

const User = mongoose.model('User', UserSchema);

export default User;


