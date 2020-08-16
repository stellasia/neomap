import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { ColorPicker } from './ColorPicker';

describe('ColorPicker tests', () => {
    it('renders the color picker', () => {
      const picker = render(<ColorPicker />).container;

      expect(picker).toBeDefined();
    });

    afterEach(() => {
      cleanup();
    });
});
