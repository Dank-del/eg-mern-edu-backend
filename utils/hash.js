const { genSalt, hash } = require("bcrypt");

async function hashIt(password) {
    const salt = await genSalt(6);
    const hashed = await hash(password, salt);
    return hashed;
}

module.exports = hashIt;