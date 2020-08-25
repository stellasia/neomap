import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Map } from './Map';

// TODO: Define specs and add unit tests
// TODO: Consider moving mock store setup to a util
describe('Map tests', () => {
  it('renders the map', () => {
    const map = render(<Map layers={[]}/>).container;
    expect(map).toBeDefined();
  });

  it('plots marker layers', () => {
    // TODO: Mock marker layer and assert
    render(<Map layers={[]}/>);

    expect(true); // FIXME
  });

  it('plots polyline layers', () => {
    // TODO: Mock polyline layer and assert
    render(<Map layers={[]}/>);

    expect(true); // FIXME
  });

  it('plots heatmap layers', () => {
    // TODO: Mock heatmap layer and assert
    render(<Map layers={[]}/>);

    expect(true); // FIXME
  });

  afterEach(() => {
    cleanup();
  });
});