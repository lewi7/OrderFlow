import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  LoginRequest, 
  LoginResponse, 
  RestaurantRegistrationRequest,
  Order,
  MenuItem,
  User,
  Restaurant,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  PaginatedResponse,
  DailyAnalytics,
  TopSellingItem,
  RevenueAnalytics
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async registerRestaurant(data: RestaurantRegistrationRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/register', data);
    return response.data;
  }

  // Orders
  async getOrders(page: number = 0, size: number = 20): Promise<PaginatedResponse<Order>> {
    const response: AxiosResponse<PaginatedResponse<Order>> = await this.api.get(`/orders?page=${page}&size=${size}`);
    return response.data;
  }

  async getOrder(id: number): Promise<Order> {
    const response: AxiosResponse<Order> = await this.api.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response: AxiosResponse<Order> = await this.api.post('/orders', orderData);
    return response.data;
  }

  async updateOrderStatus(id: number, statusData: UpdateOrderStatusRequest): Promise<Order> {
    const response: AxiosResponse<Order> = await this.api.put(`/orders/${id}/status`, statusData);
    return response.data;
  }

  async getActiveOrders(): Promise<Order[]> {
    const response: AxiosResponse<Order[]> = await this.api.get('/orders/active');
    return response.data;
  }

  // Menu
  async getMenu(): Promise<MenuItem[]> {
    const response: AxiosResponse<MenuItem[]> = await this.api.get('/menu');
    return response.data;
  }

  async createMenuItem(menuItem: Partial<MenuItem>): Promise<MenuItem> {
    const response: AxiosResponse<MenuItem> = await this.api.post('/menu', menuItem);
    return response.data;
  }

  async updateMenuItem(id: number, menuItem: Partial<MenuItem>): Promise<MenuItem> {
    const response: AxiosResponse<MenuItem> = await this.api.put(`/menu/${id}`, menuItem);
    return response.data;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await this.api.delete(`/menu/${id}`);
  }

  // Users
  async getUsers(): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.api.get('/users');
    return response.data;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put(`/users/${id}`, userData);
    return response.data;
  }

  async resetUserPassword(id: number, newPassword: string): Promise<void> {
    await this.api.put(`/users/${id}/password`, { password: newPassword });
  }

  // Restaurant
  async getRestaurant(): Promise<Restaurant> {
    const response: AxiosResponse<Restaurant> = await this.api.get('/restaurant');
    return response.data;
  }

  async updateRestaurant(restaurantData: Partial<Restaurant>): Promise<Restaurant> {
    const response: AxiosResponse<Restaurant> = await this.api.put('/restaurant', restaurantData);
    return response.data;
  }

  // Analytics
  async getDailyAnalytics(days: number = 7): Promise<DailyAnalytics[]> {
    const response: AxiosResponse<DailyAnalytics[]> = await this.api.get(`/analytics/daily?days=${days}`);
    return response.data;
  }

  async getTopSellingItems(days: number = 7): Promise<TopSellingItem[]> {
    const response: AxiosResponse<TopSellingItem[]> = await this.api.get(`/analytics/items?days=${days}`);
    return response.data;
  }

  async getRevenueAnalytics(days: number = 7): Promise<RevenueAnalytics> {
    const response: AxiosResponse<RevenueAnalytics> = await this.api.get(`/analytics/revenue?days=${days}`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 