import React from "react";
import { render, cleanup } from "@testing-library/react";
import { SideBar } from "./SideBar";
import { NEW_LAYER } from "./constants";

const testLayer1 = {
  ukey: "tl1",
  name: "Test Layer 1",
};

const testLayer2 = {
  ukey: "tl2",
  name: "Test Layer 2",
};

jest.mock("./Layer", () => {
  return {
    Layer: ({ layer }) => <div key={layer.ukey}>{layer.name}</div>,
  };
});

// TODO: Define specs and add unit tests
describe("SideBar tests", () => {
  it("always renders one create new layer", () => {
    const { container: sidebar, getByText } = render(
      <SideBar layers={[]} addLayer={() => {}} updateLayer={() => {}} removeLayer={() => {}} />
    );

    expect(sidebar).toBeDefined();
    expect(getByText(NEW_LAYER.name)).toBeDefined();
  });

  it("renders multiple layers and the create new layer", () => {
    const { container: sidebar, getByText } = render(
      <SideBar layers={[testLayer1, testLayer2]} addLayer={() => {}} updateLayer={() => {}} removeLayer={() => {}} />
    );

    expect(sidebar).toBeDefined();
    expect(getByText(testLayer1.name)).toBeDefined();
    expect(getByText(testLayer2.name)).toBeDefined();
    expect(getByText(NEW_LAYER.name)).toBeDefined();
  });

  afterEach(() => {
    cleanup();
  });
});
