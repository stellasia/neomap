import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Map } from './Map';

// TODO: Define specs and add unit tests
// TODO: Consider moving mock store setup to a util
describe('Map tests', () => {
  it('renders the map', () => {
    const map = render(<Map />).container;
    expect(map).toBeDefined();
  });

  it('plots marker layers', () => {
    // TODO: Mock marker layer and assert
    render(<Map />);

    expect(true); // FIXME
  });

  it('plots polyline layers', () => {
    // TODO: Mock polyline layer and assert
    render(<Map />);

    expect(true); // FIXME
  });

  it('plots heatmap layers', () => {
    // TODO: Mock heatmap layer and assert
    render(<Map />);

    expect(true); // FIXME
  });

  afterEach(() => {
    cleanup();
  });
});