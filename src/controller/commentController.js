const Comment = require("../service/Comment");
const { error, success } = require("../utils/baseController");
const { logger } = require("../utils/logger");


exports.createComment = async (req, res) => {
    const { postId, comment }= req.body;
    try {
        const userId = req.user._id;
        const commentData = { attachment: req.file, comment, userId, postId };
        const aComment = await new Comment(commentData).createComment();
        return success(res, aComment);
    } catch (e) {
        logger.error(`Error occurred creating comment on post ${postId} ${e}`);
        return error(res, { code: e.code, message: e.message });
    }
};

exports.deleteComment = async (req, res) => {
    const commentId = req.params.commentId;
    try {
        const comment = await new Comment(commentId).deleteComment();
        return success(res, comment);
    } catch (e) {
        logger.error(`Error occurred deleting comment with id ${commentId} ${e}`);
        return error(res, { code: e.code, message: e.message });
    }
};

exports.getComment = async (req, res) => {
    try {
        const comment = await new Comment(req.params).getComment();
        return success(res, comment);
    } catch (e) {
        logger.error(`Error occurred fetching comment with comment id ${req.params._id} ${e}`);
        return error(res, { code: e.code, message: e.message });
    }
};

exports.getCommentByPostId = async (req, res) => {
    try {
        const comment = await new Comment(req.params).getComment();
        return success(res, comment);
    } catch (e) {
        logger.error(`Error occurred fetching comment with post id ${req.params.postId} ${e}`);
        return error(res, { code: e.code, message: e.message });
    }
};

exports.getCommentByUserId = async (req, res) => {
    try {
        const comment = await new Comment(req.params).getComment();
        return success(res, comment);
    } catch (e) {
        logger.error(`Error occurred fetching comment with user id ${req.params.userId} ${e}`);
        return error(res, { code: e.code, message: e.message });
    }
};
exports.reactToComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user._id;
        const reactionType = req.body.reactionType;
        const comment = await new Comment({commentId, userId, reactionType}).reactToComment();
        return success(res, comment);
    } catch (e) {
        logger.error(`Error occurred reacting to comment ${req.params.commentId} ${e}`);
        return error(res, { code: e.code, message: e.message });
    }
};