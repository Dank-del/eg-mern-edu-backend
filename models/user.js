const mongoose = require('mongoose');
// const validator = require('express-joi-validation').createValidator({})
const Joi = require('joi')

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    admin: Boolean
});

const User = mongoose.model('User', userSchema);

exports.User = User;
exports.signupSchema = Joi.object(
    {
        name: Joi.string()
            .required()
            .min(3),
        email: Joi.string()
            .required()
            .min(5),
        password: Joi.string()
            .required()
            .min(6),
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

