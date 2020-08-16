import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Layer, NEW_LAYER, NEW_LAYER_KEY } from './Layer';

// Use these to assert invocations of App callbacks
const mockAddLayer = jest.fn((_layer) => {});
const mockUpdateLayer = jest.fn((_layer) => {});
const mockRemoveLayer = jest.fn((_key) => {});

jest.mock('../services/neo4jService', () => {
  return {
    getNeo4jDriver: jest.fn(() => Promise.resolve({})),
    getNodeLabels: jest.fn((_driver) => Promise.resolve([])),
    getProperties: jest.fn((_driver, _nodeFilter) => Promise.resolve([])),
    hasSpatial: jest.fn((_driver) => Promise.resolve(false)),
    getSpatialLayers: jest.fn((_driver) => Promise.resolve([])),
    getData: jest.fn((_driver, _query, _params) => Promise.resolve([]))
  }
});

describe('Test Layer component', () => {
  let renderResult;

  beforeEach(() => {
    renderResult = render(
      <Layer
        key={NEW_LAYER_KEY}
        ukey={NEW_LAYER_KEY}
        layer={NEW_LAYER}
        driver={{}}
        addLayer={mockAddLayer}
        updateLayer={mockUpdateLayer}
        removeLayer={mockRemoveLayer}
      />
    );
  });

  it('Starts out in a collapsed accordion which expands on click', () => {
    const layer = renderResult.getByText(NEW_LAYER.name);

    expect(layer).toBeDefined();

    // expect(renderResult.getByLabelText('Name')).not.toBeVisible(); // FIXME

    fireEvent.click(layer);
    expect(renderResult.getByLabelText('Name')).toBeVisible();
  });

	it('Can modify the layer name', () => {
    const nameField = renderResult.getByLabelText('Name');
    const newName = "New Layer Name";

    fireEvent.change(nameField, {target: {value: newName}});

		expect(renderResult.getByText(newName)).toBeDefined();
	});

	it('Can select/modify layer type property', () => {
    const latLonRadio = renderResult.getByLabelText('Lat/Lon');
    const builtInPointRadio = renderResult.getByLabelText('Point (neo4j built-in)');
    const spatialPluginPointRadio = renderResult.getByLabelText('Point (neo4j-spatial plugin)');
    const cypherQueryRadio = renderResult.getByLabelText('Advanced (cypher query)');

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

    fireEvent.click(builtInPointRadio);

    expect(latLonRadio).not.toBeChecked();
    expect(builtInPointRadio).toBeChecked();

    // TODO: Assert rendering config point

    fireEvent.click(spatialPluginPointRadio);

    expect(latLonRadio).not.toBeChecked();
    expect(builtInPointRadio).not.toBeChecked();
    expect(spatialPluginPointRadio).toBeChecked();

    // TODO: Assert rendering config spatial

    // fireEvent.click(cypherQueryRadio); // FIXME

    // expect(latLonRadio).not.toBeChecked();
    // expect(builtInPointRadio).not.toBeChecked();
    // expect(spatialPluginPointRadio).not.toBeChecked();
    // expect(cypherQueryRadio).toBeChecked();

    // TODO: Assert rendering config cypher
  });

  it('Can select/modify map rendering options', () => {
    const markersRadio = renderResult.getByLabelText('Markers');
    const polylineRadio = renderResult.getByLabelText('Polyline');
    const heatmapRadio = renderResult.getByLabelText('Heatmap');
    const clustersRadio = renderResult.getByLabelText('Clusters');

    expect(markersRadio).toBeDefined();
    expect(polylineRadio).toBeDefined();
    expect(heatmapRadio).toBeDefined();
    expect(clustersRadio).toBeDefined();

    // TODO: Extends assert rendering markers

    expect(markersRadio).toBeChecked();
    expect(polylineRadio).not.toBeChecked();
    expect(heatmapRadio).not.toBeChecked();
    expect(clustersRadio).not.toBeChecked();

    fireEvent.click(polylineRadio);

    expect(markersRadio).not.toBeChecked();
    expect(polylineRadio).toBeChecked();

    // TODO: Extends assert rendering polyline

    fireEvent.click(heatmapRadio);

    expect(markersRadio).not.toBeChecked();
    expect(polylineRadio).not.toBeChecked();
    expect(heatmapRadio).toBeChecked();

    // TODO: Extends assert rendering heatmap

    fireEvent.click(clustersRadio);

    expect(markersRadio).not.toBeChecked();
    expect(polylineRadio).not.toBeChecked();
    expect(heatmapRadio).not.toBeChecked();
    expect(clustersRadio).toBeChecked();

    // TODO: Extends assert rendering clusters
  });

  it('Can select and update layer color', () => {
    expect(true); // FIXME
  });

  it('Can configure heatmap radious', () => {
    expect(true); // FIXME
  });

  it('Makes call to create new layer', () => {
    const createLayerButton = renderResult.getByText('Create New Layer');

    expect(createLayerButton).toBeDefined();

    fireEvent.click(createLayerButton);

    expect(true); // FIXME
    expect(mockAddLayer).toHaveBeenCalledTimes(1);
  });

  it('Makes call to update layer', () => {
    const updateLayerButton = renderResult.getByText('Update Layer');

    expect(updateLayerButton).toBeDefined();

    fireEvent.click(updateLayerButton);

    expect(true); // FIXME
    expect(mockUpdateLayer).toHaveBeenCalledTimes(1);
  });

  it('New layer has no delete button', () => {
    const deleteLayerButton = renderResult.getByText('Delete Layer');

    expect(deleteLayerButton).not.toBeDefined();
  });

	afterEach(() => {
		cleanup();
	});
});
