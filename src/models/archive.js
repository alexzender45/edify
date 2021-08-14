const bcrypt = require('bcrypt');
const { config } = require('dotenv');
const { Schema, model } = require('mongoose');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');
const { DEFAULT_IMAGE_URL } = require('../core/config');
// const validate = require("../validation/userSchema.json")

config();

const archiveSchema = new Schema(
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

archiveSchema.pre('save', async function save(next) {
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

archiveSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Invalid login details');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch)
    if (!isMatch) {
        throw new Error('Invalid login details');
    }

    return user;
};

archiveSchema.plugin(uniqueValidator, { message: '{TYPE} must be unique.' });

const Archive = model('Archive', archiveSchema);
module.exports = Archive;
