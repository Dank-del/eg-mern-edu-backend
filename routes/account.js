const express = require('express');
const { Post } = require('../models/post');
const router = express.Router();
const { User, signupSchema, loginSchema } = require('../models/user');
const validator = require('express-joi-validation').createValidator({})
const jwt = require('jsonwebtoken');
const { auth } = require('../utils/auth');
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
    if (!user) return res.status(404).json({ message: "user not found", ok: false });

    const isOk = await compare(req.body.password, user.password);
    if (!isOk) { return res.status(404).json({ message: "wrong password", ok: false }) }

    // await ejwt.set({
    //     loggedin: true,
    //     user_id: user.id
    // });

    const token = jwt.sign({
        user_id: user.id,
        admin: user.admin,
        loggedin: true
    }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
        ok: true,
        message: 'login successful',
        token: token,
    })
})

router.get('/me', auth, async (req, res) => {
    // console.log(req);
    if (!req.user) return res.status(404).json({ message: "user not found" });
    delete req.user.password;
    const posts = await Post.find({ user_id: req.user._id });
    const data = req.user.toJSON();
    data.posts = posts.map(post => post.toJSON());
    res.json(data)
})

router.get('/user/:id', async (req, res) => {
    // if (!req.user) return res.status(404).json({ message: "not logged in" });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "user not found" });
    delete user.password;
    res.json(user.toJSON());
})

exports.userRouter = router;
exports.validator = validator;