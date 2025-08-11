import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { DailyAnalytics, TopSellingItem, RevenueAnalytics } from '../../types';
import apiService from '../../services/api';

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalytics[]>([]);
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState<RevenueAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(7); // days

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const [daily, items, revenue] = await Promise.all([
        apiService.getDailyAnalytics(timeRange),
        apiService.getTopSellingItems(timeRange),
        apiService.getRevenueAnalytics(timeRange)
      ]);
      
      setDailyAnalytics(daily);
      setTopSellingItems(items);
      setRevenueAnalytics(revenue);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeRangeLabel = (days: number) => {
    switch (days) {
      case 7: return 'Last 7 Days';
      case 30: return 'Last 30 Days';
      case 90: return 'Last 90 Days';
      default: return `Last ${days} Days`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div role="status" className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">📊 Analytics Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.fullName} - {user?.role}
              </span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
                <option value={90}>Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Revenue Overview */}
        {revenueAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(revenueAnalytics.totalRevenue)}
              </p>
              <p className="text-sm text-gray-500">{getTimeRangeLabel(timeRange)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
              <p className="text-3xl font-bold text-blue-600">
                {revenueAnalytics.totalOrders}
              </p>
              <p className="text-sm text-gray-500">{getTimeRangeLabel(timeRange)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Average Order Value</h3>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(revenueAnalytics.averageOrderValue)}
              </p>
              <p className="text-sm text-gray-500">{getTimeRangeLabel(timeRange)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900">Busiest Day</h3>
              <p className="text-3xl font-bold text-orange-600">
                {revenueAnalytics.busiestDay ? formatDate(revenueAnalytics.busiestDay) : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">{getTimeRangeLabel(timeRange)}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Orders Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Orders</h2>
            {dailyAnalytics.length > 0 ? (
              <div className="space-y-3">
                {dailyAnalytics.map((day) => (
                  <div key={day.date} className="flex items-center space-x-3">
                    <div className="w-20 text-sm text-gray-600">
                      {formatDate(day.date)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((day.orderCount / Math.max(...dailyAnalytics.map(d => d.orderCount))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium text-gray-900">
                      {day.orderCount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No order data available</p>
              </div>
            )}
          </div>

          {/* Top Selling Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h2>
            {topSellingItems.length > 0 ? (
              <div className="space-y-4">
                {topSellingItems.slice(0, 10).map((item, index) => (
                  <div key={item.menuItemId} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{item.menuItemName}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{item.quantitySold}</div>
                      <div className="text-xs text-gray-500">sold</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Trend */}
        {revenueAnalytics && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
            {dailyAnalytics.length > 0 ? (
              <div className="space-y-3">
                {dailyAnalytics.map((day) => (
                  <div key={day.date} className="flex items-center space-x-3">
                    <div className="w-20 text-sm text-gray-600">
                      {formatDate(day.date)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-green-600 h-4 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((day.revenue / Math.max(...dailyAnalytics.map(d => d.revenue))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(day.revenue)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No revenue data available</p>
              </div>
            )}
          </div>
        )}

        {/* Insights */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Order Patterns</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Peak order times: {revenueAnalytics?.busiestDay ? 'Analyzing...' : 'Not enough data'}</li>
                <li>• Average daily orders: {revenueAnalytics ? Math.round(revenueAnalytics.totalOrders / timeRange) : 0}</li>
                <li>• Most popular category: {topSellingItems.length > 0 ? topSellingItems[0]?.category : 'Not enough data'}</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Revenue Insights</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Daily revenue average: {revenueAnalytics ? formatCurrency(revenueAnalytics.totalRevenue / timeRange) : 'Not enough data'}</li>
                <li>• Best performing item: {topSellingItems.length > 0 ? topSellingItems[0]?.menuItemName : 'Not enough data'}</li>
                <li>• Growth trend: {dailyAnalytics.length > 1 ? 'Analyzing...' : 'Not enough data'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 