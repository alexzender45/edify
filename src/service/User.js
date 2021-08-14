const { validate } = require('jsonschema');
const { S3_BUCKET } = require('../core/config')
const UserSchema = require('../models/userModel');
const Archive = require('../models/archive');
const dataSchema = require('../validation/userSchema.json');
const jwt = require("jsonwebtoken");
const keys = require("../core/config");
const { throwError } = require("../utils/handleErrors");
const bcrypt = require("bcrypt");
const { validateParameters, uploadResourceToS3Bucket } = require('../utils/util');
const { CONFIRM_REACTIVATE } = require("../core/config");

class User {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }

    validateUser() {
        const cleanData = validate(this.data, dataSchema);
        if (!cleanData.valid) {
            const err = cleanData.errors.map((err) => err.stack);
            this.errors = err;
            return err;
        }
        return cleanData.instance;
    }

    async emailExist() {
        const emailFound = await UserSchema.findOne({ email: this.data.email }).exec();
        if (emailFound) {
            this.errors.push('Email already taken');
            return { status: true, data: emailFound };
        }
        return { status: false };
    }

    async userNameExist() {
        const findUserName = await UserSchema.findOne({ userName: this.data.userName }).exec();
        if (findUserName) {
            this.errors.push('Username already taken');
            return true;
        }
        return false;
    }

    async phoneNumberExist() {
        const findPhoneNumber = await UserSchema.findOne({ phoneNumber: this.data.phoneNumber }).exec();
        if (findPhoneNumber) {
            this.errors.push('Phone Number already taken');
            return true;
        }
        return false;
    }

    async signup() {
        return new Promise(async (resolve, reject) => {
            await this.validateUser()
            await Promise.all([this.emailExist(), this.userNameExist(), this.phoneNumberExist()])
            if (this.errors.length) {
                return reject(this.errors)
            }
            const user = new UserSchema(this.data)
            user.save()
                .then(data => {
                    if (!data) {
                        this.errors.push("Unable to save data")
                        return reject(this.errors)
                    }
                    resolve(data)
                }).catch((err) => {
                    this.errors.push("Unable to save data")
                    return reject(this.errors)
                })
        })
    }

    async login() {
        const { email, password } = this.data;
        const validParameters = validateParameters(["email", "password"], this.data);
        const { isValid, messages } = validParameters;

        if (!isValid) {
            throwError(messages);
        }

        return await UserSchema.findByCredentials(email, password);
    }


    async allUsers() {
        const users = await UserSchema.find({});
        return users;
    }

    async userProfile(userId) {
        const users = await UserSchema.findById(userId);
        if (users === null) {
            return 'Not Found'
        } else {
            return users;
        }
    }

    async deactivate(password, userId) {
        if (!password) {
            throwError("Please Input your Password");
        }
        const user = await UserSchema.findOne({ _id: userId })
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throwError('Invalid password');
        } else {
            await UserSchema.findOneAndUpdate({ _id: userId },
                {
                    $set: { isActive: false },
                }, {
                new: true,
            })
        }
    }

    async saveImageToDatabase(url, userId) {
        const user = await UserSchema.findOneAndUpdate({ _id: userId },
            {
                $set: { imageUri: url },
            }, {
            new: true,
        });
        return user;
    }

    async updateUserProfile(userId, Key, Body) {
        const params = {
            Bucket: S3_BUCKET,
            Key,
            Body
        }
        const imageUri = await uploadResourceToS3Bucket(params);
        return await this.saveImageToDatabase(imageUri, userId);
    }

    async followUser() {
        const { userAddress, userId } = this.data;
        const user = await UserSchema.findOne({
            address: userAddress,
            isActive: true
        }).orFail(() => throwError("User To Be Followed Not Found", 404));
        const follower = await UserSchema.findOne({
            _id: userId,
            isActive: true
        }).orFail(() => throwError("Follower Not Found", 404));

        follower.following.map(followingId => {
            if (followingId.toString() === user._id.toString()) {
                throwError("Already Following User");
            }
        });

        user.followers.push(follower._id);
        await user.save();
        follower.following.push(user._id);
        return await follower.save();
    }

    async unfollowUser() {
        const { userAddress, userId } = this.data;
        const user = await UserSchema.findOne({
            address: userAddress,
            isActive: true
        }).orFail(() => throwError("User To Be Unfollowed Not Found", 404));
        const follower = await UserSchema.findOne({
            _id: userId,
            isActive: true
        }).orFail(() => throwError("Follower Not Found", 404));

        if (follower.following.length === 0) {
            throwError("You're not following anyone");
        }

        let followingUserIndex = null;
        let followerIndex = null;
        follower.following.map((followingId, index) => {
            if (followingId.toString() === user._id.toString()) {
                followingUserIndex = index;
            }
        });

        if (followingUserIndex === null) {
            throwError("User Is Not Being Followed");
        }
        follower.following.splice(followingUserIndex, 1);
        const updatedUser = await follower.save();
        user.followers.map((followerId, index) => {
            if (followerId.toString() === follower._id.toString()) {
                followerIndex = index;
            }
        });
        user.followers.splice(followerIndex, 1);
        await user.save();
        return updatedUser;
    }

    async updateUserDetails(key, userUpdate) {
        const updates = Object.keys(key);
        const allowedUpdates = [
            'firstName',
            'lastName',
            'email',
            'phoneNumber',
            'address',
            'state',
            'country'
        ];
        const isValidUpdate = updates.every((update) => {
            return allowedUpdates.includes(update);
        });

        if (!isValidUpdate) {
            throwError('Invalid Field.');
        }

        const updateUserDetails = key;

        updates.map((update) => {
            userUpdate[update] = updateUserDetails[update];
        });

        return await userUpdate.save();
    }

    async deleteUser(userId) {
        await UserSchema.findOneAndDelete({ _id: userId });
    }

    async saveToArchive(userId, password) {
        if (!password) {
            throwError("Please Input your Password");
        } else {
            const findUser = await UserSchema.findOne({ _id: userId });
            const isMatch = await bcrypt.compare(password, findUser.password);
            if (!isMatch) {
                throwError('Invalid password');
            } else {
                const user = await UserSchema.findById({ _id: userId });
                const archive = new Archive({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userName: user.userName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    password: user.password,
                    address: user.address,
                    state: user.state,
                    country: user.country,
                    imageUri: user.imageUri,
                    verified: user.verified,
                    isActive: user.isActive,
                    followers: user.followers,
                    following: user.following,
                    role: user.role
                });
                await archive.save();
                this.deleteUser(userId);
            }
        }
    }

    async reactivate(userId, data) {
        if (!data) {
            throwError("Please Type In RE-ACTIVATE");
        } else if (data !== CONFIRM_REACTIVATE) {
            throwError("Please Type In RE-ACTIVATE");
        } else {
            await UserSchema.findOneAndUpdate({ _id: userId },
                {
                    $set: { isActive: true },
                }, {
                new: true,
            });
        }
    }


    async resetPassword() {
        try {
            const { token, newPassword } = this.data;
            const jwtToken = jwt.verify(token, keys.JWT_SECRETE_KEY)

            if (!jwtToken) {
                this.errors.push('Incorrect or expired Token');
                throwError(this.errors)
            }

            const salt = await bcrypt.genSalt(10);

            const newData = {
                password: await bcrypt.hash(newPassword, salt),
                resetLink: ''
            };

            const updateUser = await UserSchema.findOneAndUpdate(
                { resetLink: token }, { $set: newData }).exec();

            if (!updateUser) {
                this.errors.push("Wrong Token")
                throwError(this.errors)
            }

            return updateUser;
        } catch (error) {
            return error
        }
    };
}


module.exports = User;