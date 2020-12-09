import React from 'react';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import { Button, Form } from 'react-bootstrap';
import { confirmAlert } from 'react-confirm-alert';
import { neo4jService } from '../services/neo4jService'
import {
  LayerTypeForm,
  MapRenderingForm,
  LatLonLayerForm,
  PointLayerForm,
  SpatialLayerForm,
  CypherLayerForm
} from './Layer.forms';

// Import css
import 'react-confirm-alert/src/react-confirm-alert.css';
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
  RENDERING_HEATMAP,
} from './constants';


export const Layer = React.memo(({ layer, addLayer, updateLayer, removeLayer }) => {

  const [state, setState] = React.useState(layer);

  const updateState = (update) => {
    const updatedState = { ...state, ...update };
    setState(updatedState);

    return updatedState;
  }

  React.useEffect(() => {
    const nodes = getNodes();
    const propertyNames = getPropertyNames(state.nodeLabels);
    const hasSpatialPlugin = checkSpatialPlugin();

    updateState({ nodes, propertyNames, hasSpatialPlugin })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (state.hasSpatialPlugin) {
      getSpatialLayers();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hasSpatialPlugin ])

  const checkSpatialPlugin = async () => {
    const { status, error, result:hasSpatialPlugin } = await neo4jService.hasSpatial();

    if (status === 200 && hasSpatialPlugin !== undefined) {
      return hasSpatialPlugin;
    } else {
      // TODO: Add Error UX. This should probably block creating/updating layer
      console.log(error);
      return false;
    }
  };

  const getSpatialLayers = async () => {
    const { status, error, result:spatialLayers } = await neo4jService.getSpatialLayers();

    if (status === 200 && spatialLayers !== undefined) {
      updateState({ spatialLayers });
    } else {
      // TODO: Add Error UX. This should probably block creating/updating layer
      console.log(error);
    }
  };

  const getNodes = async () => {
    // This will be updated quite often, is that what we want?
    const { status, error, result:nodes } = await neo4jService.getNodeLabels();

    if (status === 200 && nodes !== undefined) {
      return nodes
    } else {
      // TODO: Add Error UX. This should probably block creating/updating layer
      console.log(error);
      return;
    }
  };

  const getPropertyNames = async (nodeLabels) => {
    const { status, error, result:propertyNames } = await neo4jService.getProperties(getNodeFilter(nodeLabels));

    if (status === 200 && propertyNames !== undefined) {
      const defaultNoTooltip = { value: "", label: "" };

      return [...propertyNames, defaultNoTooltip];
    } else {
      // TODO: Add Error UX. This should probably block creating/updating layer
      console.log(error);
      return [];
    }
  };

  /**
   * Compute the map bounds based on proposaed state data
   * TODO: delegate this job to leaflet
   */
  const getBounds = (data) => {
    let minLat = Number.MAX_VALUE;
    let maxLat = -Number.MAX_VALUE;
    let minLon = Number.MAX_VALUE;
    let maxLon = -Number.MAX_VALUE;

    if (data.length > 0) {
      data.map((item,) => {
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

    return [[minLat, minLon], [maxLat, maxLon]];
  };

  const getNodeFilter = (nodeLabels) => {
    let filter = '';
    // filter wanted node labels
    // TODO: Revisit the sub query generator below
    if (nodeLabels !== null && nodeLabels.length > 0) {
      let sub_q = "(false";
      nodeLabels.forEach((value,) => {
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
    query += getNodeFilter(state.nodeLabels);
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

  const handleNodeLabelChange = (nodeLabel) => {
    const propertyNames = getPropertyNames([nodeLabel]); // TODO: Clarify disticntion between `nodeLabel` and `nodeLabels` in state!
    updateState({ nodeLabel, propertyNames });
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
    const { status, error, result:data } = await neo4jService.getData(getQuery(), {});

    if (status === 200 && data !== undefined) {
      updateLayer(updateState({ data, bounds: getBounds(data) }));

    } else {
      // TODO: Add Error UX. This should probably block creating/updating layer
      console.log(status, error);
      alert(`Status: ${status}, ${error.message}. Update layer failed`);
    }
  };

	/**
	 * Create a new Layer.
	 * Send data to parent which will propagate to the Map component
	 */
  const handleCreateLayer = async () => {
    const { status, error, result:data } = await neo4jService.getData(getQuery(), {});

    if (status === 200 && data !== undefined) {
      // TODO: Create new ukey for layer
      addLayer(updateState({ data, bounds: getBounds(data) }));

    } else {
      // TODO: Add Error UX. This should probably block creating/updating layer
      console.log(error, result);
      alert(`Status: ${status}, ${error.message}. Create new layer failed`);
    }
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


            <LayerTypeForm
              state={state}
              handleLayerTypeChange={handleLayerTypeChange}
            />

            {
              state.layerType === LAYER_TYPE_LATLON && (
                <LatLonLayerForm
                  state={state}
                  handleNodeLabelChange={handleNodeLabelChange}
                  handleLatPropertyChange={handleLatPropertyChange}
                  handleLonPropertyChange={handleLonPropertyChange}
                  handleTooltipPropertyChange={handleTooltipPropertyChange}
                  handleLimitChange={handleLimitChange}
                />
              )
            }
            {
              state.layerType === LAYER_TYPE_POINT && (
                <PointLayerForm
                  state={state}
                  handleNodeLabelChange={handleNodeLabelChange}
                  handleTooltipPropertyChange={handleTooltipPropertyChange}
                  handlePointPropertyChange={handlePointPropertyChange}
                  handleLimitChange={handleLimitChange}
                />
              )
            }
            {
              state.layerType === LAYER_TYPE_SPATIAL && (
                <SpatialLayerForm
                  state={state}
                  handleTooltipPropertyChange={handleTooltipPropertyChange}
                  handleSpatialLayerChanged={handleSpatialLayerChanged}
                />
              )
            }
            {
              state.layerType === LAYER_TYPE_CYPHER && (
                <CypherLayerForm
                  state={state}
                  handleCypherChange={handleCypherChange}
                />
              )
            }

            <MapRenderingForm
              state={state}
              handleRenderingChange={handleRenderingChange}
              handleColorChange={handleColorChange}
              handleRadiusChange={handleRadiusChange}
            />

            {state.ukey !== NEW_LAYER.ukey && (
              <Button variant="danger" onClick={handleDeleteLayer} hidden={layer === undefined}>
                Delete Layer
              </Button>
            )}

            <Button variant="info" onClick={handleShowQuery} hidden={state.layerType === LAYER_TYPE_CYPHER}>
              Show query
						</Button>

            <Button variant="success" onClick={handleUpdateLayer} >
              Update Layer
						</Button>

            <Button variant="success" onClick={handleCreateLayer} >
              Create New Layer
						</Button>

          </Form>
        </Card.Body>

      </Accordion.Collapse>

    </Card>

  );
});
