const { Schema, model } = require('mongoose');

const commentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    comment: {
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
    reactions: Array,
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const Comments = model('Comment', commentSchema);

module.exports = Comments;
