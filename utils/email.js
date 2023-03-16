const nodemailer = require('nodemailer');
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {

    constructor(user, url) {

        this.to = user.email,
            this.firstName = user.name.split(' ')[0],
            this.url = url,
            this.from = `Hamada Zaid <${process.env.EMAIL_FROM}>`
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // Sendgrid
            return nodemailer.createTransport({
                service: 'SendGrid', // sendGrid is a pre-defined service 
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        }

        // ELSE (DEVELOPMENT) => SEND TO MAILTRAP
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }


    // send the actual email
    async send(template, subject) {
        // 1) Render HTML based on a pug template
        const html = pug.renderFile(`${__dirname}//../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });
        // 2) Define email options

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            // htmlToText.fromString HAS BEEN REMOVED ==> you can use (convert OR htmlToText)
            text: htmlToText.htmlToText(html)
            // PURE TEXT: It's actually really important because it's better for email delivery rates and also for spam folders. And also some people just prefer plain simple text emails instead of having the more formatted HTML emails.
        };


        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);

    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the natours family!');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset token (Valid for only 10 minutes)');
    }
}