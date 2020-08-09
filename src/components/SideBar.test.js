import React from 'react';
import { render, cleanup } from '@testing-library/react'
import { SideBar } from './SideBar';

// TODO: Define specs and add unit tests
describe('SideBar tests', () => {
  it('renders the sidebar', () => {
    const wrapper = render(<SideBar />).container;

    expect(wrapper).toBeDefined();
  });

  it('lists a new layer with default configuration', () => {
    // TODO: assert default layer
    expect(true); // FIXME
  });

  it('lists multiple layers created', () => {
    // TODO: Mock multiple layers and assert
    expect(true); // FIXME
  });

  afterEach(() => {
    cleanup();
  });
});
