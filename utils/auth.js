const ejwtOptions = {
    expire: 3600,           // alive for seconds
    secret: process.env.JWT_SECRET,       // importat!!!! : change it
    sec_cookie: false,      // if true only pass on https. on develop dont set it to true

    use_redis: false,      // use redis or not

}

const ejwt = require('express-jwt-enhanced')(ejwtOptions);

//auth middleware
async function auth(req,res,next){
    var ret = await ejwt.get();
    // console.log(ret);
    ret && ret.loggedin ? next() : res.json({err:'auth failed'})
}

exports.ejwtOptions = ejwtOptions;
exports.ejwt = ejwt;
exports.auth = auth;