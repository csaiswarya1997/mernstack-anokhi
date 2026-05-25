import 'dotenv/config';
import { sendOrderEmail } from './utils/notificationService.js';

const mockOrder = {
  _id: '507f1f77bcf86cd799439011', // Dummy MongoDB ID
  shippingInfo: {
    firstName: 'Test',
    lastName: 'User',
    email: 'aromalvv005@gmail.com', // Sending to yourself for testing
    phone: '1234567890',
    address: '123 Boutique Lane',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '400001'
  },
  totalPrice: 1599,
  orderItems: [
    {
      name: 'Artisanal Silk Saree',
      size: 'Free',
      quantity: 1,
      price: 1599
    }
  ]
};

console.log('--- Starting Email Test ---');
console.log(`Using Email User: ${process.env.EMAIL_USER}`);

sendOrderEmail(mockOrder)
  .then(() => {
    console.log('--- Email Test Finished ---');
    console.log('Check your inbox (and spam folder) for the test email.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('--- Email Test Failed ---');
    console.error(err);
    process.exit(1);
  });
