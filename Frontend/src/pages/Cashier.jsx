import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  LogOut,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
  Banknote,
  Search,
  ChevronRight,
  Receipt,
  Printer,
  Scale,
  LayoutDashboard,
  X
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import Logo from '../components/Logo';

import { API_URL } from '../store/useAuthStore';


const Cashier = () => {
  const { user, logout, token } = useAuthStore();
  const { cartItems, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Integrated Sidebar State Handling
  const [sidebarView, setSidebarView] = useState('billing'); // 'billing' | 'weight' | 'checkout' | 'success'
  const [selectedGramProduct, setSelectedGramProduct] = useState(null);
  const [inputWeight, setInputWeight] = useState('');
  const [gramInputMode, setGramInputMode] = useState('weight'); // 'weight' | 'price'
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const [activeCategory, setActiveCategory] = useState('All');

  const printRef = useRef();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products`);
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.error('Invalid products data format:', response.data);
        setProducts([]);
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product) => {
    if (product.category === 'Gram Section') {
      setSelectedGramProduct(product);
      setInputWeight('');
      setSidebarView('weight');
    } else {
      addItem(product);
    }
  };

  const handleAddWeightItem = () => {
    const val = parseFloat(inputWeight);
    if (isNaN(val) || val <= 0) {
      setError(`Please enter a valid ${gramInputMode === 'weight' ? 'weight' : 'price'}.`);
      return;
    }

    let finalWeight = val;
    if (gramInputMode === 'price') {
      const unitGrams = parseInt(selectedGramProduct?.unit.match(/(\d+)/)?.[0]) || 100;
      finalWeight = (val / selectedGramProduct.price) * unitGrams;
    }

    addItem(selectedGramProduct, finalWeight);
    setSidebarView('billing');
    setSelectedGramProduct(null);
    setInputWeight('');
    setGramInputMode('weight'); // Reset for next use
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setIsOrderProcessing(true);
    try {
      const orderData = {
        total: getTotal(),
        paid: getTotal(), // Standardize for now
        balance: 0,
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price // Backend will recalculate for Gram Section
        }))
      };

      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLastOrder(response.data);
      setSidebarView('success');
      clearCart();
      // Refresh products to show updated stock
      fetchProducts();
    } catch (err) {
      setError('Order failed. Check stock levels or connection.');
      console.error(err);
    } finally {
      setIsOrderProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const categories = ['All', 'FruitSalad', 'Juice', 'Gram Section'];

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeCategory === 'All' ||
      p.category === activeCategory ||
      (activeCategory === 'Juice' && p.category?.includes('&')))
  );

  return (
    <div className="resto-theme">
      <div className="flex flex-col h-screen w-screen font-sans overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-[#282828]/80 backdrop-blur-md border-b border-white/5 px-4 flex items-center justify-between shrink-0 shadow-xl z-50 no-print sticky top-0 w-full">
          <div className="flex items-center gap-4 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md rotate-3 group-hover:rotate-0 transition-all overflow-hidden">
              <Logo size={40} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase">Juice Bar POS</h1>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Active Terminal: Cashier System</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="group flex items-center gap-4 bg-[#202020] hover:bg-white/5 border border-white/5 py-2 pl-2 pr-6 rounded-full transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-black text-lg border border-white/10 group-hover:border-[#eaf89b]/50 transition-colors">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-white leading-tight uppercase tracking-tight">{user?.username || 'user'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-red-400 transition-colors">Click to Logout</span>
                  <LogOut size={10} className="text-slate-500 group-hover:text-red-400 transition-colors" />
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Main Layout */}
        <main className="flex flex-1 overflow-hidden py-6 px-4 gap-6 no-print w-full">
          {/* Product Grid (Left Container styled as glass-panel) */}
          <section className="flex-[2.2] glass-panel rounded-[3rem] border border-white/5 flex flex-col overflow-hidden shadow-2xl">

            <div className="p-8 pb-0">
              {/* Search Box */}
              <div className="relative group shrink-0">
                <Search size={20} className="absolute inset-y-0 left-5 my-auto text-slate-500 group-focus-within:text-[#eaf89b] transition-colors" />
                <input
                  type="text"
                  placeholder="Search delicious menu items..."
                  className="w-full h-16 pl-14 bg-[#282828] border border-white/5 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-[#eaf89b]/20 transition-all text-sm font-bold text-white shadow-inner focus:bg-white/5"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-4 mt-6 shrink-0 overflow-x-auto pb-4 custom-scrollbar no-scrollbar border-b border-white/5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-8 py-3 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-white/10 text-white border border-white/20 shadow-lg' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'}`}
                  >
                    {cat.split('&')[0]}
                    {cat === 'All' ? '' : <span className="ml-2 opacity-60 text-[#eaf89b]">●</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse">Loading Items...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
                  {filteredProducts.map((product) => {
                    const isOutOfStock = product.stock <= 0;
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className={`group bg-white/2 p-5 rounded-[2rem] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all text-left flex flex-col items-center justify-center gap-3 active:scale-95 duration-200 relative overflow-hidden`}
                      >
                        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                          {product.image || '🥤'}
                        </div>
                        <div className="text-center">
                          <p className="font-extrabold text-[#eaf89b] text-[10px] tracking-widest uppercase mb-1">{product.category.split('&')[0]}</p>
                          <p className="font-black text-white leading-tight">{product.name}</p>
                          <p className="text-sm font-black text-white mt-1">
                            Rs. {product.price.toFixed(2)}
                            {product.category === 'Gram Section' && (
                              <span className="text-[10px] text-slate-500 lowercase font-bold ml-1">/ {product.unit || '100'}g</span>
                            )}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Sidebar Panel (Right) - Now dynamic based on sidebarView */}
          <aside className="w-[420px] bg-[#1a1a1a] rounded-[3rem] shadow-xl border border-white/5 flex flex-col overflow-hidden shrink-0 transition-all duration-300">

            {sidebarView === 'billing' && (
              <>
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#eaf89b]">
                      <ShoppingCart size={20} />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Active Bill</h2>
                  </div>
                  <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest" onClick={clearCart}>Cancel</button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                  {cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl mb-4 flex items-center justify-center">
                        <Plus size={24} className="text-slate-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-500">Select items from the menu to start billing.</p>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div key={`${item.id}-${item.quantity}`} className="bg-white/5 flex items-center gap-4 group p-4 rounded-3xl hover:bg-white/10 transition-all border border-white/5 h-24">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                          {item.image || '🥤'}
                        </div>
                        <div className="flex-1">
                          <p className="font-extrabold text-white text-sm leading-tight mb-2">{item.name}</p>
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-5 h-5 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white font-bold select-none">-</button>
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">
                              {item.category === 'Gram Section' ? `${item.quantity}g` : `Qty: ${item.quantity}`}
                            </p>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-5 h-5 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold select-none">+</button>
                          </div>
                        </div>
                        <div className="text-right flex flex-col justify-between h-full py-1">
                          <button onClick={() => removeItem(item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-auto hover:text-red-400 p-1"><Trash2 size={16} /></button>
                          <p className="text-sm font-black text-[#eaf89b]">
                            Rs. {((item.category === 'Gram Section' ? (item.price / (parseFloat(item.unit) || 100)) * item.quantity : item.price * item.quantity)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-8 border-t border-white/5 space-y-6">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Grand Total</span>
                    <span className="text-2xl font-black text-white">Rs. {getTotal().toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => setSidebarView('checkout')}
                    disabled={cartItems.length === 0}
                    className="w-full h-16 resto-gradient text-slate-900 rounded-[2.5rem] font-black uppercase text-xs tracking-widest disabled:opacity-50 disabled:grayscale transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 group border border-white/10"
                  >
                    Place Order
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </>
            )}

            {sidebarView === 'weight' && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-10 duration-300">
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-5xl mb-6">{selectedGramProduct?.image}</div>
                  <h3 className="text-xl font-black mb-1 text-white uppercase tracking-tight">{selectedGramProduct?.name}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Stock: {selectedGramProduct?.stock}g | {selectedGramProduct?.price} LKR per {selectedGramProduct?.unit}g</p>
                  
                  {/* Mode Toggle */}
                  <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8 border border-white/5 w-full max-w-[280px]">
                    <button 
                      onClick={() => setGramInputMode('weight')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gramInputMode === 'weight' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      Weight (g)
                    </button>
                    <button 
                      onClick={() => setGramInputMode('price')}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${gramInputMode === 'price' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      Price (LKR)
                    </button>
                  </div>

                  <div className="relative w-full group">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-600 group-focus-within:text-white transition-colors">
                      {gramInputMode === 'weight' ? 'g' : 'Rs.'}
                    </span>
                    <input
                      autoFocus
                      type="number"
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-[2rem] text-center text-5xl font-black outline-none mb-6 text-white shadow-inner focus:bg-white/10 transition-all px-12"
                      placeholder="000"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddWeightItem()}
                    />
                  </div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8">
                    {gramInputMode === 'weight' ? 'Input amount in Grams' : 'Input total amount in LKR'}
                  </p>
                </div>
                <div className="p-8">
                  <button
                    onClick={handleAddWeightItem}
                    className="w-full h-16 resto-gradient rounded-full text-slate-900 font-extrabold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                  >
                    Confirm & Add to Bill
                  </button>
                </div>
              </div>
            )}

            {sidebarView === 'checkout' && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-10 duration-300">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Checkout</h2>
                  <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white" onClick={() => setSidebarView('billing')}>
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 p-8 overflow-y-auto">
                  <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center gap-1 mb-8 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Payable Amount</p>
                    <p className="text-4xl font-black text-[#eaf89b]">Rs. {getTotal().toFixed(2)}</p>
                  </div>

                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 pl-4">Payment Method</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex flex-col items-center gap-3 py-8 rounded-[2.5rem] border-2 transition-all ${paymentMethod === 'cash' ? 'border-[#eaf89b] bg-[#eaf89b]/10 shadow-[0_0_20px_rgba(234,248,155,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                    >
                      <Banknote size={24} className={paymentMethod === 'cash' ? 'text-[#eaf89b]' : 'text-slate-400'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'cash' ? 'text-[#eaf89b]' : 'text-slate-400'}`}>Cash</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`flex flex-col items-center gap-3 py-8 rounded-[2.5rem] border-2 transition-all ${paymentMethod === 'card' ? 'border-[#eaf89b] bg-[#eaf89b]/10 shadow-[0_0_20px_rgba(234,248,155,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                    >
                      <CreditCard size={24} className={paymentMethod === 'card' ? 'text-[#eaf89b]' : 'text-slate-400'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'card' ? 'text-[#eaf89b]' : 'text-slate-400'}`}>Card</span>
                    </button>
                  </div>
                </div>
                <div className="p-8 border-t border-white/5">
                  <button
                    onClick={handleCheckout}
                    disabled={isOrderProcessing}
                    className="w-full h-20 resto-gradient text-slate-900 rounded-[3rem] font-black uppercase text-xs tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                  >
                    {isOrderProcessing ? 'Processing...' : 'Confirm Transaction'}
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              </div>
            )}

            {sidebarView === 'success' && (
              <div className="flex flex-col h-full bg-emerald-500/5 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex-1 p-10 text-center flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Order Complete!</h3>
                  <p className="text-slate-400 text-sm mt-3 font-medium">Invoice: <span className="font-bold text-[#eaf89b]">{lastOrder?.invoice_number}</span></p>

                  <div className="mt-12 w-full space-y-4">
                    <button
                      onClick={() => setSidebarView('billing')}
                      className="w-full h-16 bg-emerald-500 text-slate-900 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      New Transaction
                    </button>
                    <button
                      onClick={handlePrint}
                      className="w-full h-16 bg-white/5 border border-emerald-500/30 hover:bg-white/10 text-emerald-400 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-colors"
                    >
                      <Printer size={16} />
                      Print Receipt
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </main>

        {/* Legacy Modals removed for streamlined Sidebar workflow */}

        {/* Thermal Receipt Component (Visible only when printing) */}
        <div className="print-only" style={{ display: 'none' }}>
          <div className="bg-white text-black p-4 font-mono text-[12px] leading-tight w-[80mm] mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold">JUICE BAR POS</h2>
              <p className="text-[10px]">Local Store Location</p>
              <p className="text-[10px]">Tel: +94 11 234 5678</p>
              <div className="border-b border-black border-dashed my-2"></div>
              <p className="font-bold">INVOICE: {lastOrder?.invoice_number}</p>
              <p className="text-[10px]">{new Date().toLocaleString()}</p>
            </div>

            <table className="w-full mb-4">
              <thead>
                <tr className="border-b border-black border-dashed">
                  <th className="text-left py-1">Item</th>
                  <th className="text-center py-1">Qty/Wt</th>
                  <th className="text-right py-1">Price</th>
                </tr>
              </thead>
              <tbody>
                {lastOrder?.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1">{item.product_id}</td> {/* Placeholder if item name not in response */}
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="text-right py-1">{item.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-black border-dashed pt-2 space-y-1">
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>LKR {lastOrder?.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between italic">
                <span>Paid ({paymentMethod})</span>
                <span>LKR {lastOrder?.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-[10px]">Thank you for visiting!</p>
              <p className="text-[10px]">Come back soon!</p>
              <div className="mt-4 opacity-50 text-[8px]">Software by JuiceShop v1.0</div>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {error && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl animate-in slide-in-from-bottom-10 fade-in duration-300 flex items-center gap-3 no-print">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            {error}
            <button onClick={() => setError('')} className="ml-4 opacity-50 hover:opacity-100">✕</button>
          </div>
        )}

        <style dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; margin: 0; padding: 0; }
          @page { margin: 0; size: 80mm auto; }
        }
      `}} />
      </div>
    </div>
  );
};

export default Cashier;
