const express = require('express');
const router = express.Router();
const { User, signupSchema, loginSchema } = require('../models/user');
const validator = require('express-joi-validation').createValidator({})
const { ejwt } = require('../utils/auth');

router.post('/signup', validator.body(signupSchema), async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: "user exists already" })
    
    admin = null;
    if (req.body.master_key) {
        if (req.body.master_key != process.env.ADMIN_KEY) return res.status(400).json({ message: "master key is wrong" })
        admin = req.body.admin;
    }

    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        admin: admin
    });
    await user.save();

    delete user.password;
    res.json(user.toJSON())
})

router.post('/login', validator.body(loginSchema), async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(404).json({ message: "user not found" });

    await ejwt.set({
        loggedin: true,
        user: user.toJSON()
    });

    res.json({
        message: 'login successful',
        //bellow `token,csrf_token` required for mobile app clients but it no need in web apps
        token: ejwt.token,
        csrf_token: ejwt.data.csrf_token
    })
})

module.exports = router;