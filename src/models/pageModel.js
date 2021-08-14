const { Schema, model } = require('mongoose');

const pageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    pageAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    pageName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    followers: {
      type: Array
    },
    following: {
      type: Array
    },
  }, {
    timestamps: true,
  },
);

const Page = model('Page', pageSchema);

module.exports = Page;
