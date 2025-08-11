import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AnalyticsDashboard from './AnalyticsDashboard'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock the API service BEFORE any imports
vi.mock('../../services/api', () => ({
  default: {
    getDailyAnalytics: vi.fn(() => Promise.resolve([
      {
        date: '2024-01-01',
        orderCount: 10,
        totalRevenue: 150.00,
        averageOrderValue: 15.00,
        revenue: 150.00
      }
    ])),
    getTopSellingItems: vi.fn(() => Promise.resolve([
      {
        menuItemId: 1,
        menuItemName: 'Test Pizza',
        quantitySold: 5,
        totalRevenue: 75.00,
        category: 'Pizza'
      }
    ])),
    getRevenueAnalytics: vi.fn(() => Promise.resolve({
      totalRevenue: 150.00,
      averageOrderValue: 15.00,
      totalOrders: 10,
      period: '7 days',
      busiestDay: '2024-01-01'
    })),
    login: vi.fn(),
    registerRestaurant: vi.fn()
  }
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Mock a user in localStorage so AuthContext doesn't stay in loading state
  mockLocalStorage.getItem.mockImplementation((key: string) => {
    if (key === 'token') return 'mock-token'
    if (key === 'user') return JSON.stringify({
      id: 1,
      username: 'testuser',
      fullName: 'Test User',
      email: 'test@example.com',
      role: 'OWNER',
      restaurant: { id: 1, name: 'Test Restaurant' }
    })
    return null
  })

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders analytics dashboard title', async () => {
    render(
      <MockAuthProvider>
        <AnalyticsDashboard />
      </MockAuthProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('shows loading state initially', () => {
    render(
      <MockAuthProvider>
        <AnalyticsDashboard />
      </MockAuthProvider>
    )
    
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders period selector', async () => {
    render(
      <MockAuthProvider>
        <AnalyticsDashboard />
      </MockAuthProvider>
    )
    
    await waitFor(() => {
      // First check if the select element exists
      const selectElement = screen.getByRole('combobox')
      expect(selectElement).toBeInTheDocument()
      
      // Then check if it has the correct value
      expect(selectElement).toHaveValue('7')
    }, { timeout: 5000 })
  })
}) 