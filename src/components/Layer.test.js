import React from "react";
import "@testing-library/jest-dom";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import { Layer } from "./Layer";
import { NEW_LAYER } from "./constants";
import "../../__mocks__/window";

// Use these to assert invocations of App callbacks
const mockAddLayer = jest.fn((_layer) => {});
const mockUpdateLayer = jest.fn((_layer) => {});
const mockRemoveLayer = jest.fn((_key) => {});

jest.mock("../services/neo4jService", () => {
  return {
    neo4jService: {
      getNodeLabels: jest.fn(() => Promise.resolve({ status: 200, result: [] })),
      getRelationshipLabels: jest.fn(() => Promise.resolve({ status: 200, result: [] })),
      getProperties: jest.fn((_nodeFilter) => Promise.resolve({ status: 200, result: [] })),
      hasSpatial: jest.fn(() => Promise.resolve({ status: 200, result: false })),
      getSpatialLayers: jest.fn(() => Promise.resolve({ status: 200, result: [] })),
      getData: jest.fn((_query, _params) => Promise.resolve({ status: 200, result: [] })),
    },
  };
});

const renderNewLayer = () => {
  return render(
    <Layer
      key={NEW_LAYER.ukey}
      isNew={true}
      layer={NEW_LAYER}
      addLayer={mockAddLayer}
      updateLayer={mockUpdateLayer}
      removeLayer={mockRemoveLayer}
    />
  );
};

const testLayer1 = {
  ...NEW_LAYER,
  ukey: "tl1",
  name: "Test Layer 1",
};

const renderTestLayer = () => {
  return render(
    <Layer
      key={testLayer1.ukey}
      layer={testLayer1}
      addLayer={mockAddLayer}
      updateLayer={mockUpdateLayer}
      removeLayer={mockRemoveLayer}
    />
  );
};

describe("Test Layer component", () => {
  it("Starts out in a collapsed accordion which expands on click", () => {
    const renderResult = renderNewLayer();
    const layer = renderResult.getByText(NEW_LAYER.name);
    expect(layer).toBeDefined();

    // expect(renderResult.getByLabelText('Name')).not.toBeVisible(); // FIXME

    fireEvent.click(layer);
    expect(renderResult.getByLabelText("Name")).toBeVisible();
  });

  it("Can modify the layer name", () => {
    const renderResult = renderNewLayer();
    const nameField = renderResult.getByLabelText("Name");
    const newName = "New Layer Name";

    fireEvent.change(nameField, { target: { value: newName } });

    expect(renderResult.getByText(newName)).toBeDefined();
  });

  it("Can select/modify layer type property", () => {
    const renderResult = renderNewLayer();
    const latLonRadio = renderResult.getByLabelText("Lat/Lon");
    const builtInPointRadio = renderResult.getByLabelText("Point (neo4j built-in)");
    const spatialPluginPointRadio = renderResult.getByLabelText("Point (neo4j-spatial plugin)");
    const cypherQueryRadio = renderResult.getByLabelText("Advanced (cypher query)");

    expect(latLonRadio).toBeDefined();
    expect(builtInPointRadio).toBeDefined();
    expect(spatialPluginPointRadio).toBeDefined();
    expect(cypherQueryRadio).toBeDefined();

    // TODO: Assert rendering config default

    expect(latLonRadio).toBeChecked();
    expect(builtInPointRadio).not.toBeChecked();
    expect(spatialPluginPointRadio).not.toBeChecked();
    expect(spatialPluginPointRadio).toBeDisabled();
    expect(cypherQueryRadio).not.toBeChecked();

    act(() => {
      fireEvent.click(builtInPointRadio);
    });

    expect(latLonRadio).not.toBeChecked();
    expect(builtInPointRadio).toBeChecked();

    // TODO: Assert rendering config point

    act(() => {
      fireEvent.click(spatialPluginPointRadio);
    });

    expect(latLonRadio).not.toBeChecked();
    expect(builtInPointRadio).not.toBeChecked();
    expect(spatialPluginPointRadio).toBeChecked();

    // TODO: Assert rendering config spatial

    act(() => {
      // fireEvent.click(cypherQueryRadio); // FIXME
    });

    // expect(latLonRadio).not.toBeChecked();
    // expect(builtInPointRadio).not.toBeChecked();
    // expect(spatialPluginPointRadio).not.toBeChecked();
    // expect(cypherQueryRadio).toBeChecked();

    // TODO: Assert rendering config cypher
  });

  it("Can select/modify map rendering options", () => {
    const renderResult = renderNewLayer();
    const markersRadio = renderResult.getByLabelText("Markers");
    const polylineRadio = renderResult.getByLabelText("Polyline");
    const heatmapRadio = renderResult.getByLabelText("Heatmap");
    const clustersRadio = renderResult.getByLabelText("Clusters");

    expect(markersRadio).toBeDefined();
    expect(polylineRadio).toBeDefined();
    expect(heatmapRadio).toBeDefined();
    expect(clustersRadio).toBeDefined();

    // TODO: Extends assert rendering markers

    expect(markersRadio).toBeChecked();
    expect(polylineRadio).not.toBeChecked();
    expect(heatmapRadio).not.toBeChecked();
    expect(clustersRadio).not.toBeChecked();

    act(() => {
      fireEvent.click(polylineRadio);
    });

    expect(markersRadio).not.toBeChecked();
    expect(polylineRadio).toBeChecked();

    // TODO: Extends assert rendering polyline

    act(() => {
      fireEvent.click(heatmapRadio);
    });

    expect(markersRadio).not.toBeChecked();
    expect(polylineRadio).not.toBeChecked();
    expect(heatmapRadio).toBeChecked();

    // TODO: Extends assert rendering heatmap

    act(() => {
      fireEvent.click(clustersRadio);
    });

    expect(markersRadio).not.toBeChecked();
    expect(polylineRadio).not.toBeChecked();
    expect(heatmapRadio).not.toBeChecked();
    expect(clustersRadio).toBeChecked();

    // TODO: Extends assert rendering clusters
  });

  it("Can select and update layer color", () => {
    const renderResult = renderNewLayer();
    expect(true); // FIXME
  });

  it("Can configure heatmap radius", () => {
    const renderResult = renderNewLayer();
    expect(true); // FIXME
  });

  it("Has a `Create New Layer` button that makes call to create a new layer", async () => {
    const renderResult = renderNewLayer();
    const createLayerButton = renderResult.getByText("Create New Layer");

    expect(createLayerButton).toBeDefined();

    await act(async () => {
      fireEvent.click(createLayerButton);
    });

    expect(mockAddLayer).toHaveBeenCalledTimes(1);
  });

  /*
  it('New layer has no `Update Layer` button', () => {
    const renderResult = renderNewLayer();
    expect(renderResult.queryByText('Update Layer')).toBe(null);
  });
   */

  it("New layer has no `Delete Layer` button", () => {
    const renderResult = renderNewLayer();
    expect(renderResult.queryByText("Delete Layer")).toBe(null);
  });

  it("Created layer has an `Update Layer` button that makes call to update current layer", async () => {
    const renderResult = renderTestLayer();
    const updateLayerButton = renderResult.getByText("Update Layer");

    expect(updateLayerButton).toBeDefined();

    await act(async () => {
      fireEvent.click(updateLayerButton);
    });

    expect(mockUpdateLayer).toHaveBeenCalledTimes(1);
  });

  it("Created layer has a `Delete Layer` button that makes call to delete current layer", async () => {
    const renderResult = renderTestLayer();
    const deleteLayerButton = renderResult.getByText("Delete Layer");

    expect(deleteLayerButton).toBeDefined();

    await act(async () => {
      fireEvent.click(deleteLayerButton);
    });

    expect(mockRemoveLayer).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });
});
