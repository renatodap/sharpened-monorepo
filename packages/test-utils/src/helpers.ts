import { waitFor } from '@testing-library/react';

// Wait for async operations
export const waitForAsync = async (callback: () => void, options = {}) => {
  return waitFor(callback, {
    timeout: 3000,
    ...options,
  });
};

// Delay helper for testing timing
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock date helper
export const mockDate = (date: Date | string) => {
  const RealDate = Date;
  global.Date = class extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(date);
      } else {
        super(...args);
      }
    }
    static now() {
      return new RealDate(date).getTime();
    }
  } as any;
};

// Reset mocked date
export const resetDate = () => {
  const RealDate = Date;
  global.Date = RealDate;
};

// Assert element has styles
export const hasStyles = (element: HTMLElement, styles: Record<string, string>) => {
  const computedStyles = window.getComputedStyle(element);
  return Object.entries(styles).every(
    ([property, value]) => computedStyles.getPropertyValue(property) === value
  );
};

// Create mock FormData
export const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

// Mock file creator
export const createMockFile = (
  name: string,
  size: number,
  type: string,
  lastModified = Date.now()
) => {
  const file = new File(['a'.repeat(size)], name, {
    type,
    lastModified,
  });
  return file;
};

// Assert API was called with params
export const assertApiCalled = (
  mockFn: jest.Mock,
  expectedUrl: string,
  expectedOptions?: RequestInit
) => {
  expect(mockFn).toHaveBeenCalled();
  const calls = mockFn.mock.calls;
  const matchingCall = calls.find(([url]) => url.includes(expectedUrl));
  expect(matchingCall).toBeDefined();
  
  if (expectedOptions) {
    expect(matchingCall[1]).toMatchObject(expectedOptions);
  }
};

// Local storage helper
export const localStorageHelper = {
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get: (key: string) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  remove: (key: string) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  },
};

// Session storage helper
export const sessionStorageHelper = {
  set: (key: string, value: any) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  get: (key: string) => {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  remove: (key: string) => {
    sessionStorage.removeItem(key);
  },
  clear: () => {
    sessionStorage.clear();
  },
};

// Test ID helpers
export const testId = (id: string) => `[data-testid="${id}"]`;
export const getByTestId = (container: HTMLElement, id: string) =>
  container.querySelector(testId(id));

// Accessibility helpers
export const assertAriaLabel = (element: HTMLElement, label: string) => {
  expect(element.getAttribute('aria-label')).toBe(label);
};

export const assertAriaDescribedBy = (element: HTMLElement, id: string) => {
  expect(element.getAttribute('aria-describedby')).toBe(id);
};

// Form helpers
export const fillForm = async (
  container: HTMLElement,
  values: Record<string, string>
) => {
  for (const [name, value] of Object.entries(values)) {
    const input = container.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }
};

export const submitForm = (form: HTMLFormElement) => {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
};

// Validation helpers
export const hasError = (element: HTMLElement, errorMessage?: string) => {
  const errorElement = element.querySelector('[role="alert"]');
  if (!errorElement) return false;
  
  if (errorMessage) {
    return errorElement.textContent?.includes(errorMessage) ?? false;
  }
  
  return true;
};

// Snapshot helpers
export const cleanSnapshot = (html: string) => {
  return html
    .replace(/data-testid="[^"]*"/g, '')
    .replace(/id="[^"]*"/g, 'id="[id]"')
    .replace(/for="[^"]*"/g, 'for="[id]"')
    .replace(/\s+/g, ' ')
    .trim();
};