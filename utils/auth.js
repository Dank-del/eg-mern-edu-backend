const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

//auth middleware
async function auth(req, res, next) {
    // console.log(req.headers['authorization'].replace('Bearer: ', ''));
    try {
        const jwtpld = jwt.verify(
            req.headers['authorization'].replace('Bearer: ', ''),
            process.env.JWT_SECRET,
        )
        // console.log(jwtpld);
        if (jwtpld.loggedin) {
            req.user = (await User.findById(jwtpld.user_id));
            next();
        }
    }
    catch (err) {
        res.status(401).json(err)
    }
}

exports.auth = auth;