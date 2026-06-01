import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';

const AdminOrders = ({ filter }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  const { userInfo } = useAuth();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = API_URL;
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${normalizedPath}`;
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      const map = {};
      const codeMap = {};
      data.forEach(p => {
        map[p._id] = p.image;
        codeMap[p._id] = p.productCode;
      });
      setProductsMap({ images: map, codes: codeMap });
    } catch (err) {
      console.error('Error fetching products for backfill', err);
    }
  };

  const fetchOrders = async () => {
    if (!userInfo?.token) return;
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      fetchOrders();
      fetchProducts();
    }
  }, [userInfo?.token]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(prev => prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        console.error('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status', err);
    }
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups to print invoices.');
      return;
    }

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 20px; font-size: 14px; line-height: 1.4; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px dashed #000; padding-bottom: 15px; }
            .title { font-size: 22px; font-weight: bold; margin: 0; letter-spacing: 2px; }
            .subtitle { font-size: 12px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; color: #555; }
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
            .info-block { flex: 1; }
            .info-block:last-child { text-align: right; }
            .info-title { font-weight: bold; text-transform: uppercase; font-size: 11px; color: #333; margin-bottom: 5px; border-bottom: 1px solid #000; display: inline-block; }
            .table { border-collapse: collapse; margin-bottom: 30px; width: 100%; }
            .table th { border-bottom: 2px solid #000; border-top: 2px solid #000; padding: 8px 4px; text-align: left; font-size: 12px; }
            .table td { padding: 8px 4px; border-bottom: 1px dashed #ccc; font-size: 12px; }
            .summary { float: right; width: 300px; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
            .summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px; }
            .total-row { font-size: 16px; font-weight: bold; border-top: 2px double #000; padding-top: 8px; margin-top: 8px; }
            .footer { margin-top: 80px; text-align: center; border-top: 1px dashed #000; padding-top: 20px; font-size: 11px; }
            .signature { margin-top: 50px; text-align: right; font-size: 12px; }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ZALOURA</div>
            <div class="subtitle">Tax Invoice / Bill of Supply</div>
          </div>
          
          <div class="info-grid">
            <div class="info-block">
              <div class="info-title">Seller</div>
              <strong>Zaloura Studio</strong><br />
              Heritage Lane, Thrissur<br />
              Kerala, India - 680007<br />
              Phone: +91 89212 73858<br />
              Email: zaloura.in@gmail.com
            </div>
            <div class="info-block" style="padding-left: 20px;">
              <div class="info-title">Bill To / Ship To</div>
              <strong>${order.shippingInfo.firstName} ${order.shippingInfo.lastName}</strong><br />
              ${order.shippingInfo.address}<br />
              ${order.shippingInfo.city}, ${order.shippingInfo.state} - ${order.shippingInfo.postalCode}<br />
              Phone: ${order.shippingInfo.phone}<br />
              Email: ${order.shippingInfo.email || 'N/A'}
            </div>
            <div class="info-block">
              <div class="info-title">Invoice Details</div>
              <strong>Invoice No:</strong> INV-${order._id.substring(18, 24).toUpperCase()}<br />
              <strong>Invoice Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br />
              <strong>Order ID:</strong> ${order._id}<br />
              <strong>Payment Mode:</strong> Prepaid (Online)<br />
              <strong>Payment Status:</strong> Completed
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th style="width: 45%;">Product Description</th>
                <th style="width: 15%; text-align: center;">Size</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Price</th>
                <th style="width: 15%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems.map(item => `
                <tr>
                  <td>
                    ${item.name}<br />
                    <span style="font-size: 10px; color: #555; font-family: monospace;">Ref: #${item.productCode || (productsMap.codes && productsMap.codes[item.product]) || 'N/A'}</span>
                  </td>
                  <td style="text-align: center;">${item.size || 'N/A'}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
                  <td style="text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="width: 100%; overflow: hidden;">
            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹${order.totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div class="summary-row">
                <span>Shipping:</span>
                <span style="color: green; font-weight: bold;">FREE</span>
              </div>
              <div class="summary-row total-row">
                <span>Grand Total:</span>
                <span>₹${order.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
          <div class="signature">
            <p>For <strong>ZALOURA STUDIO</strong></p>
            <br /><br />
            <p>_____________________</p>
            <p style="font-size: 10px; margin-top: 5px;">Authorized Signature</p>
          </div>
          
          <div class="footer">
            Thank you for shopping at Zaloura. Crafted with dedication, worn with elegance.
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const handlePrintCourierLabel = (order) => {
    const printWindow = window.open('', '_blank', 'width=600,height=500');
    if (!printWindow) {
      alert('Please allow popups to print shipping labels.');
      return;
    }

    const productsString = order.orderItems.map(item => `${item.name} (${item.size || 'N/A'}) x${item.quantity}`).join(', ');

    const labelHtml = `
      <html>
        <head>
          <title>Shipping Label - ${order._id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 20px; font-size: 13px; line-height: 1.4; }
            .label-border { border: 3px double #000; padding: 20px; height: 90%; display: flex; flex-direction: column; justify-content: space-between; }
            .header-label { border-bottom: 2px solid #000; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
            .brand-name { font-size: 20px; font-weight: bold; letter-spacing: 2px; }
            .delivery-badge { font-weight: bold; border: 1px solid #000; padding: 3px 8px; font-size: 10px; text-transform: uppercase; }
            .address-section { margin-top: 15px; margin-bottom: 15px; }
            .address-title { font-weight: bold; font-size: 11px; text-transform: uppercase; margin-bottom: 3px; text-decoration: underline; }
            .address-box { border: 1px dashed #000; padding: 10px; margin-top: 5px; font-size: 13px; }
            .grid-label { display: grid; grid-template-columns: 1fr 1fr; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 10px 0; margin-top: 15px; margin-bottom: 15px; }
            .grid-item { border-right: 1px dashed #ccc; padding-left: 5px; }
            .grid-item:last-child { border-right: none; }
            .grid-item-title { font-weight: bold; font-size: 10px; text-transform: uppercase; color: #555; }
            .product-badge { font-size: 11px; background-color: #f5f5f5; padding: 8px; border: 1px solid #ddd; margin-top: 10px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="label-border">
            <div>
              <div class="header-label">
                <span class="brand-name">ZALOURA</span>
                <span class="delivery-badge">PREPAID</span>
              </div>
              
              <div class="address-section">
                <div class="address-title">SHIP TO:</div>
                <div class="address-box">
                  <strong>${order.shippingInfo.firstName} ${order.shippingInfo.lastName}</strong><br />
                  ${order.shippingInfo.address}<br />
                  <strong>City:</strong> ${order.shippingInfo.city}<br />
                  <strong>State:</strong> ${order.shippingInfo.state} - <strong>PIN:</strong> ${order.shippingInfo.postalCode}<br />
                  <strong>Phone:</strong> ${order.shippingInfo.phone}
                </div>
              </div>
              
              <div class="address-section" style="opacity: 0.85;">
                <div class="address-title">FROM (SENDER):</div>
                <div style="font-size: 11px; margin-left: 5px;">
                  <strong>ZALOURA STUDIO</strong><br />
                  Heritage Lane, Thrissur, Kerala, India - 680007<br />
                  Phone: +91 89212 73858
                </div>
              </div>
            </div>
            
            <div>
              <div class="grid-label">
                <div class="grid-item">
                  <div class="grid-item-title">Order ID</div>
                  <strong style="font-size: 11px;">${order._id}</strong>
                </div>
                <div class="grid-item">
                  <div class="grid-item-title">Invoice Number</div>
                  <strong>INV-${order._id.substring(18, 24).toUpperCase()}</strong>
                </div>
              </div>
              
              <div class="product-badge">
                <div class="grid-item-title" style="margin-bottom: 3px;">Courier Item details</div>
                <strong>Items:</strong> ${productsString}<br />
                <strong>COD Amount:</strong> ₹0 (PREPAID)
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(labelHtml);
    printWindow.document.close();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-primary mb-2">
          {filter === 'Processing' ? 'Orders: Processing' :
            filter === 'Fulfillment' ? 'Order Fulfillment' :
              filter === 'Payments' ? 'Payment Ledger' : 'All Orders'}
        </h1>
        <p className="text-secondary font-sans text-sm">
          {filter === 'Processing' ? 'Managing active orders requiring artisanal attention.' :
            filter === 'Fulfillment' ? 'Tracking the logistics and history of dispatched pieces.' :
              filter === 'Payments' ? 'Reviewing all payments received for boutique masterpieces.' : 'View and manage customer orders.'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-champagne/50 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-secondary font-sans">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-secondary font-sans">No orders have been placed yet.</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead className="bg-surface border-b border-champagne/50 text-secondary uppercase tracking-widest text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-champagne/30">
                  {orders
                    .filter(order => {
                      if (filter === 'Processing') return order.status === 'Processing';
                      if (filter === 'Fulfillment') return ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.status);
                      if (filter === 'Payments') return true;
                      return true;
                    })
                    .map(order => (
                      <tr key={order._id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-secondary text-xs">{order._id.substring(18, 24)}</td>
                        <td className="px-6 py-4 text-secondary">
                          <p className="font-semibold text-xs text-primary">Pl: {new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Up: {new Date(order.updatedAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-primary font-semibold">{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                          <p className="text-secondary text-xs">{order.shippingInfo.city}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-3">
                            {order.orderItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-10 h-12 flex-shrink-0 bg-surface rounded border border-champagne/30 overflow-hidden">
                                  {(item.image || (productsMap.images && productsMap.images[item.product])) ? (
                                    <img
                                      src={getImageUrl(item.image || productsMap.images[item.product])}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-secondary">No Img</div>
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-primary font-medium text-xs truncate max-w-[150px]">{item.name}</span>
                                    <span className="text-[8px] font-mono text-secondary/50">#{item.productCode || (productsMap.codes && productsMap.codes[item.product]) || '---'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="bg-champagne/40 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                                      {item.size || 'N/A'}
                                    </span>
                                    <span className="text-secondary text-[11px] font-medium">
                                      × {item.quantity}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-primary">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="bg-primaryContainer/10 text-primaryContainer px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest outline-none cursor-pointer border-none appearance-none pr-6"
                            style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23b69a83%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.65em auto' }}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs uppercase tracking-widest font-semibold text-primary hover:text-primaryContainer bg-champagne/20 hover:bg-champagne/40 px-3 py-1.5 rounded transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-champagne/30">
              {orders
                .filter(order => {
                  if (filter === 'Processing') return order.status === 'Processing';
                  if (filter === 'Fulfillment') return ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(order.status);
                  if (filter === 'Payments') return true; // Show all for now, as they are paid on checkout
                  return true;
                })
                .map(order => (
                  <div key={order._id} className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-mono text-secondary uppercase tracking-widest">ID: {order._id.substring(18, 24)}</p>
                        <p className="text-[10px] text-secondary/60 mt-0.5">Pl: {new Date(order.createdAt).toLocaleDateString()} | Up: {new Date(order.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-primaryContainer/10 text-primaryContainer px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest outline-none border-none appearance-none pr-6"
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23b69a83%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.6em auto' }}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="bg-surface/50 p-3 rounded-lg border border-champagne/20">
                      <p className="text-primary font-serif font-bold">{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                      <p className="text-secondary text-[11px] mt-0.5 italic">{order.shippingInfo.city}, {order.shippingInfo.address.substring(0, 30)}...</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-2">
                        {order.orderItems.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="w-8 h-10 rounded border border-white bg-white shadow-sm overflow-hidden flex-shrink-0">
                            <img
                              src={getImageUrl(item.image || (productsMap.images && productsMap.images[item.product]))}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {order.orderItems.length > 3 && (
                          <div className="w-8 h-10 rounded border border-white bg-champagne/20 flex items-center justify-center text-[10px] text-primary font-bold shadow-sm">
                            +{order.orderItems.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase text-secondary font-bold tracking-widest mb-0.5">Total Amount</p>
                        <p className="text-primary font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-full py-2.5 bg-white border border-champagne/50 rounded-lg text-[10px] uppercase tracking-widest font-bold text-primary hover:bg-champagne/10 transition-colors"
                    >
                      View Full Details
                    </button>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-champagne max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="sticky top-0 bg-white border-b border-champagne/30 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-serif text-primary">Order Details</h2>
                <p className="text-xs text-secondary font-mono">ID: {selectedOrder._id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-secondary hover:text-primary transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Shipping Information */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-sans font-bold text-secondary mb-4 border-b border-champagne/30 pb-1">Customer & Shipping</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] uppercase text-secondary font-semibold mb-1">Customer Name</p>
                    <p className="text-primary font-serif">{selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-secondary font-semibold mb-1">Status</p>
                    <span className="px-2 py-0.5 bg-primaryContainer/10 text-primaryContainer text-[10px] font-bold rounded uppercase tracking-wider">
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-secondary font-semibold mb-1">Date Placed</p>
                    <p className="text-primary text-xs">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-secondary font-semibold mb-1">Last Updated</p>
                    <p className="text-primary text-xs">{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase text-secondary font-semibold mb-1">Shipping Address</p>
                    <p className="text-primary text-sm leading-relaxed">
                      {selectedOrder.shippingInfo.address}<br />
                      {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.postalCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-sans font-bold text-secondary mb-4 border-b border-champagne/30 pb-1">Ordered Products</h3>
                <div className="space-y-4">
                  {selectedOrder.orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-3 border border-champagne/20 rounded-lg bg-surface/30">
                      <div className="w-16 h-20 bg-white rounded border border-champagne/50 overflow-hidden flex-shrink-0">
                        {(item.image || (productsMap.images && productsMap.images[item.product])) ? (
                          <img
                            src={getImageUrl(item.image || productsMap.images[item.product])}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-secondary">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-primary font-serif text-lg leading-tight truncate">{item.name}</p>
                          <span className="text-[10px] font-mono bg-secondaryContainer/20 px-2 py-0.5 rounded text-secondary font-bold">
                            #{item.productCode || (productsMap.codes && productsMap.codes[item.product]) || '---'}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 mt-3">
                          <div>
                            <p className="text-[10px] uppercase text-secondary font-bold tracking-widest mb-1">Size</p>
                            <span className="bg-primaryContainer text-white px-3 py-1 rounded text-xs font-bold uppercase">
                              {item.size || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-secondary font-bold tracking-widest mb-1">Quantity</p>
                            <span className="text-primary font-bold text-sm">
                              {item.quantity}
                            </span>
                          </div>
                        </div>
                        <p className="text-primary font-semibold mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-sans font-bold text-secondary mb-4 border-b border-champagne/30 pb-1">Payment Details</h3>
                <div className="bg-surface p-4 rounded-lg border border-champagne/50 space-y-3 font-sans text-sm text-secondary">
                  <div className="flex justify-between">
                    <span className="font-semibold text-xs uppercase tracking-wider text-gray-400">Payment Status</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${selectedOrder.isPaid ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-xs uppercase tracking-wider text-gray-400">Method</span>
                    <span className="text-primary font-semibold">Razorpay Online</span>
                  </div>
                  {selectedOrder.paymentResult && selectedOrder.paymentResult.id && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-semibold text-xs uppercase tracking-wider text-gray-400">Razorpay Payment ID</span>
                        <span className="font-mono text-xs text-primary font-bold">{selectedOrder.paymentResult.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-xs uppercase tracking-wider text-gray-400">Transaction Time</span>
                        <span className="text-xs text-primary">{new Date(selectedOrder.paymentResult.update_time).toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-2 border-t border-champagne/20">
                    <span className="font-bold text-xs uppercase tracking-wider text-primary">Paid Amount</span>
                    <span className="font-sans font-bold text-primary text-base">₹{selectedOrder.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-surface p-4 rounded-lg border border-champagne/50">
                <div className="flex justify-between items-center text-secondary font-sans text-sm mb-2">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-secondary font-sans text-sm mb-4">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-champagne/30">
                  <span className="text-primary font-serif font-bold text-lg">Total Amount</span>
                  <span className="text-primary font-sans font-bold text-xl">₹{selectedOrder.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface border-t border-champagne/30 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="py-3 bg-white border border-primary text-primary rounded font-sans font-bold uppercase tracking-widest text-xs hover:bg-primary/5 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Print Invoice
                </button>
                <button
                  onClick={() => handlePrintCourierLabel(selectedOrder)}
                  className="py-3 bg-white border border-primary text-primary rounded font-sans font-bold uppercase tracking-widest text-xs hover:bg-primary/5 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  Print Label
                </button>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3 bg-primaryContainer text-white rounded font-sans font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors shadow-md"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
