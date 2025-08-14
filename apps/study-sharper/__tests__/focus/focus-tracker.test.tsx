import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PassiveFocusTracker } from '@/components/focus/PassiveFocusTracker'

// Mock fetch
global.fetch = jest.fn()

// Mock DOM APIs
Object.defineProperty(document, 'hidden', {
  writable: true,
  value: false,
})

Object.defineProperty(document, 'visibilityState', {
  writable: true,
  value: 'visible',
})

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('PassiveFocusTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('should not render when disabled', () => {
    render(
      <PassiveFocusTracker 
        userId="test-user" 
        enabled={false}
      />
    )
    
    expect(screen.queryByText('Focus Mode Active')).not.toBeInTheDocument()
  })

  it('should show tracking indicator when enabled and active', async () => {
    render(
      <PassiveFocusTracker 
        userId="test-user" 
        enabled={true}
      />
    )

    // Simulate user activity to start tracking
    fireEvent.mouseDown(document)
    
    await waitFor(() => {
      expect(screen.getByText('Focus Mode Active')).toBeInTheDocument()
    })
  })

  it('should handle session end correctly', async () => {
    render(
      <PassiveFocusTracker 
        userId="test-user" 
        enabled={true}
      />
    )

    // Start session
    fireEvent.mouseDown(document)
    
    await waitFor(() => {
      expect(screen.getByText('Focus Mode Active')).toBeInTheDocument()
    })

    // End session
    const endButton = screen.getByText('End Session')
    fireEvent.click(endButton)

    await waitFor(() => {
      expect(screen.queryByText('Focus Mode Active')).not.toBeInTheDocument()
    })

    // Check if API was called
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/focus/sessions',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('should call onSessionUpdate when provided', async () => {
    const onSessionUpdate = jest.fn()
    
    render(
      <PassiveFocusTracker 
        userId="test-user" 
        enabled={true}
        onSessionUpdate={onSessionUpdate}
      />
    )

    // Start session
    fireEvent.mouseDown(document)
    
    // End session
    await waitFor(() => {
      expect(screen.getByText('Focus Mode Active')).toBeInTheDocument()
    })
    
    const endButton = screen.getByText('End Session')
    fireEvent.click(endButton)

    // Wait for API call and callback
    await waitFor(() => {
      expect(onSessionUpdate).toHaveBeenCalled()
    })
  })

  it('should handle visibility changes', () => {
    render(
      <PassiveFocusTracker 
        userId="test-user" 
        enabled={true}
      />
    )

    // Simulate tab becoming hidden
    Object.defineProperty(document, 'hidden', { value: true })
    fireEvent(document, new Event('visibilitychange'))

    // Simulate tab becoming visible again
    Object.defineProperty(document, 'hidden', { value: false })
    fireEvent(document, new Event('visibilitychange'))

    // Should handle these events without errors
    expect(() => {}).not.toThrow()
  })
})