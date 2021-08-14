const { S3_BUCKET } = require("../core/config");
const { validate } = require('jsonschema');
const PostSchema = require('../models/postModel');
const dataSchema = require('../validation/postSchema.json');
const { makeReaction, uploadResourceToS3Bucket, getAttachmentSizeInMegabyte } = require('../utils/util');
const { logger } = require("../utils/logger");
const { throwError, handleCastErrorExceptionForInvalidObjectId, isCastError } = require("../utils/handleErrors");

class Post {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }

    validatePost() {
        const cleanData = validate(this.data, dataSchema);
        if (!cleanData.valid) {
            const err = cleanData.errors.map((err) => err.stack);
            this.errors = err;
            return err;
        }
        return cleanData.instance;
    }

    async postExist() {
        const post = await PostSchema.findOne({ title: this.data.title });
        if (post) {
            throwError('Post title already exists');
        }
    }

    async createPost() {
        this.validatePost();
        if (this.errors.length) {
            logger.error(`Invalid Body Parameters for Post: ${this.errors}`);
            throwError('Invalid Body Parameters');
        }
        await this.postExist();

        const { attachment, sourceId, title, description } = this.data;
        let attachmentName, attachmentURI, attachmentMediaType, attachmentSize;

        if (attachment) {
            attachmentName = attachment.originalname;
            const params = { Bucket: S3_BUCKET, Key: attachmentName, Body: attachment.buffer };
            attachmentURI = await uploadResourceToS3Bucket(params);
            attachmentMediaType = attachment.mimetype;
            attachmentSize = getAttachmentSizeInMegabyte(attachment.size);
        }
        const post = new PostSchema({
            sourceId,
            title,
            description,
            attachmentName,
            attachmentURI,
            attachmentMediaType,
            attachmentSize
        });
        return await post.save();
    }

    async deletePost() {
        return await PostSchema.findOneAndUpdate(
            {
                _id: this.data, isActive: true
            },
            {
                $set: { isActive: false }
            },
            {
                new: true
            })
            .orFail(() => throwError('Post Not Found', 404))
            .catch(error => {
                if (isCastError(error)) {
                    handleCastErrorExceptionForInvalidObjectId()
                } else {
                    throw error;
                }
            });
    }

    async getPost() {
        const query = this.data;
        query["isActive"] = true;
        return await PostSchema.findOne(query)
            .orFail(() => throwError('Post Not Found', 404))
            .catch(error => {
                if (isCastError(error)) {
                    handleCastErrorExceptionForInvalidObjectId()
                } else {
                    throw error;
                }
            });
    }
    async reactToPost() {
        const { reactionType, userId, postId } = this.data;
        if (!reactionType) {
            throwError('Invalid Body Parameters');
        }
        const post = await PostSchema.findOne({ _id: postId, isActive: true })
            .orFail(() => throwError('Post Not Found', 404))
            .catch(error => {
                if (isCastError(error)) {
                    handleCastErrorExceptionForInvalidObjectId()
                } else {
                    throw error;
                }
            });
        makeReaction(post.reactions, userId, reactionType);
        post.reactions.push({ reactionType, userId });
        return await post.save();
    }
}

module.exports = Post;