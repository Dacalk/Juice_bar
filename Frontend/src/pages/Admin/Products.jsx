import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  Coffee,
  X,
  Loader2,
  LayoutGrid,
  ClipboardList,
  Apple,
  CupSoda,
  TrendingDown
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

import { API_URL } from '../../store/useAuthStore';

const EMOJI_LIST = [
  '🍉', '🥭', '🍎', '🍏', '🍐', '🍊', '🍋', '🍌', '🍇', '🍓', 
  '🫐', '🍈', '🍒', '🍑', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', 
  '🥕', '🥨', '🍘', '🥠', '🍹', '🥤', '🧋', '🍵', '☕', '🍧', 
  '🍨', '🍦', '🍰', '🧁', '🍪', '🍩', '🥗', '🥪', '🥙'
];

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = useAuthStore(state => state.token);

  const defaultForm = {
    name: '',
    price: '',
    cost_price: '',
    category: 'FruitSalad',
    unit: 'pc',
    image: '🥤'
  };

  const [formData, setFormData] = useState(defaultForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    cost_price: '',
    category: 'FruitSalad',
    unit: 'pc',
    image: '',
    stock: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/products`, {
        name: formData.name,
        price: parseFloat(formData.price),
        cost_price: parseFloat(formData.cost_price) || 0,
        category: formData.category,
        unit: formData.unit,
        image: formData.image,
        stock: 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts([...products, response.data]);
      setIsAddModalOpen(false);
      setFormData(defaultForm);
    } catch (err) {
      setError('Failed to create item. Transaction aborted.');
      console.error(err);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      price: product.price,
      cost_price: product.cost_price ?? '',
      category: product.category,
      unit: product.unit,
      image: product.image,
      stock: product.stock
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/products/${editingProduct.id}`, {
        ...editFormData,
        price: parseFloat(editFormData.price),
        cost_price: parseFloat(editFormData.cost_price) || 0,
        stock: parseFloat(editFormData.stock) || 0
      }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      setProducts(products.map(p => p.id === editingProduct.id ? response.data : p));
      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      setError('Update failed.');
      console.error(err);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(`${API_URL}/products/${productToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Deletion rejected. Please ensure the server is responding.');
      console.error(err);
      setIsDeleteModalOpen(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CostPriceLabel = ({ product }) => {
    if (!product.cost_price && product.cost_price !== 0) return <span className="text-slate-600">—</span>;
    const isGram = product.category === 'Gram Section';
    return (
      <div>
        <span className="font-black text-sm text-amber-400">Rs. {Number(product.cost_price).toFixed(2)}</span>
        {isGram && product.unit && (
          <span className="block text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">/ {product.unit}g</span>
        )}
      </div>
    );
  };

  const SectionTable = ({ items, title, icon: Icon }) => (
    <div className="glass-panel rounded-[2.5rem] overflow-hidden mb-8 border border-white/5 shadow-2xl">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#eaf89b]">
            <Icon size={24} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight">{title}</h2>
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{items.length} Registered</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px] table-fixed">
          <thead>
            <tr className="bg-white/2">
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[45%]">Menu Item</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-[20%]">Selling Price</th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-[20%]">
                <span className="flex items-center justify-end gap-1.5">
                  <TrendingDown size={12} className="text-amber-400" />
                  Cost Price
                </span>
              </th>
              <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right w-[15%]">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">

            {items.map((p) => (
              <tr key={p.id} className="hover:bg-white/2 transition-colors">
                <td className="p-6 flex items-center gap-4">
                  <span className="text-3xl grayscale-[0.5] hover:grayscale-0 transition-all">{p.image || '🥤'}</span>
                  <div>
                    <p className="font-extrabold text-sm">{p.name}</p>
                    <p className="text-[10px] font-bold text-slate-500">ID: {p.id}</p>
                  </div>
                </td>
                <td className="p-6 text-right font-black text-sm text-[#eaf89b]">
                  Rs. {Number(p.price).toFixed(2)}
                  {p.category === 'Gram Section' && p.unit && (
                    <span className="block text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">/ {p.unit}g</span>
                  )}
                </td>
                <td className="p-6 text-right">
                  <CostPriceLabel product={p} />
                </td>
                <td className="p-6 text-right space-x-2">
                  <button onClick={() => handleEditClick(p)} className="p-2 text-slate-400 hover:text-white transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => { setProductToDelete(p); setIsDeleteModalOpen(true); }} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Shared input class
  const inputCls = "w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500/30 transition-all";
  const labelCls = "text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-2";

  return (
    <div className="w-full px-4 sm:px-6 space-y-6 sm:space-y-10 animate-scale-up">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 bg-white/5 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-3xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#eaf89b] to-[#c5eef5] rounded-[2rem] flex items-center justify-center text-slate-900 shadow-xl shadow-lime-500/20 rotate-3">
            <ClipboardList size={36} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Main Catalog</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Configure your offerings and inventory</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group flex-1">
            <Search className="absolute left-5 inset-y-0 my-auto text-slate-500 group-focus-within:text-white" size={18} />
            <input
              placeholder="Filter items..."
              className="h-14 pl-14 pr-6 bg-[#282828] border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-lime-500/20 transition-all font-bold w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-14 bg-white text-slate-900 px-8 sm:px-10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#eaf89b] transition-all flex items-center justify-center gap-3 whitespace-nowrap"
          >
            <Plus size={20} /> <span className="hidden sm:inline">New Item</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-40 text-center"><Loader2 size={40} className="animate-spin text-lime-500 mx-auto" /></div>
      ) : (
        <div className="flex flex-col gap-8">
          <SectionTable items={filteredProducts.filter(p => (p.category || '').includes('FruitSalad'))} title="FruitSalad Menu" icon={Apple} />
          <SectionTable items={filteredProducts.filter(p => (p.category || '').includes('Juice'))} title="Juice Menu" icon={CupSoda} />
          <SectionTable items={filteredProducts.filter(p => (p.category || '').includes('Gram'))} title="Gram Section" icon={Tag} />
          <SectionTable items={filteredProducts.filter(p => (p.category || '').includes('Other'))} title="Other Items" icon={Package} />
        </div>
      )}

      {/* Notification Toast */}
      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-red-500 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl animate-in slide-in-from-bottom-10 fade-in duration-300 flex items-center gap-3">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          {error}
          <button onClick={() => setError('')} className="ml-4 opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#000]/60 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative bg-[#202020] w-full max-w-sm rounded-[2.5rem] border border-white/10 overflow-hidden shadow-3xl animate-scale-up">
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Delete Item?</h3>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                Are you sure you want to permanently remove <span className="text-white">"{productToDelete?.name}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex border-t border-white/5">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/2 transition-colors border-r border-white/5">Cancel</button>
              <button onClick={handleDeleteProduct} className="flex-1 py-6 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#121212]/80 backdrop-blur-xl" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-[#202020] w-full max-w-md rounded-[3rem] border border-white/5 overflow-hidden animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="p-10 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#202020] z-10">
              <h3 className="text-2xl font-black uppercase tracking-tight">Add Food Item</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-10 space-y-6">
               {/* Icon Selection */}
                <div className="space-y-4">
                  <label className={labelCls}>Select Icon</label>
                  <div className="grid grid-cols-6 gap-2 p-4 bg-white/5 border border-white/10 rounded-3xl max-h-48 overflow-y-auto custom-scrollbar">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({...formData, image: emoji})}
                        className={`text-2xl p-2 rounded-xl transition-all hover:bg-white/10 ${formData.image === emoji ? 'bg-amber-500/20 ring-2 ring-amber-500/50 scale-110' : ''}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>Item Label</label>
                  <input required className={inputCls} placeholder="e.g. Fresh Orange Juice" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>

              {/* Category + Unit/Price */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Category</label>
                  <select className={`${inputCls} appearance-none`} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value, unit: e.target.value === 'Gram Section' ? '100' : 'pc'})}>
                    <option value="FruitSalad" className="bg-[#202020]">FruitSalad</option>
                    <option value="Juice" className="bg-[#202020]">Juice</option>
                    <option value="Gram Section" className="bg-[#202020]">Gram Section</option>
                    <option value="Other" className="bg-[#202020]">Other</option>
                  </select>
                </div>
                {formData.category === 'Gram Section' ? (
                  <div>
                    <label className={labelCls}>Ref. Grams (e.g. 100)</label>
                    <input type="number" required className={`${inputCls} text-[#eaf89b]`} value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} />
                  </div>
                ) : (
                  <div>
                    <label className={labelCls}>Selling Price (Rs.)</label>
                    <input type="number" step="0.01" required className={`${inputCls} text-[#eaf89b]`} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                  </div>
                )}
              </div>

              {/* Gram Section: price */}
              {formData.category === 'Gram Section' && (
                <div>
                  <label className={labelCls}>Selling Price for {formData.unit || 'X'}g (Rs.)</label>
                  <input type="number" step="0.01" required className={`${inputCls} text-[#eaf89b]`} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                </div>
              )}

              {/* Cost Price */}
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl border border-amber-500/20 pointer-events-none"></div>
                <div className="p-5 rounded-2xl bg-amber-500/5">
                  <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-2 px-2 flex items-center gap-2">
                    <TrendingDown size={12} /> Cost Price
                    {formData.category === 'Gram Section'
                      ? ` per ${formData.unit || 'X'}g (Rs.)`
                      : ' per unit (Rs.)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full h-14 px-6 bg-white/5 border border-amber-500/20 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-amber-400"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  />
                  <p className="text-[9px] text-slate-500 mt-2 px-2">Used to calculate profit in reports. Leave 0 if unknown.</p>
                </div>
              </div>

              <button className="w-full h-16 resto-gradient text-slate-900 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl">Finalize Registry</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-[#121212]/80 backdrop-blur-xl" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-[#202020] w-full max-w-md rounded-[3rem] border border-white/5 overflow-hidden animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="p-10 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#202020] z-10">
              <h3 className="text-2xl font-black uppercase tracking-tight">Edit Registry #{editingProduct?.id}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateProduct} className="p-10 space-y-6">
               {/* Icon Selection */}
                <div className="space-y-4">
                  <label className={labelCls}>Update Icon</label>
                  <div className="grid grid-cols-6 gap-2 p-4 bg-white/5 border border-white/10 rounded-3xl max-h-48 overflow-y-auto custom-scrollbar">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setEditFormData({...editFormData, image: emoji})}
                        className={`text-2xl p-2 rounded-xl transition-all hover:bg-white/10 ${editFormData.image === emoji ? 'bg-amber-500/20 ring-2 ring-amber-500/50 scale-110' : ''}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>Item Label</label>
                  <input required className={inputCls} value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelCls}>Selling Price (Rs.)</label>
                  <input type="number" step="0.01" required className={`${inputCls} text-[#eaf89b]`} value={editFormData.price} onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>Category</label>
                  <select className={`${inputCls} appearance-none`} value={editFormData.category} onChange={(e) => setEditFormData({...editFormData, category: e.target.value, unit: e.target.value === 'Gram Section' ? (editFormData.unit === 'pc' ? '100' : editFormData.unit) : 'pc'})}>
                    <option value="FruitSalad" className="bg-[#202020]">FruitSalad</option>
                    <option value="Juice" className="bg-[#202020]">Juice</option>
                    <option value="Gram Section" className="bg-[#202020]">Gram Section</option>
                    <option value="Other" className="bg-[#202020]">Other</option>
                  </select>
                </div>
              </div>
              {editFormData.category === 'Gram Section' && (
                <div className="space-y-2">
                  <label className={labelCls}>Reference Weight (Grams)</label>
                  <input type="number" required className={`${inputCls} text-[#eaf89b]`} value={editFormData.unit} onChange={(e) => setEditFormData({ ...editFormData, unit: e.target.value })} />
                </div>
              )}

              {/* Cost Price Edit */}
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl border border-amber-500/20 pointer-events-none"></div>
                <div className="p-5 rounded-2xl bg-amber-500/5">
                  <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-2 px-2 flex items-center gap-2">
                    <TrendingDown size={12} /> Cost Price
                    {editFormData.category === 'Gram Section'
                      ? ` per ${editFormData.unit || 'X'}g (Rs.)`
                      : ' per unit (Rs.)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full h-14 px-6 bg-white/5 border border-amber-500/20 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-amber-400"
                    value={editFormData.cost_price}
                    onChange={(e) => setEditFormData({ ...editFormData, cost_price: e.target.value })}
                  />
                  <p className="text-[9px] text-slate-500 mt-2 px-2">Used to calculate profit in reports.</p>
                </div>
              </div>

              <button className="w-full h-16 resto-gradient text-slate-900 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl">Update Records</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
