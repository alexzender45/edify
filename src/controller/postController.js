const Post = require("../service/Post");
const { error, success } = require("../utils/baseController");
const { logger } = require("../utils/logger");


exports.createPost = async (req, res) => {
    const { title, description, sourceAddress } = req.body;
    try {
        const postData = { attachment: req.file, sourceId: sourceAddress, title, description };
        const post = await new Post(postData).createPost();
        return success(res, post);
    } catch (e) {
        logger.error(`Error occurred creating post on ${sourceAddress} ${e}`);
        return error(res, { code: e.code, message: e.message });
    }
};

exports.deletePost = async (req, res) => {
    const postId = req.params.postId;
    try {
        const post = await new Post(postId).deletePost();
        return success(res, post);
    } catch (e) {
        logger.error(`Error occurred deleting post with id ${postId} ${e}`);
        return error(res, { code: e.code, message: e.message });
    }
};

exports.getPost = async (req, res) => {
    try {
        const post = await new Post(req.params).getPost();
        return success(res, post);
    } catch (e) {
        logger.error(`Error occurred fetching post with post id ${req.params.postId} ${e}`);
        return error(res, { code: e.code, message: e.message });
    }
};

exports.getPostBySourceId = async (req, res) => {
    try {
        const post = await new Post(req.params).getPost();
        return success(res, post);
    } catch (e) {
        logger.error(`Error occurred fetching post with sourceId ${req.params.sourceId} ${e}`);
        return error(res, { code: e.code, message: e.message });
    }
};

exports.reactToPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;
        const reactionType = req.body.reactionType;
        const post = await new Post({ postId, userId, reactionType }).reactToPost();
        return success(res, post);
    } catch (e) {
        logger.error(`Error occurred reacting to post ${req.params.postId} ${e}`);
        return error(res, { code: e.code, message: e.message });
    }
};