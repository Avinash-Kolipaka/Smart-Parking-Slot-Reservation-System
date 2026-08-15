const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const createTransporter = () => {
  // Check if SMTP configuration is set
  if (
    process.env.SMTP_USER &&
    process.env.SMTP_USER !== 'your_smtp_user' &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== 'your_pass'
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Return null if credentials are the default placeholder or empty, to trigger console fallback
  return null;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM || 'noreply@smartparking.com';

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"ParkOps" <${from}>`,
        to,
        subject,
        text,
        html
      });
      logger.info(`Email sent successfully: ${info.messageId}`, { to });
      return true;
    } catch (error) {
      logger.error(`Error sending email to ${to}: ${error.message}`);
      return false;
    }
  } else {
    // Development fallback: Log email content via structured logger
    logger.info('Mail service simulator (no SMTP configured)', {
      to,
      from,
      subject,
      textLength: text ? text.length : 0,
      htmlLength: html ? html.length : 0
    });
    return true;
  }
};

const sendBookingConfirmation = async (email, name, bookingDetails) => {
  const subject = `Booking Confirmed - Ticket #${bookingDetails.bookingId}`;
  const text = `Hi ${name},\n\nYour parking slot reservation for slot ${bookingDetails.slotNumber} at ${bookingDetails.locationName} is confirmed!\n\nDate: ${bookingDetails.date}\nTime: ${bookingDetails.time}\nAmount Paid: $${bookingDetails.amount}\n\nPlease check in using the QR code in your dashboard.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Booking Confirmed!</h2>
      <p>Dear ${name},</p>
      <p>Your parking reservation is confirmed. Here are your booking details:</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${bookingDetails.locationName}</p>
        <p style="margin: 5px 0;"><strong>Slot:</strong> ${bookingDetails.slotNumber} (Floor ${bookingDetails.floor})</p>
        <p style="margin: 5px 0;"><strong>Vehicle:</strong> ${bookingDetails.vehicleNumber} (${bookingDetails.vehicleType})</p>
        <p style="margin: 5px 0;"><strong>Time Window:</strong> ${bookingDetails.time}</p>
        <p style="margin: 5px 0;"><strong>Duration:</strong> ${bookingDetails.duration} Hour(s)</p>
        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${bookingDetails.amount.toFixed(2)}</p>
      </div>

      <p>Please present the QR Code ticket found in your booking history when checking in at the location.</p>
      <p style="font-size: 13px; color: #64748b; margin-top: 20px;">Thank you for using Smart Parking! For support, contact support@smartparking.com.</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

const sendPasswordReset = async (email, name, resetUrl) => {
  const subject = 'Password Reset Request - Smart Parking';
  const text = `Hi ${name},\n\nYou requested a password reset. Please click on the link below or copy and paste it into your browser to reset your password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Reset Password</h2>
      <p>Dear ${name},</p>
      <p>You received this email because a password reset request was made for your account. Please click the button below to choose a new password:</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>

      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">This link is valid for 10 minutes. If the button above does not work, copy and paste this URL into your web browser:<br>${resetUrl}</p>
    </div>
  `;

  return await sendEmail({ to: email, subject, text, html });
};

const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to ParkOps — Smart Parking Platform';
  const text = `Hi ${name},\n\nWelcome to ParkOps! Your account has been registered successfully. You can now browse locations, reserve parking slots, and manage your passes.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Welcome to ParkOps!</h2>
      <p>Dear ${name},</p>
      <p>Thank you for registering with ParkOps. Your account is active and ready to use.</p>
      <p style="font-size: 13px; color: #64748b; margin-top: 20px;">If you have any questions, contact support@parkops.local.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, text, html });
};

const sendBookingCancellation = async (email, name, bookingId) => {
  const subject = `Booking Cancelled - #${bookingId}`;
  const text = `Hi ${name},\n\nYour booking #${bookingId} has been cancelled. If applicable, refund processing has been initiated.`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
      <h2 style="color: #dc2626; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Booking Cancelled</h2>
      <p>Dear ${name},</p>
      <p>Your booking <strong>#${bookingId}</strong> has been successfully cancelled.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, text, html });
};

const sendCheckInNotification = async (email, name, bookingId, time) => {
  const subject = `Checked In - Booking #${bookingId}`;
  const text = `Hi ${name},\n\nYou have checked in for booking #${bookingId} at ${time}. Enjoy your parking!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
      <h2 style="color: #16a34a; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Check-In Confirmed</h2>
      <p>Dear ${name},</p>
      <p>You have successfully checked in for booking <strong>#${bookingId}</strong> at ${time}.</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, text, html });
};

const sendCheckOutNotification = async (email, name, bookingId, time, totalAmount) => {
  const subject = `Checked Out - Booking #${bookingId}`;
  const text = `Hi ${name},\n\nYou have checked out for booking #${bookingId} at ${time}. Total billing amount: ₹${totalAmount}. Thank you for parking with us!`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Check-Out Complete</h2>
      <p>Dear ${name},</p>
      <p>Your parking session for booking <strong>#${bookingId}</strong> has ended at ${time}.</p>
      <p><strong>Total Paid:</strong> ₹${totalAmount}</p>
    </div>
  `;
  return await sendEmail({ to: email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendPasswordReset,
  sendWelcomeEmail,
  sendBookingCancellation,
  sendCheckInNotification,
  sendCheckOutNotification
};
