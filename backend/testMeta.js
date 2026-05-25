import 'dotenv/config';
import { sendOrderWhatsAppMeta } from './utils/notificationService.js';

const mockOrder = {
  _id: '507f1f77bcf86cd799439011',
  shippingInfo: {
    firstName: 'Meta Test',
    phone: '8921273858', // Replace with the number you want to test
  },
  totalPrice: 1,
};

console.log('--- Starting Meta WhatsApp Test ---');
console.log(`Using Phone ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);

sendOrderWhatsAppMeta(mockOrder)
  .then(() => {
    console.log('--- Meta Test Finished ---');
    process.exit(0);
  })
  .catch((err) => {
    console.error('--- Meta Test Failed ---');
    console.error(err);
    process.exit(1);
  });
