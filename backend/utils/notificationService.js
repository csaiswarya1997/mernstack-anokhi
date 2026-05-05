import nodemailer from 'nodemailer';

// Configure Email Transporter
// NOTE: In production, use environment variables (process.env.EMAIL_USER, etc.)
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like SendGrid or Mailgun
  auth: {
    user: 'your-email@gmail.com', // Update with your email
    pass: 'your-app-password'      // Update with your app password
  }
});

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
        <h1 style="color: #b69a83; margin: 0; font-size: 32px; letter-spacing: 2px;">ANOKHI</h1>
        <p style="text-transform: uppercase; letter-spacing: 3px; font-size: 10px; margin-top: 5px; color: #666;">Boutique & Atelier</p>
      </div>
      
      <div style="border-bottom: 2px solid #f9f6f2; padding-bottom: 20px; margin-bottom: 30px;">
        <h2 style="font-size: 20px; margin-bottom: 10px;">Order Confirmation</h2>
        <p style="font-size: 14px; color: #666;">Dear ${shippingInfo.firstName}, thank you for choosing Anokhi. Your artisanal order has been received and is now being prepared with care.</p>
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
        <p>© 2024 Anokhi Boutique. All rights reserved.</p>
        <p>This is an automated artisanal notification. Please do not reply.</p>
      </div>
    </div>
  `;

  try {
    // In a real scenario, you'd uncomment this once you have valid credentials
    /*
    await transporter.sendMail({
      from: '"Anokhi Boutique" <your-email@gmail.com>',
      to: shippingInfo.email,
      subject: `Anokhi Order Confirmation #${_id.toString().substring(18, 24).toUpperCase()}`,
      html: emailHtml
    });
    */
    console.log(`[EMAIL SIMULATION] Confirmation sent to ${shippingInfo.email} for Order ${_id}`);
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
  const orderId = _id.toString().substring(18, 24).toUpperCase();
  
  const message = `Namaste ${shippingInfo.firstName}! Your Anokhi order #${orderId} for ₹${totalPrice.toLocaleString('en-IN')} is confirmed. We will notify you when your artisanal piece is dispatched. Thank you!`;

  try {
    // Logic for SMS Gateway (Twilio/MSG91/etc.) would go here
    console.log(`[SMS SIMULATION] Message to ${shippingInfo.phone}: ${message}`);
  } catch (error) {
    console.error('Error sending order confirmation SMS:', error);
  }
};
