const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    avatar: {
        type: String,
    },
    dateOfBirth: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    passwordChangeAt: {
        type: Date,
    }
});

const User = model('User', userSchema);

module.exports = User;