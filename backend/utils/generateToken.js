import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'anokhi_secret_123', {
    expiresIn: '30d',
  });
};

export default generateToken;
