import Product from '../models/Product.js';

const generateProductCode = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'ZAL-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const keyword = req.query.keyword || '';
    const category = req.query.category || '';
    const priceRange = req.query.priceRange || '';

    // If any paginated/filtering query parameter is provided, trigger the paginated response
    const isPaginatedQuery = req.query.page || req.query.limit || req.query.keyword || req.query.category || req.query.priceRange;

    let query = {};
    let andConditions = [];

    // 1. Keyword search (Name, description, category, productCode)
    if (keyword) {
      andConditions.push({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { category: { $regex: keyword, $options: 'i' } },
          { productCode: { $regex: keyword, $options: 'i' } }
        ]
      });
    }

    // 2. Category filter (supports comma-separated list of categories)
    if (category) {
      const categories = category.split(',');
      andConditions.push({
        category: { $in: categories.map(c => new RegExp(`^${c}$`, 'i')) }
      });
    }

    // 3. Price range filter (supports comma-separated list of ranges)
    if (priceRange) {
      const ranges = priceRange.split(',');
      const priceConditions = [];
      for (const range of ranges) {
        if (range === 'under1k') priceConditions.push({ price: { $lt: 1000 } });
        else if (range === '1kTo2k') priceConditions.push({ price: { $gte: 1000, $lte: 2000 } });
        else if (range === 'over2k') priceConditions.push({ price: { $gt: 2000 } });
      }
      if (priceConditions.length > 0) {
        andConditions.push({ $or: priceConditions });
      }
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const sort = { createdAt: -1 };

    if (isPaginatedQuery) {
      const actualLimit = limit || 8;
      const actualPage = page || 1;

      const total = await Product.countDocuments(query);
      let products = await Product.find(query)
        .sort(sort)
        .skip((actualPage - 1) * actualLimit)
        .limit(actualLimit);

      // Backfill missing product codes if any
      let needsRefresh = false;
      for (let product of products) {
        if (!product.productCode) {
          product.productCode = generateProductCode();
          await product.save();
          needsRefresh = true;
        }
      }
      if (needsRefresh) {
        products = await Product.find(query)
          .sort(sort)
          .skip((actualPage - 1) * actualLimit)
          .limit(actualLimit);
      }

      res.json({
        products,
        page: actualPage,
        pages: Math.ceil(total / actualLimit),
        total
      });
    } else {
      // Return full backward-compatible array of products
      let products = await Product.find({}).sort(sort);

      let needsRefresh = false;
      for (let product of products) {
        if (!product.productCode) {
          product.productCode = generateProductCode();
          await product.save();
          needsRefresh = true;
        }
      }
      if (needsRefresh) {
        products = await Product.find({}).sort(sort);
      }

      res.json(products);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Public (Admin)
const createProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, description, image, images, category, stockBySize, productCode } = req.body;

    const totalStock = stockBySize
      ? Object.values(stockBySize).reduce((acc, curr) => acc + Number(curr || 0), 0)
      : 0;

    const product = new Product({
      name: name || 'Sample name',
      price: price || 0,
      productCode: productCode || generateProductCode(),
      description: description || 'Sample description',
      image: image || '/images/sample.jpg',
      images: images || [],
      category: category || 'Sample category',
      originalPrice: originalPrice || price || 0,
      countInStock: totalStock,
      stockBySize: stockBySize || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public (Admin)
const updateProduct = async (req, res) => {
  try {
    const { name, price, originalPrice, description, image, images, category, stockBySize, productCode } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.originalPrice = originalPrice || product.originalPrice || product.price;
      product.productCode = productCode || product.productCode || generateProductCode();
      product.description = description || product.description;
      if (image) product.image = image;
      if (images && images.length > 0) product.images = images;
      product.category = category || product.category;

      if (stockBySize) {
        const oldStock = product.countInStock;
        product.stockBySize = stockBySize;
        product.countInStock = Object.values(stockBySize).reduce((acc, curr) => acc + Number(curr || 0), 0);

        if (oldStock === 0 && product.countInStock > 0) {
          product.restockedAt = new Date();
        }
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Public
const createProductReview = async (req, res) => {
  try {
    const { rating, comment, name, images } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const review = {
        name: name || 'Anonymous',
        rating: Number(rating),
        comment,
        images: images || [],
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      const updatedProduct = await product.save();
      res.status(201).json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Public (Admin)
const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.params.reviewId
      );

      product.numReviews = product.reviews.length;

      if (product.numReviews > 0) {
        product.rating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length;
      } else {
        product.rating = 0;
      }

      await product.save();
      res.json({ message: 'Review removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export default { getProducts, getProductById, createProduct, updateProduct, createProductReview, deleteProductReview, deleteProduct };
