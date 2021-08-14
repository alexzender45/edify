const { Schema, model } = require('mongoose');

const reportSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true,
            index: true,
        },
        offenderId: {
            type: String,
            required: true   
        },
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        created_at: {
            type: Date,
            default: Date.now,
        },
    },  {
        timestamps: true,
    }
);

const Report = model('Report', reportSchema);
module.exports = Report;