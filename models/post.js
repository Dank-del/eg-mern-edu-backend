const mongoose = require('mongoose');
const Joi = require('joi');

const postSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: false
    },
    updated_at: {
        type: Date,
        default: Date.now,
        required: false
    },
    approved: {
        type: Boolean,
        default: false,
        required: false
    },
    liked_by : [
        {type: mongoose.Schema.Types.ObjectId,ref:'Post'}
    ]
});

const Post = mongoose.model('Post', postSchema);

exports.Post = Post;
exports.postSchema = Joi.object(
    {
        title: Joi.string()
            .required()
            .min(3),
        content: Joi.string()
            .required()
            .min(6),
        image: Joi.string().required()
    }
);