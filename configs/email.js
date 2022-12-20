const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'backend@unravelstudios.co',
        pass: 'dzfwsccqdapesnrq',
    }
});


module.exports = transporter;