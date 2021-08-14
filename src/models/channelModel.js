const { Schema, model } = require('mongoose');

const channelSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    channelAddress: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    channelName: {
      type: String,
      required: true
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
      type: Array,
    },
  }, {
  timestamps: true,
},
);

const Channel = model('Channel', channelSchema);

module.exports = Channel;
