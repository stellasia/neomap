import React from 'react';
import { render, rerender, cleanup } from '@testing-library/react';
import { Map } from './Map';
import { NEW_LAYER, RENDERING_POLYLINE, RENDERING_HEATMAP, RENDERING_CLUSTERS } from './Layer';

describe('Map tests', () => {
  it('plots marker layers', () => {
    render(<Map layers={[testMarkerLayer]}/>);

    expect(true); // FIXME
  });

  it('plots polyline layers', () => {
    render(<Map layers={[testPolylineLayer]}/>);

    expect(true); // FIXME
  });

  it('plots heatmap layers', () => {
    render(<Map layers={[testHeatmapLayer]}/>);

    expect(true); // FIXME
  });

  it('plots cluster layers', () => {
    render(<Map layers={[testClusterLayer]}/>);

    expect(true); // FIXME
  });

  it('plots multiple layers of different types and autoremoves deleted layers on update', () => {
    render(<Map layers={[
      testMarkerLayer,
      testPolylineLayer,
      testHeatmapLayer,
      testClusterLayer
    ]}/>);

    expect(true); // FIX

    rerender(<Map layers={[
      testMarkerLayer,
      testPolylineLayer,
      testClusterLayer
    ]}/>);

    expect(true); // FIXME
  });

  it('plots multiple layers within individual bounds', () => {
    render(<Map layers={[
      testBoundedMarkerLayer,
      testBoundedPolylineLayer,
      testBoundedHeatmapLayer,
      testBoundedClusterLayer
    ]}/>);

    expect(true); // FIXME
  });

  afterEach(() => {
    cleanup();
  });
});


// Test data

const testMarkerLayer = {
  ...NEW_LAYER,
  ukey: "mlyr",
  name: 'marker layer',
  data: [
    { pos: [], tooltip: "a" },
    { pos: [], tooltip: "b" }
  ]
};

const testPolylineLayer = {
  ...NEW_LAYER,
  ukey: "plyr",
  name: 'polyline layer',
  data: [
    { pos: [], tooltip: "a" },
    { pos: [], tooltip: "b" }
  ],
  rendering: RENDERING_POLYLINE
};

const testHeatmapLayer = {
  ...NEW_LAYER,
  ukey: "hlyr",
  name: 'heatmap layer',
  data: [
    { pos: [], tooltip: "a" },
    { pos: [], tooltip: "b" }
  ],
  rendering: RENDERING_HEATMAP
};

const testClusterLayer = {
  ...NEW_LAYER,
  ukey: "clyr",
  name: 'cluster layer',
  data: [
    { pos: [], tooltip: "a" },
    { pos: [], tooltip: "b" }
  ],
  rendering: RENDERING_CLUSTERS
};

const testBoundedMarkerLayer = {
  ...testMarkerLayer,
  bounds: [[40.712216, -74.22655], [40.773941, -74.12544]]
};

const testBoundedPolylineLayer = {
  ...testPolylineLayer,
  bounds: [[40.712216, -74.22655], [40.773941, -74.12544]]
};

const testBoundedHeatmapLayer = {
  ...testHeatmapLayer,
  bounds: [[40.712216, -74.22655], [40.773941, -74.12544]]
};

const testBoundedClusterLayer = {
  ...testClusterLayer,
  bounds: [[40.712216, -74.22655], [40.773941, -74.12544]]
};
