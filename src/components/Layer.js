import React from 'react';
import Select from 'react-select'
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { Button, Form } from 'react-bootstrap';
import { CypherEditor } from "graph-app-kit/components/Editor"
import { confirmAlert } from 'react-confirm-alert'; // Import
import { neo4jService } from '../services/neo4jService'
import { ColorPicker } from "./ColorPicker";


import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
// css needed for CypherEditor
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/hint/show-hint.css";
import "cypher-codemirror/dist/cypher-codemirror-syntax.css";

import {
  NEW_LAYER,
  LAYER_TYPE_LATLON,
  LAYER_TYPE_POINT,
  LAYER_TYPE_CYPHER,
  LAYER_TYPE_SPATIAL,
  RENDERING_MARKERS,
  RENDERING_POLYLINE,
  RENDERING_HEATMAP,
  RENDERING_CLUSTERS
} from './constants';

/**
 * Layer definition.
 * TODO: split into several files?
 */
export const Layer = React.memo(({ layer, addLayer, updateLayer, removeLayer }) => {

  const [state, setState] = React.useState(layer);

  const updateState = (update, callback = undefined) => {
    setState({ ...state, ...update }, callback);
  }

  React.useEffect(() => {

    getNodes();
    getPropertyNames();
    hasSpatialPlugin();
    getSpatialLayers();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const hasSpatialPlugin = async () => {
    const { status, error, result } = await neo4jService.hasSpatial();

    if (status === 200 && result !== undefined) {
      updateState({ hasSpatialPlugin: result });
    } else {
      // TODO: Add Error UX. This should probably block creating/updating layer
      console.log(error);
    }
  };

  const getNodes = async () => {
    // This will be updated quite often, is that what we want?
    const { status, error, result } = await neo4jService.getNodeLabels();

    if (status === 200 && result !== undefined) {
      updateState({ nodes: result });
    } else {
      // TODO: Add Error UX. This should probably block creating/updating layer
      console.log(error);
    }
  };

  const getSpatialLayers = async () => {
    const { status, error, result } = await neo4jService.getSpatialLayers();

    if (status === 200 && result !== undefined) {
      updateState({ spatialLayers: result });
    } else {
      // TODO: Add Error UX. This should probably block creating/updating layer
      console.log(error);
    }
  };

  const getPropertyNames = async () => {
    const { status, error, result } = await neo4jService.getProperties(getNodeFilter());

    if (status === 200 && result !== undefined) {
      const defaultNoTooltip = { value: "", label: "" };
      updateState({ propertyNames: [...result, defaultNoTooltip] });
    } else {
      // TODO: Add Error UX. This should probably block creating/updating layer
      console.log(error);
    }
  };

  const updateBounds = () => {
		/* Compute the map bounds based on `state.data`
         */
    let arr = state.data || [];
    // TODO: delegate this job to leaflet
    let minLat = Number.MAX_VALUE;
    let maxLat = -Number.MAX_VALUE;
    let minLon = Number.MAX_VALUE;
    let maxLon = -Number.MAX_VALUE;
    if (arr.length > 0) {
      arr.map((item,) => {
        let lat = item.pos[0];
        let lon = item.pos[1];
        if (lat > maxLat) {
          maxLat = lat;
        }
        if (lat < minLat) {
          minLat = lat;
        }
        if (lon > maxLon) {
          maxLon = lon;
        }
        if (lon < minLon) {
          minLon = lon;
        }
        return undefined;
      });
    }
    let bounds = [[minLat, minLon], [maxLat, maxLon]];
    updateState({ bounds });
  };

  const getNodeFilter = () => {
    let filter = '';
    // filter wanted node labels
    if (state.nodeLabel !== null && state.nodeLabel.length > 0) {
      let sub_q = "(false";
      state.nodeLabel.forEach((value,) => {
        let lab = value.label;
        sub_q += ` OR n:${lab}`;
      });
      sub_q += ")";
      filter += "\nAND " + sub_q;
    }
    return filter;
  };


  const getSpatialQuery = () => {
    let query = `CALL spatial.layer('${state.spatialLayer.value}') YIELD node `;
    query += "WITH node ";
    query += "MATCH (node)-[:RTREE_ROOT]-()-[:RTREE_CHILD*1..10]->()-[:RTREE_REFERENCE]-(n) ";
    query += "WHERE n.point.srid = 4326 ";
    query += "RETURN n.point.x as longitude, n.point.y as latitude ";
    if (state.tooltipProperty.value !== '')
      query += `, n.${state.tooltipProperty.value} as tooltip `;
    if (state.limit)
      query += `\nLIMIT ${state.limit}`;
    return query;
  };


  const getQuery = () => {
		/*If layerType==cypher, query is inside the CypherEditor,
           otherwise, we need to build the query manually.
         */
    if (state.layerType === LAYER_TYPE_CYPHER)
      return getCypherQuery();

    if (state.layerType === LAYER_TYPE_SPATIAL)
      return getSpatialQuery();

    // lat lon query
    // TODO: improve this method...
    let query = 'MATCH (n) WHERE true';
    // filter wanted node labels
    query += getNodeFilter();
    // filter out nodes with null latitude or longitude
    if (state.layerType === LAYER_TYPE_LATLON) {
      query += `\nAND exists(n.${state.latitudeProperty.value}) AND exists(n.${state.longitudeProperty.value})`;
      // return latitude, longitude
      query += `\nRETURN n.${state.latitudeProperty.value} as latitude, n.${state.longitudeProperty.value} as longitude`;
    } else if (state.layerType === LAYER_TYPE_POINT) {
      query += `\nAND exists(n.${state.pointProperty.value})`;
      // return latitude, longitude
      query += `\nRETURN n.${state.pointProperty.value}.y as latitude, n.${state.pointProperty.value}.x as longitude`;
    }

    // if tooltip is not null, also return tooltip
    if (state.tooltipProperty.value !== '')
      query += `, n.${state.tooltipProperty.value} as tooltip`;

    // TODO: is that really needed???
    // limit the number of points to avoid browser crash...
    if (state.limit)
      query += `\nLIMIT ${state.limit}`;

    return query;
  };


  const updateData = async () => {
    const { status, error, result } = await neo4jService.getData(getQuery(), {});

    if (status === 200 && result !== undefined) {
      updateState({ data: result }, function () {
        updateBounds()
      });
    } else if (result) {
      // TODO: Add Error UX. This should probably block creating/updating layer
      console.log(error);

      let message = "Invalid cypher query.";
      if (state.layerType !== LAYER_TYPE_CYPHER) {
        message += "\nContact the development team";
      } else {
        message += "\nFix your query and try again";
      }
      message += "\n\n" + result;

      // TODO: Deprecate alert in favor of a less jarring error UX
      alert(message);
    }
  };

  const handleNameChange = (e) => {
    updateState({ name: e.target.value });
  };

  const handleLimitChange = (e) => {
    updateState({ limit: e.target.value });
  };

  const handleLayerTypeChange = (e) => {
    let old_type = state.layerType;
    let new_type = e.target.value;
    if (old_type === new_type) {
      return;
    }
    if (new_type === LAYER_TYPE_CYPHER) {
      updateState({ cypher: getQuery() });
    } else if (old_type === LAYER_TYPE_CYPHER) {
      if (
        window.confirm(
          'You will lose your cypher query, is that what you want?'
        ) === false
      ) {
        return;
      }
      updateState({ cypher: "" });
    }
    updateState({ layerType: e.target.value });
  };

  const handleLatPropertyChange = (e) => {
    updateState({ latitudeProperty: e });
  };

  const handleLonPropertyChange = (e) => {
    updateState({ longitudeProperty: e });
  };

  const handlePointPropertyChange = (e) => {
    updateState({ pointProperty: e });
  };

  const handleTooltipPropertyChange = (e) => {
    updateState({ tooltipProperty: e });
  };

  const handleNodeLabelChange = (e) => {
    updateState({ nodeLabel: e }, function () {
      getPropertyNames();
    });
  };

  const handleColorChange = (color) => {
    updateState({
      color: color,
    });
  };

  const handleSpatialLayerChanged = (e) => {
    updateState({
      spatialLayer: e,
    });
  };

  const handleRenderingChange = (e) => {
    updateState({ rendering: e.target.value });
  };

  const handleRadiusChange = (e) => {
    updateState({ radius: parseFloat(e.target.value) });
  };

  const handleCypherChange = (e) => {
    updateState({ cypher: e });
  };

	/**
	 * Update an existing Layer.
	 * Send data to parent which will propagate to the Map component
	 */
  const handleUpdateLayer = async () => {
    await updateData();
    updateLayer(state);
  };

	/**
	 * Create a new Layer.
	 * Send data to parent which will propagate to the Map component
	 */
  const handleCreateLayer = async () => {
    await updateData();
    // TODO: Create new ukey for layer
    addLayer(state);
  }

  const handleDeleteLayer = () => {
    if (
      // TODO: Use controlled overlay UI
      window.confirm(
        `Delete layer ${state.name}? This action can not be undone.`
      ) === false
    ) {
      return;
    }

    removeLayer(state.ukey);
  };

  const getCypherQuery = () => {
    // TODO: check that the query is valid
    return state.cypher;
  };

  const handleShowQuery = (event) => {
    confirmAlert({
      message: getQuery(),
      buttons: [
        {
          label: 'OK',
        }
      ]
    });
    event.preventDefault();
  };

  const renderConfigSpatial = () => {
    if (state.layerType !== LAYER_TYPE_SPATIAL)
      return "";

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
  };

  const renderConfigCypher = () => {
		/*If layerType==cypher, then we display the CypherEditor
         */
    if (state.layerType !== LAYER_TYPE_CYPHER)
      return "";
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
    )
  };

  const renderConfigPoint = () => {
    if (state.layerType !== LAYER_TYPE_POINT)
      return "";
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
    )
  }

  const renderConfigDefault = () => {
		/*If layerType==latlon, then we display the elements to choose
           node labels and properties to be used.
         */
    if (state.layerType !== LAYER_TYPE_LATLON)
      return "";

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
    )
  };

  const color = `rgba(${state.color.r}, ${state.color.g}, ${state.color.b}, ${state.color.a})`;

  return (

    <Card>

      <Accordion.Toggle as={Card.Header} eventKey={state.ukey} >
        <h3>{state.name}
          <small hidden>({state.ukey})</small>
          <span
            hidden={state.rendering === RENDERING_HEATMAP}
            style={{ background: color, float: 'right', height: '20px', width: '50px' }}>
          </span>
        </h3>
      </Accordion.Toggle>

      <Accordion.Collapse eventKey={state.ukey} >

        <Card.Body>

          <Form action="" >

            <Form.Group controlId="formLayerName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                className="form-control"
                placeholder="Layer name"
                defaultValue={state.name}
                onChange={handleNameChange}
                name="name"
              />
            </Form.Group>


            <h4>{'  > Data'}</h4>

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

            {renderConfigDefault()}
            {renderConfigPoint()}
            {renderConfigCypher()}
            {renderConfigSpatial()}

            <h4>{' > Map rendering'}</h4>

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


            {state.ukey !== NEW_LAYER.ukey && (
              <Button variant="danger" type="submit" onClick={handleDeleteLayer} hidden={layer === undefined}>
                Delete Layer
              </Button>
            )}

            <Button variant="info" type="submit" onClick={handleShowQuery} hidden={state.layerType === LAYER_TYPE_CYPHER}>
              Show query
						</Button>

            <Button variant="success" type="submit" onClick={handleUpdateLayer} >
              Update Layer
						</Button>

            <Button variant="success" type="submit" onClick={handleCreateLayer} >
              Create New Layer
						</Button>

          </Form>
        </Card.Body>

      </Accordion.Collapse>

    </Card>

  );
});
