import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client = null;

// Debug logging
// console.log('SMS Service Loading...');
// console.log('TWILIO_ACCOUNT_SID:', accountSid ? '✓ Present' : '✗ Missing');
// console.log('TWILIO_AUTH_TOKEN:', authToken ? '✓ Present' : '✗ Missing');
// console.log('TWILIO_PHONE_NUMBER:', fromPhoneNumber ? '✓ Present (' + fromPhoneNumber + ')' : '✗ Missing');

// Initialize Twilio client if credentials are available
if (accountSid && authToken && fromPhoneNumber) {
  try {
    client = twilio(accountSid, authToken);
    // console.log('✅ Twilio client initialized successfully');
  } catch (error) {
    // console.error('❌ Error initializing Twilio client:', error.message);
  }
}

/**
 * Format phone number for SMS
 * If phone doesn't start with +, add country code (default: +91 for India)
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Remove any spaces, dashes, or other characters except digits and +
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // If already has country code, return as is
  if (cleanPhone.startsWith('+')) {
    return cleanPhone;
  }
  
  // Remove leading 0 if present
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // Add +91 country code for Indian numbers (default for this project)
  return '+91' + cleanPhone;
};

/**
 * Send SMS notification for order confirmation
 */
export const sendOrderConfirmationSMS = async (phoneNumber, orderId, customerName) => {
  // console.log('📱 [SMS] sendOrderConfirmationSMS called:', { phoneNumber, orderId, customerName });
  
  if (!client) {
    // console.warn('⚠️  Twilio SMS service not configured. SMS will not be sent.');
    // console.warn('   To enable SMS, configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env');
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  // console.log('📱 [SMS] Formatted phone:', formattedPhone);
  
  if (!formattedPhone) {
    // console.error('❌ [SMS] Invalid phone number format:', phoneNumber);
    return false;
  }

  try {
    // console.log('📱 [SMS] Sending confirmation SMS to:', formattedPhone);
    const message = await client.messages.create({
      body: `Hi ${customerName}! Your order #${orderId} has been confirmed. We'll notify you when it ships. Thank you for shopping with us!`,
      from: fromPhoneNumber,
      to: formattedPhone
    });

    // console.log(`✅ [SMS] Order confirmation SMS sent to ${formattedPhone}. Message SID: ${message.sid}`);
    return true;
  } catch (error) {
    // console.error('❌ [SMS] Error sending order confirmation SMS:', error.message);
    // console.error('❌ [SMS] Full error:', error);
    return false;
  }
};

/**
 * Send SMS notification for order cancellation
 */
export const sendOrderCancelledSMS = async (phoneNumber, orderId, customerName) => {
  if (!client) {
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    return false;
  }

  try {
    const message = await client.messages.create({
      body: `Hi ${customerName}! Your order #${orderId} has been cancelled. Your refund will be processed within 5-7 business days. Thank you for shopping with us!`,
      from: fromPhoneNumber,
      to: formattedPhone
    });

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Send SMS notification for delivery
 */
export const sendDeliverySMS = async (phoneNumber, orderId, customerName) => {
  if (!client) {
    console.warn('⚠️  Twilio SMS service not configured. SMS will not be sent.');
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    console.error('Invalid phone number format:', phoneNumber);
    return false;
  }

  try {
    const message = await client.messages.create({
      body: `Hi ${customerName}! Your order #${orderId} has been delivered! Thank you for shopping with us. We hope you enjoy your purchase!`,
      from: fromPhoneNumber,
      to: formattedPhone
    });

    console.log(`✅ Delivery SMS sent to ${formattedPhone}. Message SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending delivery SMS:', error.message);
    return false;
  }
};

/**
 * Send SMS notification for shipment
 */
export const sendShipmentSMS = async (phoneNumber, orderId, customerName, trackingNumber) => {
  if (!client) {
    console.warn('⚠️  Twilio SMS service not configured. SMS will not be sent.');
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    console.error('Invalid phone number format:', phoneNumber);
    return false;
  }

  try {
    const message = await client.messages.create({
      body: `Hi ${customerName}! Your order #${orderId} has shipped! Track your package: ${trackingNumber}. Estimated delivery in 5-7 days.`,
      from: fromPhoneNumber,
      to: formattedPhone
    });

    console.log(`✅ Shipment SMS sent to ${formattedPhone}. Message SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending shipment SMS:', error.message);
    return false;
  }
};

/**
 * Send SMS notification for out-for-delivery
 */
export const sendOutForDeliverySMS = async (phoneNumber, orderId, customerName) => {
  if (!client) {
    console.warn('⚠️  Twilio SMS service not configured. SMS will not be sent.');
    return false;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    console.error('Invalid phone number format:', phoneNumber);
    return false;
  }

  try {
    const message = await client.messages.create({
      body: `Hi ${customerName}! Your order #${orderId} is out for delivery today! Please be available to receive it.`,
      from: fromPhoneNumber,
      to: formattedPhone
    });

    console.log(`✅ Out-for-delivery SMS sent to ${formattedPhone}. Message SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending out-for-delivery SMS:', error.message);
    return false;
  }
};

/**
 * Verify SMS service configuration
 */
export const verifySMSConfig = async () => {
  if (!client) {
    // console.warn('⚠️  SMS Service: Not configured. Twilio credentials missing.');
    return false;
  }

  try {
    const account = await client.api.accounts.list({ limit: 1 });
    if (account.length > 0) {
      // console.log('✅ SMS service is properly configured');
      return true;
    }
  } catch (error) {
    // console.error('SMS service verification failed:', error.message);
    return false;
  }
};
