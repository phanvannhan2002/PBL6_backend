'use strict'

const nodemailer = require('nodemailer');
require('dotenv').config();

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_NAME,
        pass: process.env.GMAIL_PASSWORD
    }
});

module.exports = transport;