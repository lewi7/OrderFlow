import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types';
import apiService from '../../services/api';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  // const [restaurant, setRestaurant] = useState<Restaurant | null>(null); // Will be used for restaurant settings
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'configuration'>('profile');
  
  // Restaurant profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    simulatedOrderIntervalMinutes: 5
  });
  
  // User management form
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'STAFF' as User['role'],
    password: ''
  });
  
  // Configuration form
  const [configForm, setConfigForm] = useState({
    simulatedOrderIntervalMinutes: 5
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [restaurantData, usersData] = await Promise.all([
        apiService.getRestaurant(),
        apiService.getUsers()
      ]);
      
              // setRestaurant(restaurantData); // Will be used when restaurant settings are implemented
      setUsers(usersData);
      
      // Populate forms
      setProfileForm({
        name: restaurantData.name || '',
        address: restaurantData.address || '',
        phone: restaurantData.phone || '',
        email: restaurantData.email || '',
        simulatedOrderIntervalMinutes: restaurantData.simulatedOrderIntervalMinutes || 5
      });
      
      setConfigForm({
        simulatedOrderIntervalMinutes: restaurantData.simulatedOrderIntervalMinutes || 5
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.updateRestaurant(profileForm);
      await loadData(); // Reload data
      alert('Restaurant profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleUserCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createUser(userForm);
      setUserForm({
        username: '',
        email: '',
        fullName: '',
        role: 'STAFF',
        password: ''
      });
      await loadData(); // Reload users
      alert('User created successfully!');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  const handlePasswordReset = async (userId: number) => {
    const newPassword = prompt('Enter new password for user:');
    if (newPassword && newPassword.trim()) {
      try {
        await apiService.resetUserPassword(userId, newPassword.trim());
        alert('Password reset successfully!');
      } catch (error) {
        console.error('Failed to reset password:', error);
        alert('Failed to reset password. Please try again.');
      }
    }
  };

  const handleUserDelete = async (_userId: number) => { // Will be implemented when backend is ready
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Note: We need to implement deleteUser in the API service
        // For now, just show a message
        alert('User deletion not implemented yet. Please contact support.');
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
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
              <h1 className="text-xl font-semibold text-gray-900">⚙️ Settings</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.fullName} - {user?.role}
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

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏪 Restaurant Profile
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 User Management
            </button>
            <button
              onClick={() => setActiveTab('configuration')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'configuration'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔧 Configuration
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Profile</h2>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    className="input-field mt-1"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    required
                    className="input-field mt-1"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    className="input-field mt-1"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address *</label>
                  <input
                    type="text"
                    required
                    className="input-field mt-1"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary">
                Update Profile
              </button>
            </form>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Create User Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h2>
              <form onSubmit={handleUserCreate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username *</label>
                    <input
                      type="text"
                      required
                      className="input-field mt-1"
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      required
                      className="input-field mt-1"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="input-field mt-1"
                      value={userForm.fullName}
                      onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role *</label>
                    <select
                      required
                      className="input-field mt-1"
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as User['role'] })}
                    >
                      <option value="STAFF">Staff</option>
                      <option value="KITCHEN">Kitchen</option>
                      <option value="OWNER">Owner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Temporary Password *</label>
                    <input
                      type="password"
                      required
                      className="input-field mt-1"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary">
                  Create User
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Current Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((userItem) => (
                      <tr key={userItem.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{userItem.fullName}</div>
                            <div className="text-sm text-gray-500">{userItem.username}</div>
                            <div className="text-sm text-gray-500">{userItem.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            userItem.role === 'OWNER' ? 'bg-purple-100 text-purple-800' :
                            userItem.role === 'KITCHEN' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePasswordReset(userItem.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Reset Password
                            </button>
                            {userItem.role !== 'OWNER' && (
                              <button
                                onClick={() => handleUserDelete(userItem.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Simulated Order Interval (minutes)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  How often to generate simulated delivery orders for testing
                </p>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="input-field w-32"
                  value={configForm.simulatedOrderIntervalMinutes}
                  onChange={(e) => setConfigForm({ 
                    ...configForm, 
                    simulatedOrderIntervalMinutes: parseInt(e.target.value) || 5 
                  })}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>💡 <strong>Note:</strong> Configuration changes require a system restart to take effect.</p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 