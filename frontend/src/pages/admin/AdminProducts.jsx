import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [viewingReviewsProduct, setViewingReviewsProduct] = useState(null);
  const { userInfo } = useAuth();
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: null
  });

  const showModal = (title, message, type = 'alert', onConfirm = null) => {
    setModalConfig({ show: true, title, message, type, onConfirm });
  };

  const closeModal = () => {
    setModalConfig({ ...modalConfig, show: false });
  };

  const generateProductCode = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = 'ANK-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = API_URL;
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${normalizedPath}`;
  };
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '', // This will be used as Offer Price in the form
    originalPrice: '', // This will be used as MRP in the form
    discount: '', // This will be used as Discount Percentage in the form
    category: 'Kurti',
    productCode: '',
    description: '',
    stockBySize: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
  });

  const handleOriginalPriceChange = (value) => {
    const mrp = value ? Number(value) : '';
    setFormData(prev => {
      const discountVal = prev.discount ? Number(prev.discount) : 0;
      let calculatedPrice = prev.price;
      if (mrp && discountVal > 0) {
        calculatedPrice = Math.round(mrp - (mrp * discountVal / 100));
      } else if (mrp && prev.price && Number(prev.price) < mrp) {
        const priceVal = Number(prev.price);
        const calcDiscount = Math.round(((mrp - priceVal) / mrp) * 100);
        return { ...prev, originalPrice: value, discount: calcDiscount };
      }
      return { ...prev, originalPrice: value, price: calculatedPrice };
    });
  };

  const handleDiscountChange = (value) => {
    const discountVal = value ? Number(value) : '';
    setFormData(prev => {
      let calculatedPrice = prev.price;
      if (prev.originalPrice && discountVal !== '') {
        const mrp = Number(prev.originalPrice);
        calculatedPrice = Math.round(mrp - (mrp * discountVal / 100));
      } else if (discountVal === '') {
        calculatedPrice = prev.originalPrice;
      }
      return { ...prev, discount: value, price: calculatedPrice };
    });
  };

  const handleOfferPriceChange = (value) => {
    const priceVal = value ? Number(value) : '';
    setFormData(prev => {
      let calculatedDiscount = prev.discount;
      if (prev.originalPrice && priceVal !== '') {
        const mrp = Number(prev.originalPrice);
        if (mrp > priceVal) {
          calculatedDiscount = Math.round(((mrp - priceVal) / mrp) * 100);
        } else {
          calculatedDiscount = 0;
        }
      } else if (priceVal === '') {
        calculatedDiscount = '';
      }
      return { ...prev, price: value, discount: calculatedDiscount };
    });
  };
  const [images, setImages] = useState([]); // Array of File objects

  const handleImageSelect = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles]);
    }
    // Reset input so the same file can be selected again if needed
    e.target.value = null;
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const editProduct = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || '',
      discount: product.discount !== undefined ? product.discount : '',
      category: product.category,
      productCode: product.productCode || '',
      description: product.description,
      stockBySize: product.stockBySize || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
    });
    setImages(product.images && product.images.length > 0 ? product.images : [product.image]);
    setEditingProductId(product._id);
    setShowForm(true);
  };

  const deleteProduct = async (id) => {
    showModal(
      'Delete Product',
      'Are you sure you want to permanently remove this product from your shop?',
      'confirm',
      async () => {
        try {
          const res = await fetch(`${API_URL}/api/products/${id}`, { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userInfo?.token}` }
          });
          if (res.ok) {
            fetchProducts();
            showModal('Success', 'Product has been removed successfully.', 'alert');
          }
        } catch (error) {
          console.error('Error deleting product', error);
          showModal('Error', 'Failed to delete product. Please try again.', 'alert');
        }
      }
    );
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', originalPrice: '', discount: '', category: 'Kurti', productCode: '', description: '', stockBySize: { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 } });
    setImages([]);
    setEditingProductId(null);
    setShowForm(false);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        headers: { 'Authorization': `Bearer ${userInfo?.token}` }
      });
      const data = await res.json();
      setProducts(data);
      
      // If we are currently viewing a product's reviews, refresh that specific product's data
      if (viewingReviewsProduct) {
        const updatedProduct = data.find(p => p._id === viewingReviewsProduct._id);
        if (updatedProduct) setViewingReviewsProduct(updatedProduct);
      }
    } catch (error) {
      console.error('Error fetching products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Effect to refresh data when opening reviews modal
  useEffect(() => {
    if (viewingReviewsProduct) {
      fetchProducts();
    }
  }, [viewingReviewsProduct?._id]);

  const handleDeleteReview = async (productId, reviewId) => {
    showModal(
      'Delete Review',
      'Are you sure you want to delete this customer review? This action cannot be undone.',
      'confirm',
      async () => {
        try {
          const res = await fetch(`${API_URL}/api/products/${productId}/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userInfo?.token}` }
          });
          if (res.ok) {
            fetchProducts();
            showModal('Success', 'The review has been removed.', 'alert');
          }
        } catch (error) {
          console.error('Error deleting review', error);
          showModal('Error', 'Failed to delete review.', 'alert');
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Separate existing paths from new files
      const existingPaths = images.filter(img => typeof img === 'string');
      const filesToUpload = images.filter(img => typeof img !== 'string');

      let imageArray = [...existingPaths];

      // 1. Upload new images if selected
      if (filesToUpload.length > 0) {
        const uploadData = new FormData();
        filesToUpload.forEach(file => {
          uploadData.append('images', file);
        });

        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: uploadData,
        });

        if (uploadRes.ok) {
          const uploadedPaths = await uploadRes.json();
          imageArray = [...imageArray, ...uploadedPaths];
        } else {
          showModal('Error', 'Image upload failed', 'alert');
          return;
        }
      }

      const bodyData = {
        ...formData,
        originalPrice: Number(formData.originalPrice),
        price: formData.price ? Number(formData.price) : Number(formData.originalPrice),
        discount: formData.discount ? Number(formData.discount) : 0,
        stockBySize: {
          XS: Number(formData.stockBySize.XS || 0),
          S: Number(formData.stockBySize.S || 0),
          M: Number(formData.stockBySize.M || 0),
          L: Number(formData.stockBySize.L || 0),
          XL: Number(formData.stockBySize.XL || 0),
          XXL: Number(formData.stockBySize.XXL || 0),
        }
      };

      if (imageArray.length > 0) {
        bodyData.image = imageArray[0];
        bodyData.images = imageArray;
      } else if (!editingProductId) {
        bodyData.image = 'https://images.unsplash.com/photo-1583391733958-d25e07fac044';
        bodyData.images = [];
      }

      const url = editingProductId 
        ? `${API_URL}/api/products/${editingProductId}`
        : `${API_URL}/api/products`;
        
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify(bodyData),
      });
      
      if (res.ok) {
        resetForm();
        fetchProducts(); // Refresh list
        showModal('Success', editingProductId ? 'Product successfully updated!' : 'Product successfully saved!', 'alert');
      } else {
        const errorData = await res.json();
        showModal('Error', `Failed to save product: ${errorData.message || 'Unknown error'}`, 'alert');
      }
    } catch (error) {
      console.error('Error creating product', error);
      showModal('Error', 'An error occurred while saving the product to the database.', 'alert');
    }
  };

  const filteredProducts = products.filter(product => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    const searchWithoutHash = cleanSearch.startsWith('#') ? cleanSearch.substring(1) : cleanSearch;
    
    const matchesSearch = product.name.toLowerCase().includes(cleanSearch) ||
                          product.category.toLowerCase().includes(cleanSearch) ||
                          (product.productCode && product.productCode.toLowerCase().includes(searchWithoutHash));
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-primary mb-2">Products</h1>
          <p className="text-secondary font-sans text-sm">Manage your catalog and add new products.</p>
        </div>
        <button 
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setFormData({ ...formData, productCode: generateProductCode() });
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 bg-primaryContainer text-white px-6 py-3 rounded-md font-sans uppercase tracking-widest text-xs font-semibold hover:bg-primary transition-colors"
        >
          {showForm ? 'Cancel' : <><Plus size={16} /> Add Product</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-surface border border-champagne/50 p-8 rounded-lg mb-8 shadow-sm">
          <h2 className="text-xl font-serif text-primary mb-6">{editingProductId ? 'Edit Product' : 'Create New Product'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-primary mb-2">Product Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-champagne rounded-md px-4 py-2 outline-none focus:border-primary transition-colors font-sans bg-transparent" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-primary mb-2">Original Price (MRP) (₹) *</label>
                <input required type="number" value={formData.originalPrice} onChange={e => handleOriginalPriceChange(e.target.value)} className="w-full border border-champagne rounded-md px-4 py-2 outline-none focus:border-primary transition-colors font-sans bg-transparent" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-primary mb-2">Discount (%)</label>
                <input type="number" min="0" max="100" value={formData.discount} onChange={e => handleDiscountChange(e.target.value)} className="w-full border border-champagne rounded-md px-4 py-2 outline-none focus:border-primary transition-colors font-sans bg-transparent" />
                <p className="text-[10px] text-secondary/60 mt-1 italic">Enter percentage (e.g. 15 for 15% OFF).</p>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-primary mb-2">Offer Price (Optional) (₹)</label>
                <input type="number" value={formData.price} onChange={e => handleOfferPriceChange(e.target.value)} className="w-full border border-champagne rounded-md px-4 py-2 outline-none focus:border-primary transition-colors font-sans bg-transparent" />
                <p className="text-[10px] text-secondary/60 mt-1 italic">Will be auto-calculated if discount is entered.</p>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-primary mb-2">Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-champagne rounded-md px-4 py-2 outline-none focus:border-primary transition-colors font-sans bg-transparent">
                  <option value="Kurti">Kurti</option>
                  <option value="Salwar">Salwar</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-primary mb-2">Product Code (Generated)</label>
                <input readOnly type="text" value={formData.productCode} className="w-full border border-champagne rounded-md px-4 py-2 outline-none bg-champagne/10 font-mono text-primary font-bold cursor-not-allowed" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-primary mb-4">Stock by Size</label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <div key={size}>
                      <label className="block text-[10px] uppercase tracking-widest font-sans font-semibold text-secondary mb-1">Size {size}</label>
                      <input 
                        type="number" 
                        min="0" 
                        value={formData.stockBySize[size]} 
                        onChange={e => setFormData({
                          ...formData, 
                          stockBySize: { ...formData.stockBySize, [size]: e.target.value }
                        })} 
                        className="w-full border border-champagne rounded-md px-3 py-2 outline-none focus:border-primary transition-colors font-sans bg-transparent" 
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-primary mb-2">Upload Images</label>
                <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="w-full border border-champagne rounded-md px-4 py-2 outline-none focus:border-primary transition-colors font-sans bg-transparent" />
                <p className="text-xs text-secondary mt-1">Select multiple images at once, or add them one by one. The first image will be the primary display.</p>
                
                {/* Image Previews List */}
                {images.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                    {images.map((file, index) => {
                      const isString = typeof file === 'string';
                      const previewUrl = isString ? getImageUrl(file) : URL.createObjectURL(file);
                      
                      return (
                        <div key={index} className="flex items-center gap-4 p-2 border border-champagne/50 rounded-md bg-surface/50">
                          <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden border border-champagne bg-white">
                            <img 
                              src={previewUrl} 
                              alt={`preview ${index}`} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-sans text-primary truncate">
                              {isString ? 'Existing Image' : file.name}
                            </p>
                            <p className="text-xs text-secondary">
                              {isString ? 'Stored on server' : `${(file.size / 1024).toFixed(1)} KB`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="px-2 py-1 bg-primaryContainer/10 text-primaryContainer text-[10px] uppercase tracking-widest font-semibold rounded border border-primaryContainer/20">
                                Main
                              </span>
                            )}
                            <button 
                              type="button" 
                              onClick={() => removeImage(index)}
                              className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                              title="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-sans font-semibold text-primary mb-2">Description</label>
              <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-champagne rounded-md px-4 py-2 outline-none focus:border-primary transition-colors font-sans bg-transparent"></textarea>
            </div>
            <div className="flex justify-end gap-4">
              {editingProductId && (
                <button type="button" onClick={resetForm} className="bg-transparent border border-champagne text-secondary px-8 py-3 rounded-md font-sans uppercase tracking-widest text-xs font-semibold hover:border-primary hover:text-primary transition-colors">
                  Cancel Edit
                </button>
              )}
              <button type="submit" className="bg-primaryContainer text-white px-8 py-3 rounded-md font-sans uppercase tracking-widest text-xs font-semibold hover:bg-primary transition-colors">
                {editingProductId ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search products by name, category, or code..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-champagne rounded-md px-4 py-2 outline-none focus:border-primary transition-colors font-sans bg-surface"
        />
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full sm:w-48 border border-champagne rounded-md px-4 py-2 outline-none focus:border-primary transition-colors font-sans bg-surface"
        >
          <option value="All">All Categories</option>
          <option value="Kurti">Kurti</option>
          <option value="Salwar">Salwar</option>
        </select>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-lg shadow-sm border border-champagne/50 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-secondary font-sans">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-secondary font-sans">No products found matching your filters.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead className="bg-surface border-b border-champagne/50 text-secondary uppercase tracking-widest text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">MRP</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-champagne/30">
                  {filteredProducts.map(product => (
                    <tr key={product._id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <img src={getImageUrl(product.image)} alt={product.name} className="w-12 h-16 object-cover rounded border border-champagne/50" />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[10px] font-bold text-primaryContainer bg-primaryContainer/5 px-2 py-1 rounded">{product.productCode || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 font-serif text-primary text-base">{product.name}</td>
                      <td className="px-6 py-4 text-secondary">{product.category}</td>
                      <td className="px-6 py-4 font-semibold text-primary">
                        <div>₹{product.price.toLocaleString('en-IN')}</div>
                        {product.discount > 0 && (
                          <span className="text-[10px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded border border-red-100/50">
                            {product.discount}% OFF
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-secondary/50 line-through">₹{(product.originalPrice || product.price).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-bold text-primary">{product.countInStock}</span>
                          <div className="text-[10px] text-secondary/60 mt-1 font-mono leading-none flex flex-wrap gap-1 max-w-[150px]">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                              const stock = product.stockBySize?.[size] || 0;
                              return (
                                <span key={size} className={`px-1 rounded text-[9px] font-bold border ${stock === 0 ? 'bg-red-50/50 text-red-400 border-red-100/50' : 'bg-green-50/50 text-green-600 border-green-100/50'}`}>
                                  {size}:{stock}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star size={14} fill="currentColor" />
                          {product.rating ? product.rating.toFixed(1) : '0.0'}
                          <span className="text-[10px] text-secondary font-normal ml-1">({product.numReviews || 0})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setViewingReviewsProduct(product)}
                            className="p-2 text-primaryContainer hover:bg-primaryContainer/10 rounded-md transition-colors"
                            title="View Reviews"
                          >
                            <MessageCircle size={18} />
                          </button>
                          <button onClick={() => editProduct(product)} className="p-2 text-primary hover:bg-champagne/30 rounded-md transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => deleteProduct(product._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-champagne/30">
              {filteredProducts.map(product => (
                <div key={product._id} className="p-4 space-y-4">
                  <div className="flex gap-4">
                    <img src={getImageUrl(product.image)} alt={product.name} className="w-20 h-28 object-cover rounded border border-champagne/30" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono font-bold text-primaryContainer bg-primaryContainer/5 px-2 py-0.5 rounded border border-primaryContainer/10">
                          #{product.productCode || '---'}
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                          <Star size={12} fill="currentColor" />
                          {product.rating ? product.rating.toFixed(1) : '0.0'}
                        </div>
                      </div>
                      <h3 className="font-serif text-lg text-primary truncate leading-tight">{product.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">{product.category}</p>
                      <div className="flex items-center gap-3 pt-1 flex-wrap">
                        <span className="font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-secondary/40 line-through text-xs">₹{(product.originalPrice || product.price).toLocaleString('en-IN')}</span>
                        )}
                        {product.discount > 0 && (
                          <span className="text-[9px] bg-red-50 text-red-600 font-bold px-1.5 py-0.5 rounded border border-red-100/50">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-secondary">Stock: <span className="font-bold text-primary">{product.countInStock}</span></p>
                      <div className="text-[10px] text-secondary/60 mt-2 font-mono flex flex-wrap gap-1">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                          const stock = product.stockBySize?.[size] || 0;
                          return (
                            <span key={size} className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${stock === 0 ? 'bg-red-50/50 text-red-400 border-red-100/50' : 'bg-green-50/50 text-green-600 border-green-100/50'}`}>
                              {size}:{stock}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-surface/50 p-2 rounded-lg border border-champagne/20">
                    <button 
                      onClick={() => setViewingReviewsProduct(product)}
                      className="flex items-center gap-2 px-3 py-2 text-primaryContainer font-bold text-[10px] uppercase tracking-widest"
                    >
                      <MessageCircle size={14} /> Reviews ({product.numReviews || 0})
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => editProduct(product)} className="p-2 text-primary bg-white rounded-md border border-champagne/50">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteProduct(product._id)} className="p-2 text-red-500 bg-white rounded-md border border-red-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Reviews Modal */}
      {viewingReviewsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-champagne max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="sticky top-0 bg-white border-b border-champagne/30 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-serif text-primary">Reviews: {viewingReviewsProduct.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < Math.round(viewingReviewsProduct.rating || 0) ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <span className="text-xs text-secondary font-sans font-bold">({viewingReviewsProduct.numReviews || 0} total)</span>
                </div>
              </div>
              <button 
                onClick={() => setViewingReviewsProduct(null)}
                className="text-secondary hover:text-primary transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {viewingReviewsProduct.reviews && viewingReviewsProduct.reviews.length > 0 ? (
                viewingReviewsProduct.reviews.map((review, idx) => (
                  <div key={idx} className="bg-surface p-5 rounded-lg border border-champagne/30">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-serif text-lg text-primary">{review.name}</p>
                        <div className="flex text-amber-500 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-secondary font-sans uppercase tracking-widest font-bold">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-secondary font-sans text-sm leading-relaxed mb-4">{review.comment}</p>
                    
                    <div className="flex justify-between items-end">
                      {review.images && review.images.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {review.images.map((img, i) => (
                            <div key={i} className="w-20 h-20 rounded border border-champagne/50 overflow-hidden flex-shrink-0">
                              <img src={getImageUrl(img)} alt="review" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      ) : <div></div>}
                      
                      <button 
                        onClick={() => handleDeleteReview(viewingReviewsProduct._id, review._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <p className="text-secondary font-serif italic text-lg opacity-40 text-center w-full">No reviews yet for this product.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-surface border-t border-champagne/30">
              <button 
                onClick={() => setViewingReviewsProduct(null)}
                className="w-full py-3 bg-primaryContainer text-white rounded font-sans font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors shadow-md"
              >
                Close Reviews
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Admin Modal (Alert/Confirm) */}
      {modalConfig.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl border border-champagne max-w-sm w-full p-8 animate-fade-in-up text-center">
            <h3 className="text-2xl font-serif text-primary mb-3">{modalConfig.title}</h3>
            <p className="font-sans text-secondary text-sm mb-8 leading-relaxed">
              {modalConfig.message}
            </p>
            <div className="flex gap-4">
              {modalConfig.type === 'confirm' ? (
                <>
                  <button 
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-champagne text-primary rounded font-sans text-xs font-bold uppercase tracking-widest hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      modalConfig.onConfirm();
                      closeModal();
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-sans text-xs font-bold uppercase tracking-widest transition-colors shadow-md"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button 
                  onClick={closeModal}
                  className="w-full px-4 py-3 bg-primaryContainer hover:bg-primary text-white rounded font-sans text-xs font-bold uppercase tracking-widest transition-colors shadow-md"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
