const {S3_BUCKET} = require("../core/config");
const {validate} = require('jsonschema');
const CommentSchema = require('../models/commentModel');
const PostSchema = require('../models/postModel');
const dataSchema = require('../validation/commentSchema.json');
const {makeReaction, uploadResourceToS3Bucket, getAttachmentSizeInMegabyte} = require('../utils/util');
const {logger} = require("../utils/logger");
const { throwError, handleCastErrorExceptionForInvalidObjectId, isCastError } = require("../utils/handleErrors");

class Comment {
    constructor(data) {
        this.data = data;
        this.errors = [];
    }

    validateComment() {
        const cleanData = validate(this.data, dataSchema);
        if (!cleanData.valid) {
            const err = cleanData.errors.map((err) => err.stack);
            this.errors = err;
            return err;
        }
        return cleanData.instance;
    }

    async createComment() {
        this.validateComment();
        if (this.errors.length) {
            logger.error(`Invalid Body Parameters for Comment: ${this.errors}`);
            throwError('Invalid Body Parameters');
        }

        const {comment, userId, postId, attachment} = this.data;
        await PostSchema.findOne({_id: postId, isActive: true})
            .orFail(() => throwError('Post Not Found', 404))
            .catch(() => throwError('Post Not Found', 404));
        let attachmentName, attachmentURI, attachmentMediaType, attachmentSize;

        if(attachment){
            attachmentName = attachment.originalname;
            const params = { Bucket: S3_BUCKET, Key: attachmentName, Body: attachment.buffer };
            attachmentURI = await uploadResourceToS3Bucket(params);
            attachmentMediaType = attachment.mimetype;
            attachmentSize = getAttachmentSizeInMegabyte(attachment.size);
        }
        return await new CommentSchema({
            userId,
            postId,
            comment,
            attachmentName,
            attachmentURI,
            attachmentMediaType,
            attachmentSize
        }).save();
    }

    async deleteComment() {
        return await CommentSchema.findOneAndUpdate(
            {
                _id: this.data, isActive: true
            },
            {
                $set: { isActive: false }
            },
            {
                new: true
            })
            .orFail(() => throwError('Comment Not Found', 404))
            .catch(error => {
                if(isCastError(error)){
                    handleCastErrorExceptionForInvalidObjectId()
                }else {
                    throw error;
                }
            });
    }

    async getComment() {
        const query = this.data;
        query["isActive"] = true;
        return await CommentSchema.find(query)
            .orFail(() => throwError('Comment Not Found', 404))
            .catch(error => {
                if(isCastError(error)){
                    handleCastErrorExceptionForInvalidObjectId()
                }else {
                    throw error;
                }
            });
    }

    async reactToComment() {
        const { reactionType, userId, commentId } = this.data;
        if(!reactionType){
            throwError('Invalid Body Parameters');
        }

        if(!['negative','positive'].includes(reactionType.toLowerCase())){
            throwError('Invalid Body Parameters - negative/positive reaction type expected');
        }

        let comment = await CommentSchema.findOne({ _id: commentId, isActive: true })
            .orFail(() => throwError('Comment Not Found', 404))
            .catch(error => {
                if(isCastError(error)){
                    handleCastErrorExceptionForInvalidObjectId()
                }else {
                    throw error;
                }
            });
        makeReaction(comment.reactions, userId, reactionType);
        comment.reactions.push({reactionType, userId});
        return await comment.save();
    }


}

module.exports = Comment;