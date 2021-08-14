const Admin = require("../service/Admin");
const { error, success } = require("../utils/baseController");
const { generateAuthToken } = require("../core/userAuth");
const { logger } = require("../utils/logger");
const keys = require("../core/config");
const msg = require('../utils/mailgun')

exports.createAdmin = async (req, res) => {
    await new Admin(req.body).create()
    .then(async (data) => {
        const token = await generateAuthToken({ adminId: data._id, isVerified: data.verified })
        if (!token) {
            return error(res, { code: 400, message: "Unable to Generate Token" })
        }
        return success(res, { data, token })
    })
    .catch((err) => {
        logger.error("Error occurred at signup", err);
        return error(res, { code: 400, message: err })
    })
}

exports.login = async (req, res) => {
    try {
        const userDetails = await new User(req.body).login();
        const token = await generateAuthToken({ userId: userDetails._id, isVerified: userDetails.verified });
        return success(res, { userDetails, token });
    } catch (err) {
        logger.error("Error occurred at login", err);
        return error(res, { code: 400, message: err.message });
    }
}

exports.getAllUser = async (req, res) => {
    try {
        const user = await new User(req.body).allUsers();
        return success(res, { user });
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: 400, message: err.message });
    }
}

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await new User(req.body).userProfile(userId);
        return success(res, { user });
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: 400, message: err.message });
    }
}

exports.deactivateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await new User(req.body).deactivate(userId);
        return success(res, { user });
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: 400, message: err.message });
    }
}

exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const Key = req.file.originalname;
        const Body = req.file.buffer
        await new User(req).updateUserProfile(userId, Key, Body);
        return success(res);
    } catch (err) {
        logger.error("Unable to complete request", err);
        return error(res, { code: 400, message: err.message });
    }
};
