const jwt = require("jsonwebtoken");
const register = require("../models/loginModel");
require('dotenv').config();

const auth = async(req, res, next) => {
    try {
        let token = req.cookies.jwt;
        let verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        let user = await register.findOne({ _id: verifyUser._id });
        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.log(`Error is: ${error}`);
    }
}

module.exports = auth;