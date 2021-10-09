import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Map } from "./Map";
import { NEW_LAYER, RENDERING_POLYLINE, RENDERING_HEATMAP, RENDERING_CLUSTERS } from "./Layer";

jest.mock("leaflet");

// TODO: Complete test cases!!!

describe("Map tests", () => {
  it("plots marker layers", () => {
    render(<Map layers={[testMarkerLayer]} />);

    expect(true); // FIXME
    // expect(getByText('Big Diomede')).toBeDefined();
    // expect(getByText('Ezzahara')).toBeDefined();
    // expect(getByText('Diogo Lopes')).toBeDefined();
    // expect(getByText('Oban')).toBeDefined();
  });

  it("plots polyline layers", () => {
    render(<Map layers={[testPolylineLayer]} />);

    expect(true); // FIXME
  });

  it("plots heatmap layers", () => {
    render(<Map layers={[testHeatmapLayer]} />);

    expect(true); // FIXME
  });

  it("plots cluster layers", () => {
    render(<Map layers={[testClusterLayer]} />);

    expect(true); // FIXME
  });

  it("plots multiple layers of different types and autoremoves deleted layers on update", () => {
    const renderResult = render(
      <Map layers={[testMarkerLayer, testPolylineLayer, testHeatmapLayer, testClusterLayer]} />
    );

    expect(true); // FIX

    renderResult.rerender(<Map layers={[testMarkerLayer, testPolylineLayer, testClusterLayer]} />);

    expect(true); // FIXME
  });

  it("plots multiple layers within individual bounds", () => {
    render(<Map layers={[testMarkerLayer, testPolylineLayer, testHeatmapLayer, testClusterLayer]} />);

    expect(true); // FIXME
  });

  afterEach(() => {
    cleanup();
  });
});

//#region Test Data

const testMarkerLayer = {
  ...NEW_LAYER,
  ukey: "mlyr",
  name: "marker layer",
  data: [
    { pos: [65.7748473, -168.9437527], tooltip: "Big Diomede" },
    { pos: [35.8429415, -5.5551773], tooltip: "Ezzahara" },
    { pos: [-5.0928441, -36.4576796], tooltip: "Diogo Lopes" },
    { pos: [-46.8988914, 168.1239884], tooltip: "Oban" },
  ],
  bounds: [
    [40.712216, -74.22655],
    [40.773941, -74.12544],
  ],
};

const testPolylineLayer = {
  ...testMarkerLayer,
  ukey: "plyr",
  name: "polyline layer",
  rendering: RENDERING_POLYLINE,
};

const testHeatmapLayer = {
  ...testMarkerLayer,
  ukey: "hlyr",
  name: "heatmap layer",
  rendering: RENDERING_HEATMAP,
};

const testClusterLayer = {
  ...testMarkerLayer,
  ukey: "clyr",
  name: "cluster layer",
  rendering: RENDERING_CLUSTERS,
};

//#endregion
