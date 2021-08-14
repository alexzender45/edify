const Report = require("../service/Report");
const userSchema = require("../models/userModel");
const pageSchema = require("../models/pageModel");
const channelSchema = require("../models/channelModel");
const postSchema = require("../models/postModel");
const commentSchema = require("../models/commentModel");
const { error, success } = require('../utils/baseController');
const { logger } = require("../utils/logger");

exports.reportUser = async (req, res) => {
    const userId = req.user._id;
    const { offenderId, title, content } = req.body;
    const check = await userSchema.findOne({ _id: userId, userName: offenderId });
    if (check) {
        return error(res, { code: 400, message: "You cannot report yourself" })
    }
    else {
        try {
            const data = { title, content, offenderId, userId };
            const reportDetails = await new Report(data).submitReport();
            return success(res, { reportDetails });
        } catch (err) {
            logger.error("Could not send report", err);
            return error(res, { code: 400, message: err })
        }
    }
}

exports.reportPage = async (req, res) => {
    const userId = req.user._id;
    const { offenderId, title, content } = req.body;
    const data = { title, content, offenderId, userId };
    const check = await pageSchema.findOne({ sourceId: userId, pageAddress: offenderId });
    if (check) {
        return error(res, { code: 400, message: "You cannot report your own page" })
    }
    else {
        try {
            const reportDetails = await new Report(data).submitReport();
            return success(res, { reportDetails });
        } catch (err) {
            logger.error("Could not send report", err);
            return error(res, { code: 400, message: err })
        }
    }
}

exports.reportChannel = async (req, res) => {
    const userId = req.user._id;
    const { offenderId, title, content } = req.body;
    const data = { title, content, offenderId, userId };
    const check = await channelSchema.findOne({ sourceId: userId, channelAddress: offenderId });
    if (check) {
        return error(res, { code: 400, message: "You cannot report your own channel" })
    }
    else {
        try {
            const reportDetails = await new Report(data).submitReport();
            return success(res, { reportDetails });
        } catch (err) {
            logger.error("Could not send report", err);
            return error(res, { code: 400, message: err })
        }
    }
}

exports.reportComment = async (req, res) => {
    const userId = req.user._id;
    const offenderId = req.params.commentId;
    const { title, content } = req.body;
    const data = { title, content, offenderId, userId };
    try {
        const reportDetails = await new Report(data).submitReport();
        return success(res, { reportDetails });
    } catch (err) {
        logger.error("Could not send report", err);
        return error(res, { code: 400, message: err })
    }
}

exports.reportPost = async (req, res) => {
    const userId = req.user._id;
    const offenderId = req.params.postId;
    const { title, content } = req.body;
    const data = { userId, offenderId, title, content };
    try {
        const reportDetails = await new Report(data).submitReport();
        return success(res, { reportDetails });
    } catch (err) {
        logger.error("Could not send report", err);
        return error(res, { code: 400, message: err })
    }
}