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
  Calendar,
  Plus,
  Trash2,
  List,
  AlertCircle
} from 'lucide-react';

const AdminPayments = () => {
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  
  // Ledger active tab state ('payments' or 'expenses')
  const [activeTab, setActiveTab] = useState('payments');

  // Search and status filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Expense Logging Form State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: 'Packaging',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

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

  const fetchExpenses = async () => {
    if (!userInfo?.token) return;
    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching operational expenses', error);
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      fetchOrders();
      fetchExpenses();
      fetchProducts();
    }
  }, [userInfo?.token]);

  // Tab reset handler to prevent search state leak
  useEffect(() => {
    setSearchTerm('');
    setStatusFilter('All');
  }, [activeTab]);

  // Log a new business operational expense
  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.category) return;

    try {
      const res = await fetch(`${API_URL}/api/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify(expenseForm)
      });

      if (res.ok) {
        setShowExpenseModal(false);
        setExpenseForm({
          amount: '',
          category: 'Packaging',
          description: '',
          date: new Date().toISOString().split('T')[0]
        });
        fetchExpenses(); // Refresh expense records
      } else {
        alert('Failed to log operational expense. Please try again.');
      }
    } catch (err) {
      console.error('Error logging expense', err);
      alert('A network error occurred while saving the expense.');
    }
  };

  // Delete an accidental expense entry
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this expense record?')) return;

    try {
      const res = await fetch(`${API_URL}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });

      if (res.ok) {
        fetchExpenses(); // Refresh expense records
      } else {
        alert('Failed to delete expense record.');
      }
    } catch (err) {
      console.error('Error deleting expense', err);
    }
  };

  // Download transaction or expense ledger in Excel-friendly CSV format
  const downloadCSVReport = () => {
    if (activeTab === 'payments') {
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
    } else {
      if (expenses.length === 0) return;

      const headers = [
        '"Expense ID"', 
        '"Date"', 
        '"Category"', 
        '"Notes / Description"', 
        '"Amount Spent (INR)"'
      ];

      const rows = expenses.map(exp => [
        `"${exp._id}"`,
        `"${new Date(exp.date).toLocaleDateString()}"`,
        `"${exp.category}"`,
        `"${exp.description || '—'}"`,
        exp.amount
      ]);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Anokhi_Expenses_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ----------------------------------------------------
  // Financial Calculations & Analytics
  // ----------------------------------------------------
  
  // 1. Gross sales (prepaid active orders)
  const activeOrders = orders.filter(o => o.status !== 'Cancelled');
  const grossSales = activeOrders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalOrdersCount = orders.length;
  const activeOrdersCount = activeOrders.length;
  
  // 2. Direct operating expenses (from Registry)
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // 3. Realized take-home Net Profit
  const netProfit = grossSales - totalExpenses;
  
  // 4. Average Order Value (AOV)
  const aov = activeOrdersCount > 0 ? grossSales / activeOrdersCount : 0;

  // 5. This calendar month sales
  const now = new Date();
  const currentMonthNum = now.getMonth();
  const currentYearNum = now.getFullYear();

  const thisMonthOrders = activeOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === currentMonthNum && d.getFullYear() === currentYearNum;
  });
  const thisMonthSales = thisMonthOrders.reduce((acc, o) => acc + o.totalPrice, 0);

  // 6. Last calendar month sales & growth comparison
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

  // 7. Last 6 months grouping for SVG chart
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
  const maxMonthlySales = highestSales > 0 ? highestSales : 1000; // Dynamic scale height

  // 8. Filters for Customer Payments List
  const filteredOrders = orders.filter(order => {
    if (statusFilter !== 'All' && order.status !== statusFilter) return false;

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

  // 9. Filters for Operational Expenses List
  const filteredExpenses = expenses.filter(exp => {
    if (statusFilter !== 'All' && exp.category !== statusFilter) return false;

    if (searchTerm.trim() !== '') {
      const term = searchTerm.trim().toLowerCase();
      const matchCat = exp.category.toLowerCase().includes(term);
      const matchNote = exp.description?.toLowerCase().includes(term) || '';
      return matchCat || matchNote;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto pb-24">
      {/* Upper Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-serif text-primary">Financial Dashboard</h1>
          <p className="text-xs text-secondary/40 uppercase tracking-[0.2em] font-bold mt-2">Revenue, Operating Expenses, & Boutique Net Profit</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-2 bg-white border border-primaryContainer/30 text-primaryContainer px-5 py-3 rounded-xl font-sans uppercase tracking-widest text-xs font-bold hover:bg-primaryContainer/5 transition-all shadow-sm"
          >
            <Plus size={14} /> Log Expense
          </button>
          
          <button 
            onClick={downloadCSVReport}
            disabled={activeTab === 'payments' ? orders.length === 0 : expenses.length === 0}
            className="flex items-center gap-2 bg-primaryContainer text-white px-5 py-3 rounded-xl font-sans uppercase tracking-widest text-xs font-semibold hover:bg-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Analytics KPIs Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* KPI 1: Gross Sales */}
        <div className="bg-white border border-champagne/40 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <DollarSign size={18} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Gross Revenue</p>
          <h3 className="text-2xl font-bold font-sans text-primary mt-2">₹{grossSales.toLocaleString('en-IN')}</h3>
          <p className="text-[10px] text-secondary/50 mt-1">Excludes cancelled orders</p>
        </div>

        {/* KPI 2: Operating Expenses */}
        <div className="bg-white border border-champagne/40 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
            <CreditCard size={18} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Operating Costs</p>
          <h3 className="text-2xl font-bold font-sans text-red-500 mt-2">₹{totalExpenses.toLocaleString('en-IN')}</h3>
          <p className="text-[10px] text-secondary/50 mt-1">Covers, labels, courier shipping</p>
        </div>

        {/* KPI 3: Realized Net Take-home Profit */}
        <div className={`border rounded-3xl p-6 shadow-sm relative overflow-hidden transition-all
          ${netProfit >= 0 ? 'bg-emerald-50/20 border-emerald-100/60' : 'bg-red-50/10 border-red-100/60'}`}
        >
          <div className={`absolute right-4 top-4 w-10 h-10 rounded-2xl flex items-center justify-center font-bold
            ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}
          >
            <TrendingUp size={18} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Take-home Profit</p>
          <h3 className={`text-2xl font-bold font-sans mt-2 ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            ₹{netProfit.toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-secondary/50 mt-1">Gross sales minus operational expenses</p>
        </div>

        {/* KPI 4: Orders Placed */}
        <div className="bg-white border border-champagne/40 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute right-4 top-4 w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
            <ShoppingBag size={18} />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-secondary/50">Orders Placed</p>
          <h3 className="text-2xl font-bold font-sans text-primary mt-2">{activeOrdersCount}</h3>
          <p className="text-[10px] text-secondary/50 mt-1">{totalOrdersCount - activeOrdersCount} Cancelled orders excluded</p>
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

      {/* Transaction & Expense Ledger Navigation */}
      <div className="bg-white rounded-3xl shadow-sm border border-champagne/40 overflow-hidden">
        <div className="p-6 border-b border-champagne/30 bg-surface/20">
          
          {/* Dual Tab Toggle */}
          <div className="flex gap-6 border-b border-champagne/20 pb-4 mb-4">
            <button 
              onClick={() => setActiveTab('payments')}
              className={`pb-2 text-xs font-bold uppercase tracking-widest font-sans border-b-2 transition-all flex items-center gap-2
                ${activeTab === 'payments' ? 'border-primary text-primary' : 'border-transparent text-secondary/40 hover:text-secondary'}`}
            >
              <CreditCard size={14} /> Payments History
            </button>
            <button 
              onClick={() => setActiveTab('expenses')}
              className={`pb-2 text-xs font-bold uppercase tracking-widest font-sans border-b-2 transition-all flex items-center gap-2
                ${activeTab === 'expenses' ? 'border-primary text-primary' : 'border-transparent text-secondary/40 hover:text-secondary'}`}
            >
              <List size={14} /> Operating Expenses
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-white border border-champagne/50 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
              <Search size={14} className="text-gray-400" />
              <input 
                type="text" 
                placeholder={activeTab === 'payments' 
                  ? "Search payments by Order ID or customer name..." 
                  : "Search expenses by category or note..."}
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
              {activeTab === 'payments' ? (
                <>
                  <option value="All">All Payment Statuses</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </>
              ) : (
                <>
                  <option value="All">All Expense Categories</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Courier">Courier</option>
                  <option value="Operations">Operations</option>
                  <option value="Other">Other</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Dynamic List Rendering depending on activeTab */}
        {activeTab === 'payments' ? (
          // Tab 1: Payments Ledger
          loading ? (
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
          )
        ) : (
          // Tab 2: Expenses Ledger
          loadingExpenses ? (
            <div className="p-12 text-center text-secondary/50 font-sans">Loading operating expenses...</div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-12 text-center text-secondary/50 font-sans">
              {expenses.length === 0 ? 'No operational expenses have been logged yet.' : 'No expenses match your search filters.'}
            </div>
          ) : (
            <>
              {/* Desktop Table Ledger */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-surface/50 border-b border-champagne/30 text-secondary uppercase tracking-widest text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-4">Expense Category</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Notes / Details</th>
                      <th className="px-6 py-4">Amount Spent</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-champagne/20">
                    {filteredExpenses.map(exp => (
                      <tr key={exp._id} className="hover:bg-surface/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] border
                            ${exp.category === 'Packaging' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              exp.category === 'Courier' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                exp.category === 'Operations' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                          >
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-secondary">{new Date(exp.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-primary font-medium max-w-sm truncate" title={exp.description}>
                          {exp.description || '—'}
                        </td>
                        <td className="px-6 py-4 font-bold text-red-500 text-sm">₹{exp.amount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteExpense(exp._id)}
                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards Ledger */}
              <div className="lg:hidden divide-y divide-champagne/20">
                {filteredExpenses.map(exp => (
                  <div key={exp._id} className="p-4 space-y-3 hover:bg-surface/20 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] border
                        ${exp.category === 'Packaging' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                          exp.category === 'Courier' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            exp.category === 'Operations' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                      >
                        {exp.category}
                      </span>
                      <span className="text-[10px] text-secondary/50">{new Date(exp.date).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-between items-end bg-surface/20 p-3 rounded-2xl border border-champagne/10">
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="text-secondary text-[11px] font-sans font-medium break-words leading-relaxed">
                          {exp.description || 'No description recorded'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-red-500 text-sm">₹{exp.amount.toLocaleString('en-IN')}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteExpense(exp._id)}
                          className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        )}
      </div>

      {/* Log Expense Modal Pop-up */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-champagne max-w-md w-full p-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-primary">Log Operational Expense</h2>
              <button 
                onClick={() => setShowExpenseModal(false)}
                className="text-secondary/50 hover:text-primary transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-secondary mb-2">Expense Category *</label>
                <select 
                  required
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full border border-champagne rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors font-sans bg-transparent text-xs text-primary"
                >
                  <option value="Packaging">Packaging (Covers, box envelopes, tape)</option>
                  <option value="Courier">Courier (Postage, logistics bills, wallet topup)</option>
                  <option value="Operations">Operations (Fabric, sewing accessories, labor)</option>
                  <option value="Other">Other Miscellaneous Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-secondary mb-2">Amount Spent (INR) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-xs text-secondary font-bold">₹</span>
                  <input 
                    required
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full border border-champagne rounded-xl pl-8 pr-4 py-2.5 outline-none focus:border-primary transition-colors font-sans text-xs bg-transparent text-primary font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-secondary mb-2">Expense Date *</label>
                <input 
                  required
                  type="date"
                  value={expenseForm.date}
                  onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full border border-champagne rounded-xl px-4 py-2.5 outline-none focus:border-primary transition-colors font-sans text-xs bg-transparent text-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-secondary mb-2">Description / Notes</label>
                <textarea 
                  rows="3"
                  placeholder="Record what was purchased or logged..."
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full border border-champagne rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors font-sans text-xs bg-transparent text-primary resize-none"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-champagne/20">
                <button 
                  type="button" 
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-3 border border-champagne text-secondary rounded-xl font-sans text-xs font-bold uppercase tracking-widest hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primaryContainer hover:bg-primary text-white rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-colors shadow-md"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
