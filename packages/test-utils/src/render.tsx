import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Custom render with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
  user?: any;
  router?: any;
}

// All providers wrapper
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// Custom render function
export const render = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const user = userEvent.setup();
  
  const rendered = rtlRender(ui, {
    wrapper: AllTheProviders,
    ...options,
  });

  return {
    ...rendered,
    user,
  };
};

// Render with router
export const renderWithRouter = (
  ui: ReactElement,
  {
    route = '/',
    push = jest.fn(),
    ...options
  }: CustomRenderOptions & { route?: string; push?: jest.Mock } = {}
) => {
  // Mock router implementation
  const mockRouter = {
    pathname: route,
    route,
    query: {},
    asPath: route,
    push,
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
  };

  return {
    ...render(ui, { ...options, router: mockRouter }),
    router: mockRouter,
  };
};

// Render hook with providers
export const renderHookWithProviders = (hook: () => any, options?: CustomRenderOptions) => {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders>{children}</AllTheProviders>
  );

  return {
    ...hook(),
    wrapper,
  };
};

// Async render helper
export const renderAsync = async (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const result = render(ui, options);
  
  // Wait for any initial async operations
  await new Promise((resolve) => setTimeout(resolve, 0));
  
  return result;
};

// Render with mock data
export const renderWithMockData = (
  ui: ReactElement,
  mockData: any,
  options?: CustomRenderOptions
) => {
  // Set up mock data in appropriate stores/contexts
  const initialState = {
    ...mockData,
  };

  return render(ui, {
    ...options,
    initialState,
  });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { userEvent };