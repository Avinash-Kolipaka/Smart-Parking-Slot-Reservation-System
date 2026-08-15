const QRCode = require('qrcode');
const crypto = require('crypto');
const logger = require('../utils/logger');

const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured. Cannot sign QR codes.');
  }
  return secret;
};

/**
 * Generates a signed, secure base64 QR Code image data URL.
 */
const generateBookingQR = async (bookingData) => {
  try {
    const timestamp = Date.now();
    const payloadData = {
      bookingId: bookingData.bookingId,
      userId: bookingData.userId.toString(),
      slotId: bookingData.slotId.toString(),
      token: bookingData.verificationToken,
      ts: timestamp
    };

    // Create HMAC signature over payload
    const signature = crypto
      .createHmac('sha256', getSecretKey())
      .update(`${payloadData.bookingId}:${payloadData.userId}:${payloadData.token}:${timestamp}`)
      .digest('hex');

    const signedPayload = JSON.stringify({
      ...payloadData,
      sig: signature
    });

    const qrDataUrl = await QRCode.toDataURL(signedPayload, {
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      margin: 1,
      width: 256
    });

    return qrDataUrl;
  } catch (error) {
    logger.error(`QR Code Generation Error: ${error.message}`);
    throw new Error('Failed to generate QR Code ticket');
  }
};

/**
 * Validates HMAC signature and decodes QR payload.
 */
const verifyQRPayload = (rawPayload) => {
  try {
    let payload;
    if (typeof rawPayload === 'string') {
      payload = JSON.parse(rawPayload);
    } else {
      payload = rawPayload;
    }

    if (!payload || !payload.bookingId || !payload.sig) {
      return { valid: false, message: 'Malformed QR payload' };
    }

    const { bookingId, userId, token, ts, sig } = payload;

    const expectedSignature = crypto
      .createHmac('sha256', getSecretKey())
      .update(`${bookingId}:${userId}:${token}:${ts}`)
      .digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature))) {
      return { valid: true, payload };
    } else {
      return { valid: false, message: 'QR Code signature verification failed. Tampered payload.' };
    }
  } catch (err) {
    return { valid: false, message: `Invalid QR Code structure: ${err.message}` };
  }
};

module.exports = {
  generateBookingQR,
  verifyQRPayload
};
