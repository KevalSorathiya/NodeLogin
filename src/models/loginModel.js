const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
require('dotenv').config();

// Login module schema display here
const loginSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'firstname is required'],
        minlength: [3, 'minimum 3 letter required'],
        trim: true
    },
    lastname: {
        type: String,
        required: [true, 'lastname is required'],
        minlength: [3, 'minimum 3 letter required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email address');
            }
        },
        unique: true,
        trim: true
    },
    phone: {
        type: Number,
        min: [9, "please enter only 10 deigit"],
        required: [true, 'Phone no is required'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 8
    },
    confirmpassword: {
        type: String,
        required: [true, 'Confirm password is required !!'],
        minlength: 8
    },
    gender: {
        type: String,
        required: [true, 'Gender is required !!']
    },
    profile: {
        imgname: {
            type: String,
            required: [true, 'Img name is required']
        },
        extname: {
            type: String,
            required: [true, 'Ext name is required']
        },
        destination: {
            type: String,
            required: [true, 'Img upload path is required']
        },
        date: {
            type: Date,
            default: Date.now()
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    forgotpasswordtoken: {
        type: String,
        default: ''
    }
});

loginSchema.methods.genarateAuthToken = async function() {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(`Error is: ${error}`);
    }
}


loginSchema.pre('save', async function(next) {
    try {
        if (this.isModified('password')) {
            this.password = await bcrypt.hash(this.password, 10);
            this.confirmpassword = await bcrypt.hash(this.confirmpassword, 10);
        }
        return next();
    } catch (error) {
        console.log(error);
    }
});


const register = mongoose.model("register", loginSchema);
module.exports = register;