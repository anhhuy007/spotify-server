import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "OTP for password reset - Spotify Clone",
    html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>OTP for Password Reset</h2>
                <p>Your OTP is <strong>${otp}</strong>. Please keep it safe. It will expire in 5 minutes.</p>
                <p>If you did not request this OTP, please ignore this email.</p>
                <p>Thank you,<br>Spotify Clone Team</p>
            </div>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent");
  } catch (error) {
    console.log(error);
  }
}

export default { sendOTP };
