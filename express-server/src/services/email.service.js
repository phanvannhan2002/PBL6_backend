'use strict'

const transport = require('../dbs/init.nodemailer');

class EmailService {
    static async sendEmailResetPassword(toEmail, subject = 'Yêu Cầu Đặt Lại Mật Khẩu', text, html) {
        try {
            const mailOptions = {
                from: process.env.MAIL_NAME,
                to: toEmail,
                subject: subject,
                text,
                html
            }
            await transport.sendMail(mailOptions);
        }catch(err) {
            throw err;
        }
    }
}

module.exports = EmailService;