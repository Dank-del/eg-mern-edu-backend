const express = require('express');
const { Post } = require('../models/post');
const router = express.Router();
const { User, signupSchema, loginSchema } = require('../models/user');
const validator = require('express-joi-validation').createValidator({})
const { ejwt, auth } = require('../utils/auth');

router.post('/signup', validator.body(signupSchema), async (req, res) => {
    var user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ message: "user exists already" })
    user = await User.findOne({ username: req.body.username });
    if (user) return res.status(400).json({ message: "user exists already" })
    var admin = null;
    if (req.body.master_key) {
        if (req.body.master_key != process.env.ADMIN_KEY) return res.status(400).json({ message: "master key is wrong" })
        admin = req.body.admin;
    }

    user = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        phone: req.body.phone,
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
        user_id: user.id
    });

    res.json({
        message: 'login successful',
        //bellow `token,csrf_token` required for mobile app clients but it no need in web apps
        token: ejwt.token,
        csrf_token: ejwt.data.csrf_token
    })
})

router.get('/me', auth, async (req, res) => {
    const ret = await ejwt.get();
    const user = await User.findById(ret.user_id)
    if (!user) return res.status(404).json({ message: "user not found" });
    delete user.password;
    const posts = await Post.find({ user_id: ret.user_id });
    const data = user.toJSON();
    data.posts = posts.map(post => post.toJSON());
    res.json(data)
})

router.get('/logout', auth, async (req, res) => {
    await ejwt.unset();
    res.json({ message: 'logout successful' });
});

exports.userRouter = router;
exports.validator = validator;