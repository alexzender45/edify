const bcrypt = require('bcrypt');
const { config } = require('dotenv');
const jwt = require('jsonwebtoken');
const { Schema, model } = require('mongoose');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');
const { DEFAULT_IMAGE_URL } = require('../core/config');
const { throwError } = require("../utils/handleErrors");
// const validate = require("../validation/userSchema.json")

config();

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid Email!');
        }
        return validator.isEmail(value);
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isMobilePhone(value, ['en-NG', 'en-GH'])) {
          throw new Error('Invalid Phone Number!');
        }
        return validator.isMobilePhone(value);
      },
    },
    tokens: {
      type: [
        {
          token: {
            type: String,
            required: true,
          },
        },
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    address: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    imageUri: {
      type: String,
      default: DEFAULT_IMAGE_URL,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    followers: {
      type: Array,
    },
    following: {
      type: Array,
    },
    resetLink: {
      type: String,
    },
    role: {
      type: String,
      default: 'user',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ref) {
        delete ref.password;
        delete ref.tokens;
      },
    },
    toObject: {
      transform(doc, ref) {
        delete ref.password;
        delete ref.tokens;
      },
    },
  },
);

userSchema.pre('save', async function save(next) {
  try {
    const user = this;

    if (!user.isModified('password')) {
      return next();
    }
    user.password = await bcrypt.hash(user.password, 10);
    next();
  } catch (e) {
    next(e);
  }
});

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email }).orFail(() => throwError('Invalid Login Details', 404));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
     throwError('Incorrect Password');
  }

  return user;
};

userSchema.plugin(uniqueValidator, { message: '{TYPE} must be unique.' });

const User = model('User', userSchema);
module.exports = User;
