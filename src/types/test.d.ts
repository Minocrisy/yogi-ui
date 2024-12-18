import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveClass(className: string): R;
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toBeDisabled(): R;
    }
  }
}

// Extend window with any custom properties we use in tests
declare global {
  interface Window {
    matchMedia: (query: string) => {
      matches: boolean;
      media: string;
      onchange: null;
      addListener: jest.Mock;
      removeListener: jest.Mock;
      addEventListener: jest.Mock;
      removeEventListener: jest.Mock;
      dispatchEvent: jest.Mock;
    };
  }
}

export {};
