import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/useAuth';
import type { Order } from '../../types';
import apiService from '../../services/api';

const KitchenView: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActiveOrders();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(loadActiveOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveOrders = async () => {
    try {
      const response = await apiService.getActiveOrders();
      setOrders(response);
    } catch (error) {
      console.error('Failed to load active orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    try {
      await apiService.updateOrderStatus(orderId, { status });
      loadActiveOrders(); // Reload orders after update
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const activeOrders = orders.filter(order => 
    order.status === 'NEW' || order.status === 'PREPARING'
  );

  const newOrders = activeOrders.filter(order => order.status === 'NEW');
  const preparingOrders = activeOrders.filter(order => order.status === 'PREPARING');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">🍳 Kitchen View</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.fullName} - {user?.role}
              </span>
              <button
                onClick={loadActiveOrders}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-yellow-800">🆕 New Orders</h3>
            <p className="text-4xl font-bold text-yellow-600">{newOrders.length}</p>
          </div>
          <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-800">👨‍🍳 Preparing</h3>
            <p className="text-4xl font-bold text-blue-600">{preparingOrders.length}</p>
          </div>
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-800">📊 Total Active</h3>
            <p className="text-4xl font-bold text-green-600">{activeOrders.length}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* New Orders */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-yellow-300">
              <div className="bg-yellow-500 text-white px-6 py-4 rounded-t-lg">
                <h2 className="text-xl font-bold">🆕 New Orders ({newOrders.length})</h2>
              </div>
              <div className="p-6">
                {newOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">No new orders</p>
                    <p className="text-sm">All caught up! 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newOrders.map((order) => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        onStatusUpdate={updateOrderStatus}
                        variant="new"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preparing Orders */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300">
              <div className="bg-blue-500 text-white px-6 py-4 rounded-t-lg">
                <h2 className="text-xl font-bold">👨‍🍳 Preparing ({preparingOrders.length})</h2>
              </div>
              <div className="p-6">
                {preparingOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">No orders being prepared</p>
                    <p className="text-sm">Ready for new orders! 🚀</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {preparingOrders.map((order) => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        onStatusUpdate={updateOrderStatus}
                        variant="preparing"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Order Card Component
interface OrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: number, status: Order['status']) => void;
  variant: 'new' | 'preparing';
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate, variant }) => {
  const getSourceIcon = (source: Order['source']) => {
    const icons = {
      MANUAL: '📞',
      UberEats: '🚗',
      SkipTheDishes: '🛵',
      DoorDash: '🚚'
    };
    return icons[source] || '📋';
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const orderTime = new Date(timestamp);
    const diffMs = now.getTime() - orderTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${
      variant === 'new' ? 'border-yellow-300 bg-yellow-50' : 'border-blue-300 bg-blue-50'
    }`}>
      {/* Order Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            #{order.orderNumber}
          </h3>
          <p className="text-lg text-gray-700">
            {order.customerName || 'Walk-in Customer'}
          </p>
          <p className="text-sm text-gray-500">
            {getTimeAgo(order.createdAt)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl mb-1">
            {getSourceIcon(order.source)}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            variant === 'new' 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {order.source}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
        <div className="space-y-1">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.quantity}x {item.name}
              </span>
              <span className="text-gray-600">
                ${item.totalPrice.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        {order.notes && (
          <div className="mt-2 p-2 bg-orange-100 rounded border-l-4 border-orange-400">
            <p className="text-sm text-orange-800">
              <strong>Note:</strong> {order.notes}
            </p>
          </div>
        )}
      </div>

      {/* Order Footer */}
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold text-gray-900">
          Total: ${order.totalAmount.toFixed(2)}
        </div>
        <div className="flex space-x-2">
          {variant === 'new' && (
            <button
              onClick={() => onStatusUpdate(order.id, 'PREPARING')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              🚀 Start Preparing
            </button>
          )}
          {variant === 'preparing' && (
            <button
              onClick={() => onStatusUpdate(order.id, 'COMPLETED')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
            >
              ✅ Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenView; 