const QRCode = require('qrcode');

/**
 * Generates a base64-encoded QR Code image data URL containing booking validation token details.
 * @param {Object} bookingData - Metadata containing bookingId, userId, slotId, and verificationToken.
 * @returns {Promise<String>} dataUrl
 */
const generateBookingQR = async (bookingData) => {
  try {
    // Encapsulate booking verification details
    const payload = JSON.stringify({
      bookingId: bookingData.bookingId,
      userId: bookingData.userId,
      slotId: bookingData.slotId,
      token: bookingData.verificationToken
    });

    const qrDataUrl = await QRCode.toDataURL(payload, {
      color: {
        dark: '#0f172a', // Slate 900
        light: '#ffffff'
      },
      margin: 1,
      width: 256
    });

    return qrDataUrl;
  } catch (error) {
    console.error('QR Code Generation Error:', error.message);
    throw new Error('Failed to generate QR Code ticket');
  }
};

module.exports = { generateBookingQR };
