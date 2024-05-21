const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASSWORD,
  },
});

const sendMail = async (email, otp, name) => {
  const logoPath = path.join(__dirname, 'assets', 'logo.png'); // Path to your local logo image

  const mailOptions = {
    from: '"Quippy" <apoorvbraj@gmail.com>',
    to: email,
    subject: 'Verification OTP',
    html: `
      <div style="text-align: center;">
        <img src="cid:unique@logo.png" alt="Quippy Logo" style="width: 50%; max-width: 300px; height: auto;" />
        <h1>Hello ${name},</h1>
        <p>Welcome to Quippy,</p>
        <p>This is your one-time password: <strong>${otp}</strong></p>
      </div>
    `,
    attachments: [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'unique@logo.png', // Same CID as in the html img src
      },
    ],
  };

  await transporter.sendMail(mailOptions);
  console.log('email sent');
};

module.exports = sendMail;
