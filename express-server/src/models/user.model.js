const {Schema, model} = require('mongoose');
const {generateSignedUrl} = require('../utils/index');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
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
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    gender: {
        type: String,
        enum: ["male", "female"]
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

userSchema.post(['find', 'findOne'], async function (docs, next) {
    if (!docs) return next();
    if (Array.isArray(docs)) {
        await Promise.all(
            docs.map(async (doc) => {
                doc.avatar = await generateSignedUrl(doc.avatar);
            })
        );
    } else {
        docs.avatar = await generateSignedUrl(docs.avatar);
    }
    next();
});

const User = model('User', userSchema);

module.exports = User;