const nodemailer = require("nodemailer");

module.exports = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            service: process.env.SERVICE,
            port: Number(process.env.MAIL_PORT),
            secure: Boolean(process.env.SECURE),
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: subject,
            text: text
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.log("Email not sent.");
        console.log(error);
    }
}