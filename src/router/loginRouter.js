const express = require('express');
const router = express.Router();
const register = require('../models/loginModel');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const auth = require('../middleware/authMiddleware');
let upload_path = path.join(__dirname, "../../uploads");
let jwt = require("jsonwebtoken");
require("dotenv").config();

let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, upload_path.toString());
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

let uploadImg = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        let extname = path.extname(file.originalname);
        if (extname !== '.png' && extname !== '.jpg') {
            cb(new Error('Wrong file type please upload only png and jpg'));
        } else {
            cb(null, true);
        }
    }
});

router.get('/', (req, res) => {
    res.status(201).render('index');
});

router.get('/about', auth, (req, res) => {
    res.status(201).render('about');
});

router.get('/login', (req, res) => {
    res.status(201).render('login');
});

router.get('/logout', auth, async(req, res) => {
    try {
        //user logout only one device
        req.user.tokens = req.user.tokens.filter((currentElement) => {
            return currentElement.tokens !== req.token;
        });
        res.clearCookie("jwt");
        await req.user.save();
        res.status(201).render('login');
    } catch (error) {
        res.status(501).send(error);
    }
});

router.get('/register', (req, res) => {
    res.status(201).render('register');
});

router.get('/profile', auth, async(req, res) => {
    let id = req.user._id
    let user = await register.findOne({ _id: id });
    if (user) {
        res.status(201).render('profile', { userData: user });
    } else {
        res.status(404).send('User not found');
    }
});

//Forget password
router.get('/forgotpassword', (req, res) => {
    res.status(201).render('forgotpassword');
});

router.post('/forget', async(req, res) => {
    let email = req.body.email;
    let user = await register.findOne({ email: email });
    if (!user) {
        res.status(403).send("Email address not found !!!");
    } else {
        let forget_token = jwt.sign({ _id: user._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '10m' });

        let transpoter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "kevalsorthiya1234@gmail.com",
                pass: '7878731174'
            },
            host: 'smtp.gmail.com',
            port: 465,
            secure: true
        });

        let mailOptions = {
            from: "kevalsorthiya1234@gmail.com",
            to: email,
            subject: "Reset your login password",
            html: `<p>Please click below link to reset your password.also this link is valid for only 10 minutes</p></br><p>http://localhost:8000/newpassword/${forget_token}</p>`
        }

        let updateData = await register.findByIdAndUpdate(user._id, { forgotpasswordtoken: forget_token.toString() });
        if (!updateData) {
            res.status(304).send("forget token is not updated successfully");
        } else {
            transpoter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    res.status(301).send('Error in sending mail');
                } else {
                    res.status(203).send('Change password link send to your email');
                }
            });
        }
    }
});

router.get('/newpassword/:token', async(req, res) => {
    let forget_password_token = req.params.token;
    jwt.verify(forget_password_token, process.env.RESET_PASSWORD_KEY, async(error, decoded) => {
        if (error) {
            return res.status(401).send('Incorrect token or it is expired');
        } else {
            let userData = await register.findOne({ forgotpasswordtoken: forget_password_token.toString() });
            if (userData) {
                res.status(200).render('newpassword', { token: forget_password_token });
            } else {
                return res.status(403).send('User forget password token is not found !!!');
            }
        }
    });
});

router.post('/updatepassword', async(req, res) => {
    try {
        let newpassword = req.body.newpassword;
        let confirmpassword = req.body.confirmpassword;
        let requestToken = req.body.token;
        if (newpassword === confirmpassword) {
            let hashpassword = await bcrypt.hash(newpassword, 10);
            let hashconfirmpassword = await bcrypt.hash(confirmpassword, 10);
            let updatedData = await register.findOneAndUpdate({ forgotpasswordtoken: requestToken.toString() }, { password: hashpassword.toString(), confirmpassword: hashconfirmpassword.toString() }, { new: true });
            if (!updatedData) {
                res.status(406).send('Error in saving new password');
            } else {
                res.status(201).render('login');
            }
        } else {
            return res.status(405).send('Please enter same newpassword and confirm password');
        }
    } catch (error) {
        res.status(403).send('Error in updating new password');
    }
});

router.post('/register', uploadImg.single('profile'), async(req, res) => {
    try {
        let password = req.body.password;
        let confirmpassword = req.body.confirmpassword;
        if (password === confirmpassword) {
            let data = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
                gender: req.body.gender,
                profile: {
                    imgname: req.file.originalname,
                    extname: req.file.mimetype,
                    destination: req.file.path
                }
            }
            let createUser = new register(data);

            let token = await createUser.genarateAuthToken();

            res.cookie("jwt", token, { expires: new Date(Date.now() + 600000), httpOnly: true })

            let savedData = await createUser.save();
            if (!savedData) {
                res.status(401).send("Data is not saved successfully");
            } else {
                res.status(201).render('login');
            }
        } else {
            return res.status(402).render('register', { register_error: "password and confirm password are not same" });
        }
    } catch (error) {
        return res.status(403).render('register', { register_error: error });
    }
});

router.post('/login', async(req, res) => {
    try {
        let email = req.body.email;
        let data = await register.findOne({ email });
        if (data) {
            let isMatch = await bcrypt.compare(req.body.password, data.password);

            const token = await data.genarateAuthToken();

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 600000),
                httpOnly: true
                    // secure:true
            });

            if (isMatch) {
                return res.status(201).render('index');
            } else {
                res.status(403).render('login', { password_error: 'please enter valid password' });
            }
        } else {
            res.status(404).render('login', { email_error: 'please enter valid email address' });
        }
        let password = req.body.password;
    } catch (error) {
        console.log(error);
    }
});

router.get('*', (req, res) => {
    res.status(404).render('pageNotFound');
});

module.exports = router;