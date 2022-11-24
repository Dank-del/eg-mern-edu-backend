const express = require('express');
const router = express.Router();
const { auth } = require('../utils/auth');
const { Post, postSchema } = require('../models/post');
const { validator } = require('./account');
const { User } = require('../models/user');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
    const token = req.headers['authorization']?.replace('Bearer: ', '')
    try {
        const jwtpld = jwt.verify(token, process.env.JWT_SECRET);
        console.log(jwtpld);
        if (jwtpld.admin) {
            const posts = await Post.find({});
            return res.json(posts);
        }
        const posts = await Post.find({
            approved: true
        });
        return res.json(posts.map(post => post.toJSON()));
    } catch (err) {
        const posts = await Post.find({
            approved: true
        });
        return res.json(posts.map(post => post.toJSON()));
    }
});

router.get('/:id', async (req, res) => {
    var post = null;
    try {
        post = await Post.findById(req.params.id);
    } catch (err) {
        return res.status(404).json({ message: "post not found" });
    }
    if (!post) return res.status(404).json({ message: "post not found" });
    res.json(post.toJSON());
});

router.post('/new', auth, validator.body(postSchema), async (req, res) => {
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        user_id: req.user._id,
        image: req.body.image
    });
    await post.save();
    // const user = await User.findById(ret.user_id);
    // user.posts.push(post._id);
    // await user.save();
    res.json(post.toJSON())
})

router.post('/edit/:id', auth, validator.body(postSchema), async (req, res) => {
    var post = null;
    try {
        post = await Post.findById(req.params.id);
    } catch (err) {
        return res.status(404).json({ message: "post not found" });
    }
    if (!post) return res.status(404).json({ message: "post not found" });
    if (post.user_id != req.user._id) return res.status(401).json({ message: "unauthorized" });
    post.title = req.body.title;
    post.content = req.body.content;
    post.image = req.body.image;
    post.updated_at = Date.now();
    await post.save();
    res.json(post.toJSON())
})

router.post('/delete/:id', auth, async (req, res) => {
    var post = null;
    try {
        post = await Post.findById(req.params.id);
    } catch (err) {
        return res.status(404).json({ message: "post not found" });
    }
    if (!post) return res.status(404).json({ message: "post not found" });
    if (post.user_id != req.user._id) return res.status(401).json({ message: "unauthorized" });
    // const user = await User.findById(ret.user_id);
    // user.posts = user.posts.filter(id => id != post._id);
    // await user.save();
    await post.remove();
    res.json({ message: "post deleted" })
})

router.post('/like/:id', auth, async (req, res) => {
    var post = null;
    try {
        post = await Post.findById(req.params.id);
    } catch (err) {
        return res.status(404).json({ message: "post not found" });
    }
    if (!post) return res.status(404).json({ message: "post not found" });
    if (post.liked_by.includes(req.user._id)) {
        post.liked_by = post.liked_by.filter(id => id != req.user._id);
    } else {
        post.liked_by.push(req.user._id);
    }
    await post.save();
    res.json(post.toJSON());
})

router.post('/removelike/:id', auth, async (req, res) => {
    var post = null;
    try {
        post = await Post.findById(req.params.id);
    } catch (err) {
        return res.status(404).json({ message: "post not found" });
    }
    if (!post) return res.status(404).json({ message: "post not found" });
    post.liked_by = post.liked_by.filter(id => id === req.user._id);
    await post.save();
    res.json(post.toJSON());
})

router.post('/approve/:id', auth, async (req, res) => {
    var post = null;
    try {
        post = await Post.findById(req.params.id);
    } catch (err) {
        return res.status(404).json({ message: "post not found" });
    }
    if (!post) return res.status(404).json({ message: "post not found" });
    const user = await User.findById(req.user._id);
    if (!user.admin) return res.status(401).json({ message: "unauthorized" });
    post.approved = true;
    await post.save();
    res.json(post.toJSON());
})

router.post('/unapprove/:id', auth, async (req, res) => {
    var post = null;
    try {
        post = await Post.findById(req.params.id);
    } catch (err) {
        return res.status(404).json({ message: "post not found" });
    }
    if (!post) return res.status(404).json({ message: "post not found" });
    const user = await User.findById(req.user._id);
    if (!user.admin) return res.status(401).json({ message: "unauthorized" });
    post.approved = false;
    await post.save();
    res.json(post.toJSON());
});

module.exports = router;