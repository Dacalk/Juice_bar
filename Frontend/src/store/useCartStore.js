import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  cartItems: [],
  
  addItem: (product, weight = null) => {
    const { cartItems } = get();
    const isGramSection = product.category === 'Gram Section';
    
    // If it's a gram section item, we add it as a new entry if weight is provided, 
    // or update weight if it's the exact same product and we want to merge (optional).
    // For now, let's just add/update.
    const existingIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingIndex > -1 && !isGramSection) {
      const newItems = [...cartItems];
      newItems[existingIndex].quantity += 1;
      set({ cartItems: newItems });
    } else {
      // For gram section, quantity is the weight in grams
      const quantity = isGramSection ? (weight || 100) : 1;
      set({ cartItems: [...cartItems, { ...product, quantity }] });
    }
  },
  
  removeItem: (productId) => {
    set({ cartItems: get().cartItems.filter(item => item.id !== productId) });
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const newItems = get().cartItems.map(item => 
      item.id === productId ? { ...item, quantity } : item
    );
    set({ cartItems: newItems });
  },
  
  clearCart: () => set({ cartItems: [] }),
  
  getTotal: () => {
    return get().cartItems.reduce((sum, item) => {
      if (item.category === 'Gram Section') {
        const unitMatch = item.unit.match(/(\d+)/);
        let unitGrams = unitMatch ? parseInt(unitMatch[1]) : 100;
        if (item.unit.toLowerCase().includes('kg')) unitGrams *= 1000;
        return sum + (item.price / unitGrams) * item.quantity;
      }
      return sum + (item.price * item.quantity);
    }, 0);
  }
}));

export default useCartStore;
