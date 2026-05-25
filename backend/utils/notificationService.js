import 'dotenv/config';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Configure Twilio Client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID, 
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send Order Confirmation Email
 * @param {Object} order - The created order object
 */
export const sendOrderEmail = async (order) => {
  const { _id, shippingInfo, totalPrice, orderItems } = order;
  
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br/>
        <small>Size: ${item.size} | Qty: ${item.quantity}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ₹${(item.price * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const emailHtml = `
    <div style="font-family: 'Playfair Display', serif; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #b69a83; padding: 40px; background-color: #fff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #84624D; margin: 0; font-size: 32px; letter-spacing: 2px;">ZALOURA</h1>
        <p style="text-transform: uppercase; letter-spacing: 3px; font-size: 10px; margin-top: 5px; color: #666;">Boutique & Atelier</p>
      </div>
      
      <div style="border-bottom: 2px solid #f9f6f2; padding-bottom: 20px; margin-bottom: 30px;">
        <h2 style="font-size: 20px; margin-bottom: 10px;">Order Confirmation</h2>
        <p style="font-size: 14px; color: #666;">Dear ${shippingInfo.firstName}, thank you for choosing Zaloura. Your artisanal order has been received and is now being prepared with care.</p>
        <p style="font-size: 12px; color: #b69a83; font-weight: bold;">Order ID: #${_id.toString().substring(18, 24).toUpperCase()}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f9f6f2;">
            <th style="padding: 10px; text-align: left;">Item Details</th>
            <th style="padding: 10px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 20px 10px 10px; text-align: right; font-weight: bold;">Grand Total</td>
            <td style="padding: 20px 10px 10px; text-align: right; font-weight: bold; color: #b69a83; font-size: 18px;">₹${totalPrice.toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background-color: #f9f6f2; padding: 20px; border-radius: 8px; font-size: 12px; line-height: 1.6;">
        <p style="margin: 0; font-weight: bold; color: #b69a83; text-transform: uppercase; margin-bottom: 5px;">Shipping To:</p>
        <p style="margin: 0;">${shippingInfo.address}, ${shippingInfo.city}</p>
        <p style="margin: 0;">${shippingInfo.state} - ${shippingInfo.postalCode}, ${shippingInfo.country}</p>
        <p style="margin: 5px 0 0; font-weight: bold;">Phone: ${shippingInfo.phone}</p>
      </div>

      <div style="text-align: center; margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; pt-20px;">
        <p>© 2024 Zaloura Boutique. All rights reserved.</p>
        <p>This is an automated artisanal notification. Please do not reply.</p>
      </div>
    </div>
  `;

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[EMAIL SIMULATION] Credentials missing. Confirmation for ${shippingInfo.email}`);
      return;
    }

    await transporter.sendMail({
      from: `"Zaloura Boutique" <${process.env.EMAIL_USER}>`,
      to: shippingInfo.email,
      subject: `Zaloura Order Confirmation #${_id.toString().substring(18, 24).toUpperCase()}`,
      html: emailHtml
    });
    
    console.log(`[NOTIFICATION] Confirmation Email sent to ${shippingInfo.email}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

/**
 * Send Order Confirmation SMS
 * @param {Object} order - The created order object
 */
export const sendOrderSMS = async (order) => {
  const { _id, shippingInfo, totalPrice } = order;
  
  if (!shippingInfo || !shippingInfo.phone) {
    console.error('[NOTIFICATION ERROR] Missing shipping phone for SMS');
    return;
  }

  const orderId = _id.toString().substring(18, 24).toUpperCase();
  const message = `Namaste ${shippingInfo.firstName}! Your Zaloura order #${orderId} for ₹${totalPrice.toLocaleString('en-IN')} is confirmed. We will notify you when your artisanal piece is dispatched. Thank you!`;

  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log(`[SMS SIMULATION] Credentials missing. Message to ${shippingInfo.phone}: ${message}`);
      return;
    }

    const phoneStr = shippingInfo.phone.toString();
    const recipientPhone = phoneStr.startsWith('+') ? phoneStr : `+91${phoneStr}`;

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipientPhone
    });

    console.log(`[NOTIFICATION] Confirmation SMS sent to ${shippingInfo.phone}`);
  } catch (error) {
    console.error('Error sending order confirmation SMS:', error);
  }
};

/**
 * Send Order Confirmation WhatsApp via Twilio
 * @param {Object} order - The created order object
 */
export const sendOrderWhatsAppTwilio = async (order) => {
  const { _id, shippingInfo, totalPrice } = order;
  
  if (!shippingInfo || !shippingInfo.phone) {
    console.error('[NOTIFICATION ERROR] Missing shipping phone for WhatsApp');
    return;
  }

  const orderId = _id.toString().substring(18, 24).toUpperCase();
  const message = `✨ *Zaloura Order Confirmed* ✨\n\nNamaste ${shippingInfo.firstName},\n\nYour artisanal order *#${orderId}* for *₹${totalPrice.toLocaleString('en-IN')}* has been successfully placed. \n\nWe are now preparing your pieces with the utmost care. You will receive an update once they are shipped.\n\nThank you for choosing elegance.\n\n_Team Zaloura_`;

  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
      console.log(`[WHATSAPP SIMULATION] Twilio Credentials missing.`);
      return;
    }

    const phoneStr = shippingInfo.phone.toString();
    const recipientPhone = phoneStr.startsWith('+') ? phoneStr : `+91${phoneStr}`;

    const response = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${recipientPhone}`
    });

    console.log(`[NOTIFICATION] Twilio WhatsApp sent to ${shippingInfo.phone}. SID: ${response.sid}`);
  } catch (error) {
    console.error('Error sending Twilio WhatsApp:', error);
  }
};

/**
 * Send Order Confirmation WhatsApp via Meta Cloud API
 * @param {Object} order - The created order object
 */
export const sendOrderWhatsAppMeta = async (order) => {
  const { _id, shippingInfo, totalPrice } = order;
  
  if (!shippingInfo || !shippingInfo.phone) {
    console.error('[NOTIFICATION ERROR] Missing shipping phone for Meta WhatsApp');
    return;
  }

  const orderId = _id.toString().substring(18, 24).toUpperCase();
  const rawPhone = shippingInfo.phone.toString().replace(/\D/g, ''); 
  const recipientPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

  const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  // Meta Setup: Initial message must usually be a template if session is not open.
  const data = {
    messaging_product: "whatsapp",
    to: recipientPhone,
    type: "template",
    template: {
      name: "hello_world", // Using default Meta test template
      language: { code: "en_US" }
    }
  };

  try {
    if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      console.log(`[META SIMULATION] Meta Credentials missing.`);
      return;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`[NOTIFICATION] Meta WhatsApp sent successfully to ${recipientPhone}. ID: ${result.messages[0].id}`);
    } else {
      console.error('[META ERROR]', result.error);
    }
  } catch (error) {
    console.error('Error sending Meta WhatsApp:', error);
  }
};

/**
 * Main WhatsApp Dispatcher
 * @param {Object} order - The created order object
 */
export const sendOrderWhatsApp = async (order) => {
  // If Meta credentials exist, prioritize Meta (Free tier)
  if (process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_TOKEN !== "your_meta_access_token_here") {
    return sendOrderWhatsAppMeta(order);
  }
  // Otherwise fallback to Twilio
  return sendOrderWhatsAppTwilio(order);
};
