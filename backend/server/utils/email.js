const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER === 'your_email@gmail.com') {
      console.warn('⚠️ EMAIL_USER or EMAIL_PASS is not properly configured in .env. Skipping real email dispatch.');
      console.log('Dummy Email Log:', {
        To: options.email,
        Subject: options.subject,
        Content: options.text || 'HTML Content'
      });
      return; 
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Sweet Delights Marketplace" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${options.email}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

module.exports = sendEmail;
