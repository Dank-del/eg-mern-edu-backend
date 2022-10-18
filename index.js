const express = require('express');
const mongoose = require('mongoose');
const users = require('./routes/account');
const cookieparser = require('cookie-parser') //necessary for web apps (by default it stored in cookie on client side)  . for mobile apps you can get token via json result
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const { ejwt } = require('./utils/auth')

app.use(cookieparser())          //necessry for parsing token cookie
    .use(express.json())          //necessary for parsing application/json
    .use(express.urlencoded({ extended: false }))  //necessary for parsing application/x-www-form-urlencoded
    .use(function (req, res, next) { ejwt.req = req, ejwt.res = res, next() })    //necessary 



mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connection is established'))
    .catch(err => console.error(err));

app.use('/api/accounts', users);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server is running in PORT " + port));