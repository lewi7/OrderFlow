import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import type { RestaurantRegistrationRequest } from '../../types';

const RegisterForm: React.FC = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RestaurantRegistrationRequest>({
    restaurantName: '',
    restaurantAddress: '',
    restaurantPhone: '',
    restaurantEmail: '',
    username: '',
    password: '',
    fullName: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'restaurant' | 'owner'>('restaurant');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateRestaurantStep = () => {
    if (!formData.restaurantName.trim()) return 'Restaurant name is required';
    if (!formData.restaurantAddress.trim()) return 'Restaurant address is required';
    return null;
  };

  const validateOwnerStep = () => {
    if (!formData.username.trim()) return 'Username is required';
    if (formData.username.length < 3) return 'Username must be at least 3 characters';
    if (!formData.password.trim()) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (!formData.fullName.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Please enter a valid email';
    return null;
  };

  const handleNext = () => {
    const validationError = validateRestaurantStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep('owner');
  };

  const handleBack = () => {
    setStep('restaurant');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateOwnerStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await register(formData);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err.response as { data?: { message?: string } })?.data?.message || 'Registration failed. Please try again.'
        : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register Your Restaurant
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join OrderFlow and streamline your order management
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step === 'restaurant' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 'restaurant' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Restaurant Info</span>
          </div>
          <div className="w-8 h-px bg-gray-300"></div>
          <div className={`flex items-center ${step === 'owner' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step === 'owner' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Owner Account</span>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {step === 'restaurant' ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                  Restaurant Name *
                </label>
                <input
                  id="restaurantName"
                  name="restaurantName"
                  type="text"
                  required
                  className="input-field mt-1"
                  placeholder="Enter restaurant name"
                  value={formData.restaurantName}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="restaurantAddress" className="block text-sm font-medium text-gray-700">
                  Restaurant Address *
                </label>
                <input
                  id="restaurantAddress"
                  name="restaurantAddress"
                  type="text"
                  required
                  className="input-field mt-1"
                  placeholder="Enter restaurant address"
                  value={formData.restaurantAddress}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="restaurantPhone" className="block text-sm font-medium text-gray-700">
                  Restaurant Phone
                </label>
                <input
                  id="restaurantPhone"
                  name="restaurantPhone"
                  type="tel"
                  className="input-field mt-1"
                  placeholder="Enter restaurant phone"
                  value={formData.restaurantPhone}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="restaurantEmail" className="block text-sm font-medium text-gray-700">
                  Restaurant Email
                </label>
                <input
                  id="restaurantEmail"
                  name="restaurantEmail"
                  type="email"
                  className="input-field mt-1"
                  placeholder="Enter restaurant email"
                  value={formData.restaurantEmail}
                  onChange={handleChange}
                />
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="btn-primary w-full flex justify-center py-3"
              >
                Next: Owner Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-field mt-1"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field mt-1"
                  placeholder="Choose a password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="input-field mt-1"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field mt-1"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-secondary flex-1 py-3"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 flex justify-center py-3"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm; 