const express = require('express');
const router = express.Router();
const register = require('../models/loginModel');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const auth = require('../middleware/authMiddleware');
let upload_path = path.join(__dirname, "../../uploads");

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

router.get('/forgetpassword', (req, res) => {
    res.status(201).render('forgetpassword');
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
            res.status(402).send("password and confirm password are not same");
        }
    } catch (error) {
        console.error(error);
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
                res.status(403).render('please enter valid password');
            }
        } else {
            res.status(404).send('please enter valid email address !!!!');
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