const nodemailer = require('nodemailer');
require('dotenv').config({ path: './config.env' });

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'AttendEase - Login OTP Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AttendEase</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">MNIT Jaipur Attendance Tracker</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Login Verification</h2>
            <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6;">
              You have requested to login to your AttendEase account. Please use the following OTP to complete your login:
            </p>
            
            <div style="background: #fff; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h3 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${otp}</h3>
            </div>
            
            <p style="color: #666; margin: 20px 0; font-size: 14px;">
              <strong>Important:</strong>
            </p>
            <ul style="color: #666; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>This OTP is valid for 10 minutes only</li>
              <li>Do not share this OTP with anyone</li>
              <li>If you didn't request this login, please ignore this email</li>
            </ul>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                This is an automated email from AttendEase. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after successful registration
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to AttendEase!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to AttendEase!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">MNIT Jaipur Attendance Tracker</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${name}!</h2>
            <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6;">
              Welcome to AttendEase! Your account has been successfully created. You can now:
            </p>
            
            <ul style="color: #666; margin: 20px 0; padding-left: 20px;">
              <li>Track your attendance for all subjects</li>
              <li>View your personalized timetable</li>
              <li>Monitor your attendance percentage</li>
              <li>Access your calendar view</li>
            </ul>
            
            <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #2e7d32; margin: 0; font-weight: bold;">Your account is now active and ready to use!</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                Thank you for choosing AttendEase for your attendance tracking needs.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Welcome email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset OTP email
const sendPasswordResetOTP = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'AttendEase - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AttendEase</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">MNIT Jaipur Attendance Tracker</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Password Reset Request</h2>
            <p style="color: #666; margin: 0 0 20px 0; line-height: 1.6;">
              You have requested to reset your password for your AttendEase account. Please use the following OTP to reset your password:
            </p>
            
            <div style="background: #fff; border: 2px dashed #ff6b6b; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h3 style="color: #ff6b6b; margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${otp}</h3>
            </div>
            
            <p style="color: #666; margin: 20px 0; font-size: 14px;">
              <strong>Important:</strong>
            </p>
            <ul style="color: #666; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>This OTP is valid for 10 minutes only</li>
              <li>Use this OTP to set a new password</li>
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>For security, do not share this OTP with anyone</li>
            </ul>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-weight: bold;">🔐 Keep your account secure!</p>
              <p style="color: #856404; margin: 5px 0 0 0; font-size: 12px;">After resetting, all your existing login sessions will be invalidated for security.</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
              <p style="color: #999; margin: 0; font-size: 12px;">
                This is an automated email from AttendEase. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Password reset email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTP,
  sendWelcomeEmail,
  sendPasswordResetOTP
};
