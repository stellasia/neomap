import * as React from 'react';
import Select from 'react-select';
import { Form } from 'react-bootstrap';
import { CypherEditor } from "graph-app-kit/components/Editor"
import { ColorPicker } from "./ColorPicker";
import {
  LAYER_TYPE_LATLON,
  LAYER_TYPE_POINT,
  LAYER_TYPE_CYPHER,
  LAYER_TYPE_SPATIAL,
  RENDERING_MARKERS,
  RENDERING_POLYLINE,
  RENDERING_HEATMAP,
  RENDERING_CLUSTERS
} from './constants';


export const LayerTypeForm = React.memo(({
  state,
  handleLayerTypeChange
}) => {
  return (
    <>
      <h4>{'Data'}</h4>

      <Form.Group controlId="formLayerType">
        <Form.Label>Layer type</Form.Label>
        <Form.Check
          type="radio"
          id={LAYER_TYPE_LATLON}
          label={"Lat/Lon"}
          value={LAYER_TYPE_LATLON}
          checked={state.layerType === LAYER_TYPE_LATLON}
          onChange={handleLayerTypeChange}
          name="layerTypeLatLon"
        />
        <Form.Check
          type="radio"
          id={LAYER_TYPE_POINT}
          label={"Point (neo4j built-in)"}
          value={LAYER_TYPE_POINT}
          checked={state.layerType === LAYER_TYPE_POINT}
          onChange={handleLayerTypeChange}
          name="layerTypePoint"
        />
        <Form.Check
          type="radio"
          id={LAYER_TYPE_SPATIAL}
          label={"Point (neo4j-spatial plugin)"}
          value={LAYER_TYPE_SPATIAL}
          checked={state.layerType === LAYER_TYPE_SPATIAL}
          onChange={handleLayerTypeChange}
          name="layerTypeSpatial"
          disabled={!state.hasSpatialPlugin}
          className="beta"
        />
        <Form.Check
          type="radio"
          id={LAYER_TYPE_CYPHER}
          label={"Advanced (cypher query)"}
          value={LAYER_TYPE_CYPHER}
          checked={state.layerType === LAYER_TYPE_CYPHER}
          onChange={handleLayerTypeChange}
          name="layerTypeCypher"
        />
      </Form.Group>
    </>
  );
});

export const MapRenderingForm = React.memo(({
  state,
  handleRenderingChange,
  handleColorChange,
  handleRadiusChange
}) => {
  return (
    <>
      <h4>{'Map rendering'}</h4>

      <Form.Group controlId="formRendering">
        <Form.Label>Rendering</Form.Label>
        <Form.Check
          type="radio"
          id={RENDERING_MARKERS}
          label={"Markers"}
          value={RENDERING_MARKERS}
          checked={state.rendering === RENDERING_MARKERS}
          onChange={handleRenderingChange}
          name="mapRenderingMarker"
        />
        <Form.Check
          type="radio"
          id={RENDERING_POLYLINE}
          label={"Polyline"}
          value={RENDERING_POLYLINE}
          checked={state.rendering === RENDERING_POLYLINE}
          onChange={handleRenderingChange}
          name="mapRenderingPolyline"
        />
        <Form.Check
          type="radio"
          id={RENDERING_HEATMAP}
          label={"Heatmap"}
          value={RENDERING_HEATMAP}
          checked={state.rendering === RENDERING_HEATMAP}
          onChange={handleRenderingChange}
          name="mapRenderingHeatmap"
          className="beta"
        />
        <Form.Check
          type="radio"
          id={RENDERING_CLUSTERS}
          label={"Clusters"}
          value={RENDERING_CLUSTERS}
          checked={state.rendering === RENDERING_CLUSTERS}
          onChange={handleRenderingChange}
          name="mapRenderingCluster"
          className="beta"
        />
      </Form.Group>

      <Form.Group controlId="formColor"
        hidden={state.rendering === RENDERING_HEATMAP}
        name="formgroupColor">
        <Form.Label>Color</Form.Label>
        <ColorPicker
          color={state.color}
          handleColorChange={handleColorChange}
        />
      </Form.Group>

      <Form.Group controlId="formRadius" hidden={state.rendering !== RENDERING_HEATMAP} >
        <Form.Label>Heatmap radius</Form.Label>
        <Form.Control
          type="range"
          min="1"
          max="100"
          defaultValue={state.radius}
          className="slider"
          onChange={handleRadiusChange}
          name="radius"
        />
      </Form.Group>
    </>
  )
});

export const LatLonLayerForm = React.memo(({
  state,
  handleNodeLabelChange,
  handleLatPropertyChange,
  handleLonPropertyChange,
  handleTooltipPropertyChange,
  handleLimitChange
}) => {
  return (
    <div>
      <Form.Group controlId="formNodeLabel">
        <Form.Label>Node label(s)</Form.Label>
        <Select
          className="form-control select"
          options={state.nodes}
          onChange={handleNodeLabelChange}
          isMulti={true}
          defaultValue={state.nodeLabel}
          name="nodeLabel"
        />
      </Form.Group>

      <Form.Group controlId="formLatitudeProperty">
        <Form.Label>Latitude property</Form.Label>
        <Select
          className="form-control select"
          options={state.propertyNames}
          onChange={handleLatPropertyChange}
          isMulti={false}
          defaultValue={state.latitudeProperty}
          name="latitudeProperty"
        />
      </Form.Group>

      <Form.Group controlId="formLongitudeProperty">
        <Form.Label>Longitude property</Form.Label>
        <Select
          className="form-control select"
          options={state.propertyNames}
          onChange={handleLonPropertyChange}
          isMulti={false}
          defaultValue={state.longitudeProperty}
          name="longitudeProperty"
        />
      </Form.Group>

      <Form.Group
        controlId="formTooltipProperty"
        hidden={state.rendering !== RENDERING_MARKERS && state.rendering !== RENDERING_CLUSTERS}
        name="formgroupTooltip"
      >
        <Form.Label>Tooltip property</Form.Label>
        <Select
          className="form-control select"
          options={state.propertyNames}
          onChange={handleTooltipPropertyChange}
          isMulti={false}
          defaultValue={state.tooltipProperty}
          name="tooltipProperty"
        />
      </Form.Group>

      <Form.Group controlId="formLimit">
        <Form.Label>Max. nodes</Form.Label>
        <Form.Control
          type="text"
          className="form-control"
          placeholder="limit"
          defaultValue={state.limit}
          onChange={handleLimitChange}
          name="limit"
        />
      </Form.Group>
    </div>
  );
});

export const PointLayerForm = React.memo(({
  state,
  handleNodeLabelChange,
  handleTooltipPropertyChange,
  handlePointPropertyChange,
  handleLimitChange
}) => {
  return (
    <div>
      <Form.Group controlId="formNodeLabel">
        <Form.Label>Node label(s)</Form.Label>
        <Select
          className="form-control select"
          options={state.nodes}
          onChange={handleNodeLabelChange}
          isMulti={true}
          defaultValue={state.nodeLabel}
          name="nodeLabel"
        />
      </Form.Group>

      <Form.Group controlId="formPointProperty">
        <Form.Label>Point property</Form.Label>
        <Select
          className="form-control select"
          options={state.propertyNames}
          onChange={handlePointPropertyChange}
          isMulti={false}
          defaultValue={state.pointProperty}
          name="pointProperty"
        />
      </Form.Group>

      <Form.Group
        controlId="formTooltipProperty"
        hidden={state.rendering !== RENDERING_MARKERS && state.rendering !== RENDERING_CLUSTERS}
        name="formgroupTooltip"
      >
        <Form.Label>Tooltip property</Form.Label>
        <Select
          className="form-control select"
          options={state.propertyNames}
          onChange={handleTooltipPropertyChange}
          isMulti={false}
          defaultValue={state.tooltipProperty}
          name="tooltipProperty"
        />
      </Form.Group>

      <Form.Group controlId="formLimit">
        <Form.Label>Max. nodes</Form.Label>
        <Form.Control
          type="text"
          className="form-control"
          placeholder="limit"
          defaultValue={state.limit}
          onChange={handleLimitChange}
          name="limit"
        />
      </Form.Group>
    </div>
  );
});

export const SpatialLayerForm = React.memo(({
  state,
  handleTooltipPropertyChange,
  handleSpatialLayerChanged
}) => {
  return (
    <div>
      <Form.Group controlId="formSpatialLayer">
        <Form.Label>Spatial layer</Form.Label>
        <Select
          className="form-control select"
          options={state.spatialLayers}
          onChange={handleSpatialLayerChanged}
          isMulti={false}
          defaultValue={state.spatialLayer}
          name="nodeLabel"
        />
      </Form.Group>
      <Form.Group
        controlId="formTooltipProperty"
        hidden={state.rendering !== RENDERING_MARKERS && state.rendering !== RENDERING_CLUSTERS}
        name="formgroupTooltip"
      >
        <Form.Label>Tooltip property</Form.Label>
        <Select
          className="form-control select"
          options={state.propertyNames}
          onChange={handleTooltipPropertyChange}
          isMulti={false}
          defaultValue={state.tooltipProperty.value}
          name="tooltipProperty"
        />
      </Form.Group>
    </div>
  )
});

export const CypherLayerForm = React.memo(({
  state,
  handleCypherChange
}) => {
  return (
    <Form.Group controlId="formCypher">
      <Form.Label>Query</Form.Label>
      <Form.Text>
        <p>Checkout <a href="https://github.com/stellasia/neomap/wiki" target="_blank" rel="noopener noreferrer" >the documentation</a> (Ctrl+SPACE for autocomplete)</p>
        <p className="font-italic">Be careful, the browser can only display a limited number of nodes (less than a few 10000)</p>
      </Form.Text>
      <CypherEditor
        value={state.cypher}
        onValueChange={handleCypherChange}
        name="cypher"
      />
    </Form.Group>
  );
});
