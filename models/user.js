const mongoose = require('mongoose');
// const validator = require('express-joi-validation').createValidator({})
const Joi = require('joi')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    admin: Boolean,
    // posts : [
    //     {type: mongoose.Schema.Types.ObjectId,ref:'Post'}
    // ]
});

const User = mongoose.model('User', userSchema);

exports.User = User;
exports.signupSchema = Joi.object(
    {
        name: Joi.string()
            .required()
            .min(3),
        email: Joi.string()
            .required().email()
            .min(5),
        username: Joi.string().required().min(3),
        password: Joi.string()
            .required()
            .min(6),
        phone: Joi.number().required(),
        admin: Joi.bool()
            .default(false),
        master_key: Joi.string().optional()
    }
);

exports.loginSchema = Joi.object(
    {
        email: Joi.string()
            .required()
            .min(5),
        password: Joi.string()
            .required()
            .min(6),
    }
);

