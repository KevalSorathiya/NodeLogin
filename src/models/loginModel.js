const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');


const loginSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'firstname is required'],
        minLength: 3,
        trim: true
    },
    lastname: {
        type: String,
        required: [true, 'lastname is required'],
        minLength: 3,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email address !!');
            }
        },
        unique: true,
        trim: true
    },
    phone: {
        type: Number,
        required: [true, 'Phone no is required !!'],
        min: 10,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required !!'],
        minLength: 8,
        maxLength: 14
    },
    confirmpassword: {
        type: String,
        required: [true, 'Confirm password is required !!'],
        minLength: 8,
        maxLength: 14
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

});

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