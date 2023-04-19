require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
})

const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to: process.env.EMAIL_RECEIVER,
    Subject: "Pending Request Message"
}

module.exports = { transporter, mailOptions };