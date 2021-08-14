const { Schema, model } = require('mongoose');

const postSchema = new Schema(
  {
    sourceId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true,
    },
    attachmentName: String,
    attachmentURI: String,
    attachmentMediaType: String,
    attachmentSize: String,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    reactions: {
      type: Array,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }, {
    timestamps: true,
  },
);

const Post = model('Post', postSchema);

module.exports = Post;
