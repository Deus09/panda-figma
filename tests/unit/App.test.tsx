import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '../utils/test-render';
import App from '../../src/App';

describe('App Component', () => {
  it('renders without crashing', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeDefined();
  });
});
