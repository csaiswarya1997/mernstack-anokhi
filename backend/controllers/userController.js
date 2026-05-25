import User from '../models/User.js';
import Order from '../models/Order.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use $addToSet to prevent duplicates atomically
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { wishlist: productId }
    });

    res.status(201).json({ message: 'Product added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { wishlist: req.params.id }
    });

    res.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (user) {
      // Filter out any null products (e.g. if a product was deleted)
      const validWishlist = user.wishlist.filter(item => item !== null);
      res.json(validWishlist);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  console.log('--- UPDATE PROFILE START ---');
  console.log('Body:', req.body);
  console.log('User ID:', req.user?._id);
  
  try {
    const user = await User.findById(req.user._id);
    console.log('User found in DB:', user ? 'YES' : 'NO');

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password && req.body.password.trim() !== '') {
        console.log('Updating password...');
        user.password = req.body.password;
      }

      console.log('Attempting user.save()...');
      const updatedUser = await user.save();
      console.log('user.save() successful');

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
      console.log('--- UPDATE PROFILE SUCCESS ---');
    } else {
      console.log('User not found in DB');
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('--- UPDATE PROFILE ERROR ---');
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get users who have purchased
// @route   GET /api/users/purchased
// @access  Private (Admin)
const getPurchasedUsers = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email');
    const usersMap = {};

    orders.forEach(order => {
      const email = order.shippingInfo?.email || order.user?.email || 'unknown@example.com';
      const name = order.shippingInfo ? `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}` : (order.user?.name || 'Guest');
      const phone = order.shippingInfo?.phone || 'N/A';
      const userId = order.user?._id || null;

      if (!usersMap[email]) {
        usersMap[email] = {
          _id: userId,
          name,
          email,
          phone,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: order.createdAt,
          orders: []
        };
      }

      usersMap[email].totalOrders += 1;
      usersMap[email].totalSpent += order.totalPrice;
      if (new Date(order.createdAt) > new Date(usersMap[email].lastOrderDate)) {
        usersMap[email].lastOrderDate = order.createdAt;
      }
      usersMap[email].orders.push({
        orderId: order._id,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt
      });
    });

    const purchasedUsers = Object.values(usersMap).sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate));
    res.json(purchasedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Reset a user's password (by admin)
// @route   PUT /api/users/:id/reset-password
// @access  Private (Admin)
const resetUserPassword = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (!password || password.trim() === '') {
        return res.status(400).json({ message: 'Password is required' });
      }
      user.password = password;
      await user.save();
      res.json({ message: `Password reset successfully for ${user.name}` });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export { authUser, registerUser, getUserProfile, updateUserProfile, addToWishlist, removeFromWishlist, getWishlist, getPurchasedUsers, resetUserPassword };

