import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API_URL from '../../config';
import { 
  CreditCard, 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Calendar 
} from 'lucide-react';

const AdminPayments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  
  // Local filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
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
      console.error('Error fetching products for reference mapping', err);
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
      console.error('Error fetching orders for payments dashboard', error);
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

  // Download transaction ledger in Excel-friendly CSV format
  const downloadCSVReport = () => {
    if (orders.length === 0) return;

    const headers = [
      '"Order ID"', 
      '"Date"', 
      '"Customer Name"', 
      '"Email"', 
      '"City"', 
      '"Status"', 
      '"Items Quantity"', 
      '"Payment Method"',
      '"Total Earned (INR)"'
    ];

    const rows = orders.map(order => {
      const itemsCount = order.orderItems.reduce((acc, curr) => acc + curr.quantity, 0);
      return [
        `"${order._id}"`,
        `"${new Date(order.createdAt).toLocaleDateString()}"`,
        `"${order.shippingInfo.firstName} ${order.shippingInfo.lastName}"`,
        `"${order.shippingInfo.email || 'N/A'}"`,
        `"${order.shippingInfo.city}"`,
        `"${order.status}"`,
        itemsCount,
        `"${order.paymentMethod || 'Razorpay'}"`,
        order.totalPrice
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Anokhi_Sales_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // Analytics Calculations
  // ----------------------------------------------------
  
  // 1. Total & Net earnings
  const grossSales = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const activeOrders = orders.filter(o => o.status !== 'Cancelled');
  const netEarnings = activeOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalOrdersCount = orders.length;
  const activeOrdersCount = activeOrders.length;
  
  // 2. Average Order Value (AOV)
  const aov = activeOrdersCount > 0 ? netEarnings / activeOrdersCount : 0;

  // 3. This calendar month sales
  const now = new Date();
  const currentMonthNum = now.getMonth();
  const currentYearNum = now.getFullYear();

  const thisMonthOrders = activeOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === currentMonthNum && d.getFullYear() === currentYearNum;
  });
  const thisMonthSales = thisMonthOrders.reduce((acc, o) => acc + o.totalPrice, 0);

  // 4. Last calendar month sales & growth comparison
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthNum = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const lastMonthOrders = activeOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === lastMonthNum && d.getFullYear() === lastMonthYear;
  });
  const lastMonthSales = lastMonthOrders.reduce((acc, o) => acc + o.totalPrice, 0);

  let growthPct = 0;
  if (lastMonthSales > 0) {
    growthPct = ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100;
  }

  // 5. Last 6 months grouping for SVG chart
  const getMonthlyStats = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
        sales: 0,
        count: 0
      });
    }

    activeOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();

      const match = months.find(m => m.monthNum === orderMonth && m.year === orderYear);
      if (match) {
        match.sales += order.totalPrice;
        match.count += 1;
      }
    });

    return months;
  };

  const monthlyStats = getMonthlyStats();
  const highestSales = Math.max(...monthlyStats.map(m => m.sales));
  const maxMonthlySales = highestSales > 0 ? highestSales : 1000; // Dynamically scale to active sales

  // 6. Local filter map of orders
  const filteredOrders = orders.filter(order => {
    // Dropdown status filter
    if (statusFilter !== 'All' && order.status !== statusFilter) return false;

    // Search keywords (Order ID, customer name)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.trim().toLowerCase().replace(/^#/, '').replace(/^inv-/, '');
      
      const orderIdFull = order._id.toLowerCase();
      const orderIdShort = order._id.substring(18, 24).toLowerCase();
      const matchOrderId = orderIdFull.includes(term) || orderIdShort.includes(term);

      const firstName = order.shippingInfo?.firstName?.toLowerCase() || '';
      const lastName = order.shippingInfo?.lastName?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`;
      const matchCustomer = firstName.includes(term) || lastName.includes(term) || fullName.includes(term);

      return matchOrderId || matchCustomer;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* Upper Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-serif text-primary">Payment Ledger & Dashboard</h1>
          <p className="text-xs text-secondary/40 uppercase tracking-[0.2em] font-bold mt-2">Track Sales Analytics and Boutique Earnings</p>
        </div>

        <button 
          onClick={downloadCSVReport}
          disabled={orders.length === 0}
          className="flex items-center gap-2 bg-primaryContainer text-white px-5 py-3 rounded-xl font-sans uppercase tracking-widest text-xs font-semibold hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <Download size={14} /> Download Sales Report
        </button>
      </div>

      {/* Analytics KPIs Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* KPI 1: Net Earnings */}
        <div className="bg-white border border-champagne/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign size={18} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Net Revenue</p>
          <h3 className="text-2xl font-bold font-sans text-primary mt-2">₹{netEarnings.toLocaleString('en-IN')}</h3>
          <p className="text-[10px] text-secondary/50 mt-1">Excludes cancelled orders</p>
        </div>

        {/* KPI 2: Current Month Sales */}
        <div className="bg-white border border-champagne/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar size={18} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">This Month Sales</p>
          <h3 className="text-2xl font-bold font-sans text-primary mt-2">₹{thisMonthSales.toLocaleString('en-IN')}</h3>
          <div className="flex items-center gap-1 mt-1.5">
            {growthPct >= 0 ? (
              <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded leading-none">
                <ArrowUpRight size={10} className="mr-0.5" /> +{growthPct.toFixed(1)}%
              </span>
            ) : (
              <span className="flex items-center text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded leading-none">
                <ArrowDownRight size={10} className="mr-0.5" /> {growthPct.toFixed(1)}%
              </span>
            )}
            <span className="text-[9px] text-secondary/40 font-bold">vs last month</span>
          </div>
        </div>

        {/* KPI 3: Total Orders */}
        <div className="bg-white border border-champagne/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <ShoppingBag size={18} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Orders Placed</p>
          <h3 className="text-2xl font-bold font-sans text-primary mt-2">{activeOrdersCount}</h3>
          <p className="text-[10px] text-secondary/50 mt-1">{totalOrdersCount - activeOrdersCount} Cancelled orders excluded</p>
        </div>

        {/* KPI 4: Average Order Value */}
        <div className="bg-white border border-champagne/40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <TrendingUp size={18} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Avg Order Value</p>
          <h3 className="text-2xl font-bold font-sans text-primary mt-2">₹{Math.round(aov).toLocaleString('en-IN')}</h3>
          <p className="text-[10px] text-secondary/50 mt-1">Net revenue / Active orders</p>
        </div>
      </div>

      {/* Monthly Sales Performance Chart Component */}
      <div className="bg-white border border-champagne/40 rounded-3xl p-6 mb-10 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-serif text-primary">Monthly Sales performance</h2>
            <p className="text-[10px] text-secondary/60 uppercase font-bold tracking-widest mt-1">Earnings breakdown for the last 6 months</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primaryContainer"></span>
              <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Revenue</span>
            </div>
          </div>
        </div>

        {/* Native SVG Responsive Bar Chart */}
        <div className="relative w-full overflow-hidden bg-surface/30 p-4 rounded-2xl border border-champagne/10">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-secondary/50 font-serif italic">Compiling sales logs...</div>
          ) : (
            <svg className="w-full h-full" style={{ height: '220px', minHeight: '220px' }} viewBox="0 0 540 220" preserveAspectRatio="none">
              {/* Y-Axis Labels */}
              <text x="45" y="34" textAnchor="end" className="fill-secondary/40 text-[9px] font-mono font-bold">₹{Math.round(maxMonthlySales).toLocaleString('en-IN')}</text>
              <text x="45" y="109" textAnchor="end" className="fill-secondary/40 text-[9px] font-mono font-bold">₹{Math.round(maxMonthlySales / 2).toLocaleString('en-IN')}</text>
              <text x="45" y="184" textAnchor="end" className="fill-secondary/40 text-[9px] font-mono font-bold">₹0</text>

              {/* Grid Lines */}
              <line x1="55" y1="30" x2="520" y2="30" stroke="#dcd1c4" strokeWidth="1" strokeDasharray="3" />
              <line x1="55" y1="105" x2="520" y2="105" stroke="#dcd1c4" strokeWidth="1" strokeDasharray="3" />
              <line x1="55" y1="180" x2="520" y2="180" stroke="#b69a83" strokeWidth="1.5" />

              {/* Bars */}
              {monthlyStats.map((data, idx) => {
                const x = 75 + idx * 72;
                const barHeight = maxMonthlySales > 0 ? (data.sales / maxMonthlySales) * 145 : 0;
                const y = 180 - barHeight;
                
                return (
                  <g key={idx} className="group cursor-pointer">
                    {/* Invisible wider rect for easier hover triggers */}
                    <rect x={x - 12} y="20" width="46" height="160" fill="transparent" />
                    
                    {/* Visual Bar */}
                    <rect 
                      x={x} 
                      y={y} 
                      width="22" 
                      height={barHeight} 
                      fill="url(#chartBarGradient)" 
                      rx="4" 
                      className="transition-all duration-300 hover:fill-[#947862] hover:opacity-90"
                    />

                    {/* Secondary bar for volume comparison (subtle) */}
                    <rect 
                      x={x + 7} 
                      y={180 - (barHeight > 5 ? 5 : 2)} 
                      width="8" 
                      height={barHeight > 5 ? 5 : 2} 
                      fill="#e6ded6" 
                      rx="1"
                    />

                    {/* X-Axis Label */}
                    <text 
                      x={x + 11} 
                      y="200" 
                      textAnchor="middle" 
                      className="fill-secondary text-[10px] font-sans font-bold uppercase tracking-wider"
                    >
                      {data.name}
                    </text>

                    {/* Interactive Hover Tooltip */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <rect 
                        x={x - 34} 
                        y={y - 32} 
                        width="90" 
                        height="26" 
                        rx="6" 
                        fill="#1b1b1f" 
                        filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
                      />
                      <text 
                        x={x + 11} 
                        y={y - 15} 
                        textAnchor="middle" 
                        className="fill-white text-[9px] font-mono font-bold"
                      >
                        ₹{data.sales.toLocaleString('en-IN')}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Chart Gradients and Definitions */}
              <defs>
                <linearGradient id="chartBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b69a83" />
                  <stop offset="100%" stopColor="#e8dfd8" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>
      </div>

      {/* Transaction History Filter and Ledger */}
      <div className="bg-white rounded-3xl shadow-sm border border-champagne/40 overflow-hidden">
        <div className="p-6 border-b border-champagne/30 bg-surface/20">
          <h2 className="text-lg font-serif text-primary mb-4">Transaction History</h2>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-white border border-champagne/50 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
              <Search size={14} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search payments by Order ID or customer name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-xs font-sans outline-none text-primary w-full"
              />
            </div>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 border border-champagne/50 rounded-xl px-4 py-2 outline-none focus:border-primary transition-colors font-sans bg-white text-xs text-primary"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-secondary/50 font-sans">Loading transaction history...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-secondary/50 font-sans">
            {orders.length === 0 ? 'No payments have been processed yet.' : 'No transactions match your search filters.'}
          </div>
        ) : (
          <>
            {/* Desktop Table Ledger */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead className="bg-surface/50 border-b border-champagne/30 text-secondary uppercase tracking-widest text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Transaction ID (Order)</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Customer Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Prepaid Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-champagne/20">
                  {filteredOrders.map(order => (
                    <tr key={order._id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-secondary">
                        <span className="bg-surface border border-champagne/30 text-secondary px-2 py-0.5 rounded text-[10px]">
                          #{order._id.substring(18, 24).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-primary">{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                        <p className="text-secondary/50 text-[10px]">{order.shippingInfo.email || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px]
                          ${order.status === 'Cancelled' ? 'bg-red-50 text-red-500 border border-red-100' :
                            order.status === 'Delivered' ? 'bg-green-50 text-green-600 border border-green-100' :
                              order.status === 'Processing' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-secondary/70">Razorpay</td>
                      <td className="px-6 py-4 font-bold text-primary text-sm">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Ledger */}
            <div className="lg:hidden divide-y divide-champagne/20">
              {filteredOrders.map(order => (
                <div key={order._id} className="p-4 space-y-3 hover:bg-surface/20 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-secondary bg-surface border border-champagne/30 px-2 py-0.5 rounded text-[10px]">
                      #{order._id.substring(18, 24).toUpperCase()}
                    </span>
                    <span className="text-[10px] text-secondary/50">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex justify-between items-end bg-surface/20 p-3 rounded-2xl border border-champagne/10">
                    <div>
                      <p className="font-semibold text-xs text-primary">{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                      <p className="text-secondary/50 text-[9px] mt-0.5">{order.shippingInfo.email || 'N/A'}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px]
                        ${order.status === 'Cancelled' ? 'bg-red-50 text-red-500 border border-red-100' :
                          order.status === 'Delivered' ? 'bg-green-50 text-green-600 border border-green-100' :
                            order.status === 'Processing' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider font-bold text-secondary/40">Razorpay</p>
                      <p className="font-bold text-primary mt-0.5 text-base">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
