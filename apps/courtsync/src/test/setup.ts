/**
 * Test Setup Configuration
 * 
 * This file configures the testing environment for CourtSync.
 * It sets up database connections, test utilities, and mock configurations.
 */

import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock Next.js router
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}))

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.DATABASE_ADAPTER = 'local'
process.env.STORAGE_ADAPTER = 'local'
process.env.DATABASE_URL = 'sqlite://test.db'
process.env.FEATURE_COURT_BOOKING = 'true'
process.env.FEATURE_VIDEO_CAPTURE = 'true'

// Global test setup
beforeAll(async () => {
  // Initialize test database
  console.log('Setting up test environment...')
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Global test teardown
afterAll(async () => {
  // Cleanup test database
  console.log('Cleaning up test environment...')
})

// Mock fetch for API testing
global.fetch = vi.fn()

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

export {}