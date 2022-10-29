const express = require('express');
const { Post } = require('../models/post');
const router = express.Router();
const { User, signupSchema, loginSchema } = require('../models/user');
const validator = require('express-joi-validation').createValidator({})
const { ejwt, auth } = require('../utils/auth');
const hashIt = require('../utils/hash');
const _ = require("lodash");
const { compare } = require('bcrypt');

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

    const hashedPwd = await hashIt(req.body.password);

    user = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        phone: req.body.phone,
        password: hashedPwd,
        admin: admin
    });
    await user.save();

    const response = _.pick(user.toJSON(), [
        'name', 'email', 'username', 'phone', 'admin'
    ])
    res.json(response)
})

router.post('/login', validator.body(loginSchema), async (req, res) => {
    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(404).json({ message: "user not found" });

    const isOk = await compare(req.body.password, user.password);
    if (!isOk) { return res.status(404).json({ message: "wrong password" }) }

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