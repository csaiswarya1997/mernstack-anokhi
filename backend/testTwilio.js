import 'dotenv/config';
import { sendOrderSMS, sendOrderWhatsApp } from './utils/notificationService.js';

const mockOrder = {
  _id: '507f1f77bcf86cd799439011',
  shippingInfo: {
    firstName: 'Twilio Test',
    phone: '8921273858', // Replace with the number you want to test
  },
  totalPrice: 1,
};

console.log('--- Starting Twilio Test ---');
console.log(`Using SID: ${process.env.TWILIO_ACCOUNT_SID}`);
console.log(`Testing Phone: ${mockOrder.shippingInfo.phone}`);

async function runTest() {
  console.log('\n1. Testing SMS...');
  await sendOrderSMS(mockOrder);

  console.log('\n2. Testing WhatsApp...');
  await sendOrderWhatsApp(mockOrder);
}

runTest().then(() => {
  console.log('\n--- Twilio Test Finished ---');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
