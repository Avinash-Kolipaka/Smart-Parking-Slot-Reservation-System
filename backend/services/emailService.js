const nodemailer = require('nodemailer');

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
        from: `"Smart Parking Support" <${from}>`,
        to,
        subject,
        text,
        html
      });
      console.log(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error.message);
      return false;
    }
  } else {
    // Development fallback: Log email content to console
    console.log('\n================= MAIL SERVICE SIMULATOR =================');
    console.log(`TO:      ${to}`);
    console.log(`FROM:    ${from}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TEXT:    ${text}`);
    console.log(`HTML:    Included (Length: ${html.length} chars)`);
    console.log('==========================================================\n');
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

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendPasswordReset
};
