const express = require('express');
const router = express.Router();
const register = require('../models/loginModel');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

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

router.get('/login', (req, res) => {
    res.status(201).render('login');
})

router.get('/register', (req, res) => {
    res.status(201).render('register');
});

router.post('/register', uploadImg.single('profile'), async(req, res) => {
    try {
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
        let saveData = new register(data);
        let savedData = await saveData.save();
        if (!savedData) {
            res.status(401).send("Data is not saved successfully");
        } else {
            res.status(201).render('login');
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