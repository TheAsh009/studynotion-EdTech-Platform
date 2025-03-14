const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.NAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: "StudyNotion || CodeHelp - by Ashitosh",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    console.log(info);
    return info;
  } catch (error) {
    console.log("Error Occred in the mailsender", error.message);
  }
};

module.exports = mailSender;
