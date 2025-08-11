import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/useAuth';
import type { MenuItem, CreateOrderRequest } from '../../types';
import apiService from '../../services/api';

const ManualOrderEntry: React.FC = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Array<{
    menuItem: MenuItem;
    quantity: number;
    notes: string;
  }>>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      setIsLoading(true);
      const menu = await apiService.getMenu();
      setMenuItems(menu);
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItemToOrder = (menuItem: MenuItem) => {
    const existingItem = selectedItems.find(item => item.menuItem.id === menuItem.id);
    
    if (existingItem) {
      setSelectedItems(selectedItems.map(item => 
        item.menuItem.id === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        menuItem,
        quantity: 1,
        notes: ''
      }]);
    }
  };

  const updateItemQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(selectedItems.filter(item => item.menuItem.id !== menuItemId));
    } else {
      setSelectedItems(selectedItems.map(item => 
        item.menuItem.id === menuItemId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const updateItemNotes = (menuItemId: number, notes: string) => {
    setSelectedItems(selectedItems.map(item => 
      item.menuItem.id === menuItemId 
        ? { ...item, notes }
        : item
    ));
  };

  const removeItem = (menuItemId: number) => {
    setSelectedItems(selectedItems.filter(item => item.menuItem.id !== menuItemId));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    if (!customerName.trim()) {
      alert('Please enter a customer name');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const orderData: CreateOrderRequest = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        notes: orderNotes.trim() || undefined,
        source: 'MANUAL' as const,
        items: selectedItems.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          notes: item.notes || undefined,
          unitPrice: item.menuItem.price
        }))
      };

      await apiService.createOrder(orderData);
      
      // Reset form
      setSelectedItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');
      
      alert('Order created successfully!');
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">📝 Manual Order Entry</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.fullName}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Menu Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🍽️ Menu Items</h2>
            
            {/* Search and Filter */}
            <div className="mb-4 space-y-3">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Items List */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 cursor-pointer transition-colors"
                    onClick={() => addItemToOrder(item)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-sm text-gray-500">{item.category}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-blue-600">${item.price.toFixed(2)}</p>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          ➕ Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Order Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🛒 Current Order</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Customer Information</h3>
                
                <input
                  type="text"
                  placeholder="Customer Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Selected Items */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Order Items</h3>
                
                {selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No items selected. Click on menu items to add them.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedItems.map((item) => (
                      <div key={item.menuItem.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.menuItem.name}</h4>
                            <p className="text-sm text-gray-600">${item.menuItem.price.toFixed(2)} each</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.menuItem.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            ❌ Remove
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-3 mb-2">
                          <label className="text-sm text-gray-600">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.menuItem.id, parseInt(e.target.value) || 1)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            ${(item.menuItem.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Item notes (optional)"
                          value={item.notes}
                          onChange={(e) => updateItemNotes(item.menuItem.id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Notes (optional)
                </label>
                <textarea
                  placeholder="Special instructions, allergies, etc."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Total and Submit */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || selectedItems.length === 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating Order...' : '📋 Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualOrderEntry; 