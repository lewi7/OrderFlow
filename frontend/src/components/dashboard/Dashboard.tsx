import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import type { Order } from '../../types';
import apiService from '../../services/api';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'preparing' | 'completed'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOrders(0, 50);
      setOrders(response.content);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: Order['status']) => {
    try {
      await apiService.updateOrderStatus(orderId, { status });
      loadOrders(); // Reload orders after update
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status.toLowerCase() === filter;
  });

  const getStatusBadge = (status: Order['status']) => {
    const statusClasses = {
      NEW: 'status-new',
      PREPARING: 'status-preparing',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled',
    };
    return <span className={statusClasses[status]}>{status}</span>;
  };

  const getSourceBadge = (source: Order['source']) => {
    const sourceColors = {
      MANUAL: 'bg-gray-100 text-gray-800',
      UberEats: 'bg-green-100 text-green-800',
      SkipTheDishes: 'bg-orange-100 text-orange-800',
      DoorDash: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceColors[source]}`}>
        {source}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">OrderFlow</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.fullName}
              </span>
              <button
                onClick={logout}
                className="btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className="border-b-2 border-blue-500 text-blue-600 px-3 py-4 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/kitchen"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-4 text-sm font-medium"
            >
              Kitchen View
            </Link>
            <Link
              to="/menu"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-4 text-sm font-medium"
            >
              Menu
            </Link>
            <Link
              to="/analytics"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-4 text-sm font-medium"
            >
              Analytics
            </Link>
            <Link
              to="/settings"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-4 text-sm font-medium"
            >
              Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">New Orders</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'NEW').length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Preparing</h3>
            <p className="text-3xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'PREPARING').length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900">Completed Today</h3>
            <p className="text-3xl font-bold text-green-600">
              {orders.filter(o => o.status === 'COMPLETED').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'new' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setFilter('preparing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'preparing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Preparing
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Orders</h2>
            <button
              onClick={loadOrders}
              className="btn-secondary"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.customerName || 'Walk-in Customer'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getSourceBadge(order.source)}
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-sm text-gray-600">
                          {item.quantity}x {item.name} - ${item.totalPrice.toFixed(2)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Total: ${order.totalAmount.toFixed(2)}
                    </div>
                    <div className="flex space-x-2">
                      {order.status === 'NEW' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                          className="btn-primary text-sm"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                          className="btn-primary text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 