var express = require('express');
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
transporter = nodemailer.createTransport({
    // host: 'mail.di.com',
    host: 'mail.dimensionindia.com',
    port: 25,
    secure: false, // true for 465, false for other ports
    // auth: {
    //     user: 'noreply@dimensionindia.com', // generated ethereal user
    //     pass: '' // generated ethereal password
    // },
    tls: {
        rejectUnauthorized: false //See the https://github.com/nodemailer/nodemailer/issues/406
    }
});
 

module.exports = transporter;

