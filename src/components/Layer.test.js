import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Layer, NEW_LAYER, NEW_LAYER_KEY } from './Layer';
import { neo4jService } from '../services/neo4jService'

// Use these to assert invocations of App callbacks
const mockAddLayer = jest.fn();
const mockUpdateLayer = jest.fn();
const mockRemoveLayer = jest.fn();

// Use these to assert invocations of neo4jService interfaces
const getDriverSpy = jest.spyOn(neo4jService, 'getNeo4jDriver');
const getNodeLabelsSpy = jest.spyOn(neo4jService, 'getNodeLabels');
const getPropertiesSpy = jest.spyOn(neo4jService, 'getProperties');
const hasSpatialSpy = jest.spyOn(neo4jService, 'hasSpatial');
const getSpatialLayersSpy = jest.spyOn(neo4jService, 'getSpatialLayers');
const getDataSpy = jest.spyOn(neo4jService, 'getData');

describe('Test Layer component', () => {
  let renderResult;

  beforeEach(() => {
    renderResult = render(
      <Layer
        key={NEW_LAYER_KEY}
        ukey={NEW_LAYER_KEY}
        layer={NEW_LAYER}
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

  it('Makes call to create/update layer', () => {
    const updateMapButton = renderResult.getByText('Update map');

    expect(updateMapButton).toBeDefined();

    fireEvent.click(updateMapButton);

    expect(true); // FIXME
    // expect(mockAddLayer).toHaveBeenCalledTimes(1);
  });

  it('Makes call to delete layer', () => {
    expect(true); // FIXME
  });

	afterEach(() => {
		cleanup();
	});
});
