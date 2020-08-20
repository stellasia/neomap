import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { SideBar } from './SideBar';
import { NEW_LAYER } from './Layer';

const testLayer1 = {
  ...NEW_LAYER,
  ukey: "tl1",
  name: 'Test Layer 1'
};

const testLayer2 = {
  ...NEW_LAYER,
  ukey: "tl2",
  name: 'Test Layer 2'
};

// TODO: Define specs and add unit tests
describe('SideBar tests', () => {
  it('renders the sidebar', () => {
    const sidebar = render(<SideBar layers={[]} />).container;

    expect(sidebar).toBeDefined();
  });

  it('always renders one create new layer', () => {
    const {container:sidebar, getByText} = render(<SideBar layers={[]} />);

    expect(sidebar).toBeDefined();
    expect(getByText(NEW_LAYER.name)).toBeDefined();
  });

  it('renders multiple layers and the create new layer', () => {
    const {container:sidebar, getByText} = render(<SideBar layers={[ testLayer1, testLayer2]} />);

    expect(sidebar).toBeDefined();
    expect(getByText(testLayer1.name)).toBeDefined();
    expect(getByText(testLayer2.name)).toBeDefined();
    expect(getByText(NEW_LAYER.name)).toBeDefined();
  });

  afterEach(() => {
    cleanup();
  });
});
