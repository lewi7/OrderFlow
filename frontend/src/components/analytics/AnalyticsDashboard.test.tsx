import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AnalyticsDashboard from './AnalyticsDashboard'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    getDailyAnalytics: vi.fn(),
    getTopSellingItems: vi.fn(),
    getRevenueAnalytics: vi.fn()
  }
}))

// Mock the auth context
const mockUser = {
  id: 1,
  username: 'testuser',
  fullName: 'Test User',
  email: 'test@example.com',
  role: 'OWNER',
  restaurant: { id: 1, name: 'Test Restaurant' }
}

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
)

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders analytics dashboard title', () => {
    render(
      <MockAuthProvider>
        <AnalyticsDashboard />
      </MockAuthProvider>
    )
    
    expect(screen.getByText('📊 Analytics Dashboard')).toBeInTheDocument()
  })

  it('renders revenue overview section', () => {
    render(
      <MockAuthProvider>
        <AnalyticsDashboard />
      </MockAuthProvider>
    )
    
    expect(screen.getByText('💰 Revenue Overview')).toBeInTheDocument()
  })

  it('renders daily analytics section', () => {
    render(
      <MockAuthProvider>
        <AnalyticsDashboard />
      </MockAuthProvider>
    )
    
    expect(screen.getByText('📈 Daily Analytics')).toBeInTheDocument()
  })

  it('renders top selling items section', () => {
    render(
      <MockAuthProvider>
        <AnalyticsDashboard />
      </MockAuthProvider>
    )
    
    expect(screen.getByText('🔥 Top Selling Items')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(
      <MockAuthProvider>
        <AnalyticsDashboard />
      </MockAuthProvider>
    )
    
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument()
  })

  it('renders period selector', () => {
    render(
      <MockAuthProvider>
        <AnalyticsDashboard />
      </MockAuthProvider>
    )
    
    expect(screen.getByText('Period:')).toBeInTheDocument()
    expect(screen.getByDisplayValue('7')).toBeInTheDocument()
  })
}) 