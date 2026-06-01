import 'dotenv/config';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

// Lazy-initialized Email Transporter
let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      family: 4, // Force IPv4 to prevent ENETUNREACH (IPv6) errors on cloud hosts like Render
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
};

// Generic Email Helper with Brevo HTTP API and SMTP Fallback
const sendEmailHelper = async ({ to, name, subject, html }) => {
  if (process.env.BREVO_API_KEY) {
    try {
      console.log(`[NOTIFICATION] Attempting to send email via Brevo HTTP API to ${to}...`);
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Zaloura Boutique', email: 'zaloura.in@gmail.com' },
          to: [{ email: to, name: name || '' }],
          subject: subject,
          htmlContent: html
        })
      });
      
      const result = await response.json();
      if (response.ok) {
        console.log(`[NOTIFICATION] Email sent via Brevo HTTP API successfully to ${to}`);
        return true;
      } else {
        console.error('[BREVO API ERROR]:', result);
      }
    } catch (error) {
      console.error('Error sending email via Brevo HTTP API:', error);
    }
  }

  // Fallback to standard SMTP
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL SIMULATION] SMTP credentials missing. Simulation for ${to}`);
    return false;
  }

  try {
    await getTransporter().sendMail({
      from: `"Zaloura Boutique" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html
    });
    console.log(`[NOTIFICATION] Email sent via SMTP successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email via SMTP:', error);
    return false;
  }
};

// Lazy-initialized Twilio Client
let twilioClient;
const getTwilioClient = () => {
  if (!twilioClient) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID, 
      process.env.TWILIO_AUTH_TOKEN
    );
  }
  return twilioClient;
};

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

  const customerName = `${shippingInfo.firstName} ${shippingInfo.lastName || ''}`.trim();
  await sendEmailHelper({
    to: shippingInfo.email,
    name: customerName,
    subject: `Zaloura Order Confirmation #${_id.toString().substring(18, 24).toUpperCase()}`,
    html: emailHtml
  });
};

/**
 * Send Shipping Confirmation Email
 * @param {Object} order - The updated order object
 */
export const sendShippingEmail = async (order) => {
  const { _id, shippingInfo, orderItems } = order;
  
  const itemsHtml = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br/>
        <small>Size: ${item.size} | Qty: ${item.quantity}</small>
      </td>
    </tr>
  `).join('');

  const emailHtml = `
    <div style="font-family: 'Playfair Display', serif; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #b69a83; padding: 40px; background-color: #fff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #84624D; margin: 0; font-size: 32px; letter-spacing: 2px;">ZALOURA</h1>
        <p style="text-transform: uppercase; letter-spacing: 3px; font-size: 10px; margin-top: 5px; color: #666;">Boutique & Atelier</p>
      </div>
      
      <div style="border-bottom: 2px solid #f9f6f2; padding-bottom: 20px; margin-bottom: 30px; text-align: center;">
        <h2 style="font-size: 22px; margin-bottom: 10px; color: #84624D; font-style: italic;">On Its Way!</h2>
        <p style="font-size: 14px; color: #666; line-height: 1.6;">Dear ${shippingInfo.firstName}, great news! Your handcrafted masterpiece has been dispatched and is now on its way to you.</p>
        <p style="font-size: 12px; color: #b69a83; font-weight: bold;">Order ID: #${_id.toString().substring(18, 24).toUpperCase()}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f9f6f2;">
            <th style="padding: 10px; text-align: left;">Dispatched Item Details</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="background-color: #f9f6f2; padding: 20px; border-radius: 8px; font-size: 12px; line-height: 1.6;">
        <p style="margin: 0; font-weight: bold; color: #b69a83; text-transform: uppercase; margin-bottom: 5px;">Shipping Destination:</p>
        <p style="margin: 0;">${shippingInfo.address}, ${shippingInfo.city}</p>
        <p style="margin: 0;">${shippingInfo.state} - ${shippingInfo.postalCode}, ${shippingInfo.country}</p>
        <p style="margin: 5px 0 0; font-weight: bold;">Phone: ${shippingInfo.phone}</p>
      </div>

      <div style="text-align: center; margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
        <p>© 2026 Zaloura Boutique. All rights reserved.</p>
        <p>This is an automated shipping notification. Please do not reply.</p>
      </div>
    </div>
  `;

  const customerName = `${shippingInfo.firstName} ${shippingInfo.lastName || ''}`.trim();
  await sendEmailHelper({
    to: shippingInfo.email,
    name: customerName,
    subject: `Your Zaloura Masterpiece has Shipped! #${_id.toString().substring(18, 24).toUpperCase()}`,
    html: emailHtml
  });
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

    await getTwilioClient().messages.create({
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

    const response = await getTwilioClient().messages.create({
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

/**
 * Send Restock Notification Email
 * @param {Object} request - The RestockNotification document
 * @param {string} origin - Frontend origin URL for product redirection
 */
export const sendRestockEmail = async (request, origin) => {
  const { name, email, productName, size, product } = request;
  
  // Robustly determine the frontend URL
  let frontendUrl = process.env.FRONTEND_URL || origin;
  if (!frontendUrl || frontendUrl.includes('localhost:5000') || frontendUrl === 'null' || frontendUrl === 'undefined') {
    frontendUrl = 'http://localhost:5173';
  }
  
  const productUrl = `${frontendUrl}/product/${product}`;

  const emailHtml = `
    <div style="font-family: 'Playfair Display', serif; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #b69a83; padding: 40px; background-color: #fff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #84624D; margin: 0; font-size: 32px; letter-spacing: 2px;">ZALOURA</h1>
        <p style="text-transform: uppercase; letter-spacing: 3px; font-size: 10px; margin-top: 5px; color: #666;">Boutique & Atelier</p>
      </div>
      
      <div style="border-bottom: 2px solid #f9f6f2; padding-bottom: 20px; margin-bottom: 30px; text-align: center;">
        <h2 style="font-size: 22px; margin-bottom: 10px; color: #84624D; font-style: italic;">Back In Stock!</h2>
        <p style="font-size: 14px; color: #666; line-height: 1.6;">Dear ${name}, good news! Your selected masterpiece is back in stock.</p>
      </div>

      <div style="background-color: #f9f6f2; padding: 30px; border-radius: 12px; font-size: 14px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1a1a1a;">${productName}</p>
        <p style="margin: 5px 0 15px; color: #84624D; font-weight: bold;">Size: ${size}</p>
        
        <a href="${productUrl}" style="display: inline-block; background-color: #84624D; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          Acquire Masterpiece
        </a>
      </div>

      <p style="font-size: 12px; color: #666; line-height: 1.6; text-align: center;">
        Due to high request rates, inventory is extremely limited and we cannot guarantee availability. We recommend checking out as soon as possible.
      </p>

      <div style="text-align: center; margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
        <p>© 2026 Zaloura Boutique. All rights reserved.</p>
        <p>This is an automated restock alert. Please do not reply.</p>
      </div>
    </div>
  `;

  await sendEmailHelper({
    to: email,
    name: name,
    subject: `Restocked! ${productName} (Size ${size}) is now available`,
    html: emailHtml
  });
};
