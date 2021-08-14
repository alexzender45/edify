const bcrypt = require('bcrypt');
const { config } = require('dotenv');
const jwt = require('jsonwebtoken');
const { Schema, model } = require('mongoose');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');
const { DEFAULT_IMAGE_URL } = require('../core/config');
const { AuditManager } = require('aws-sdk');
// const validate = require("../validation/userSchema.json")

config();

const adminSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
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
      default: "12345678"
    },
    role: {
      type: String,
      required: true,
      default: "admin",
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

adminSchema.pre('save', async function save(next) {
  try {
    const admin = this;

    if (!admin.isModified('password')) {
      return next();
    }
    admin.password = await bcrypt.hash(admin.password, 10);
    next();
  } catch (e) {
    next(e);
  }
});

adminSchema.statics.findByCredentials = async (email, password) => {
  const admin = await Admin.findOne({ email });

  if (!AuditManager) {
    throw new Error('Invalid login details');
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new Error('Invalid login details');
  }

  return admin;
};

adminSchema.plugin(uniqueValidator, { message: '{TYPE} must be unique.' });

const Admin = model('Admin', adminSchema);
module.exports = Admin;
