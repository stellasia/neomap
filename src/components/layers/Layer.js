/**Layer definition.

 TODO: split into several files?
 */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import Select from 'react-select'
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import {Button, Form} from 'react-bootstrap';
import {CypherEditor} from "graph-app-kit/components/Editor"
import {confirmAlert} from 'react-confirm-alert'; // Import
import neo4jService from '../../services/neo4jService'
import {addOrUpdateLayer, removeLayer} from "../../actions";


import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
// css needed for CypherEditor
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/hint/show-hint.css";
import "cypher-codemirror/dist/cypher-codemirror-syntax.css";
import ColorPicker from "../ColorPicker";


// layer type: either from node labels or cypher
const LAYER_TYPE_LATLON = "latlon";
const LAYER_TYPE_POINT = "point";
const LAYER_TYPE_CYPHER = "cypher";
const LAYER_TYPE_SPATIAL = "spatial";

// TODO: move this into a separate configuration/constants file
export const RENDERING_MARKERS = "markers";
export const RENDERING_POLYLINE = "polyline";
export const RENDERING_RELATIONS = "relations";
export const RENDERING_HEATMAP = "heatmap";
export const RENDERING_CLUSTERS = "clusters";


// default parameters for new layers
const DEFAULT_LAYER = {
	name: "New layer",
	layerType: LAYER_TYPE_LATLON,
	latitudeProperty: {value: "lat", label: "lat"},
	longitudeProperty: {value: "lon", label: "lon"},
	pointProperty: {value: "point", label: "point"},
	tooltipProperty: {value: "", label: ""},
	nodeLabel: [],
	propertyNames: [],
	spatialLayers: [],
	data: [],
	relations: [],
	bounds: [],
	color: {r: 0, g: 0, b: 255, a: 1},
	limit: null,
	rendering: RENDERING_MARKERS,
	radius: 30,
	cypher: "",
	// TODO: this should not be in Layer state?
	hasSpatialPlugin: false,
	spatialLayer: {value: "", label: ""},
};


export class UnconnectedLayer extends Component {

	constructor(props) {
		super(props);

		if (props.layer !== undefined) {
			this.state = props.layer;
		} else {
			this.state = DEFAULT_LAYER;
			this.state["ukey"] = props.ukey;
		}

		this.driver = props.driver;

		this.sendData = this.sendData.bind(this);
		this.deleteLayer = this.deleteLayer.bind(this);
		this.showQuery = this.showQuery.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
		this.handleLayerTypeChange = this.handleLayerTypeChange.bind(this);
		this.handleNodeLabelChange = this.handleNodeLabelChange.bind(this);
		this.handleLatPropertyChange = this.handleLatPropertyChange.bind(this);
		this.handleLonPropertyChange = this.handleLonPropertyChange.bind(this);
		this.handlePointPropertyChange = this.handlePointPropertyChange.bind(this);
		this.handleTooltipPropertyChange = this.handleTooltipPropertyChange.bind(this);
		this.handleLimitChange = this.handleLimitChange.bind(this);
		this.handleColorChange = this.handleColorChange.bind(this);
		this.handleRenderingChange = this.handleRenderingChange.bind(this);
		this.handleRadiusChange = this.handleRadiusChange.bind(this);
		this.handleCypherChange = this.handleCypherChange.bind(this);
		this.handleSpatialLayerChanged = this.handleSpatialLayerChanged.bind(this);

	};


	componentDidMount() {
		// list of available nodes
		this.getNodes();
		this.getPropertyNames();
		this.hasSpatialPlugin();
		this.getSpatialLayers();
		this.getRelations();
	}


	updateBounds() {
		/* Compute the map bounds based on `this.state.data`
         */
		let arr = this.state.data;
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
		this.setState({bounds: bounds}, function () {
			this.props.dispatch(
				addOrUpdateLayer({layer: this.state})
			);
		});
	};


	getCypherQuery() {
		// TODO: check that the query is valid
		return this.state.cypher;
	};


	getNodeFilter() {
		let filter = '';
		// filter wanted node labels
		if (this.state.nodeLabel !== null && this.state.nodeLabel.length > 0) {
			let sub_q = "(false";
			this.state.nodeLabel.forEach((value,) => {
				let lab = value.label;
				sub_q += ` OR n:${lab}`;
			});
			sub_q += ")";
			filter += "\nAND " + sub_q;
		}
		return filter;
	};


	getSpatialQuery() {
		let query = `CALL spatial.layer('${this.state.spatialLayer.value}') YIELD node `;
		query += "WITH node ";
		query += "MATCH (node)-[:RTREE_ROOT]-()-[:RTREE_CHILD*1..10]->()-[:RTREE_REFERENCE]-(n) ";
		query += "WHERE n.point.srid = 4326 ";
		query += "RETURN n.point.x as longitude, n.point.y as latitude ";
		if (this.state.tooltipProperty.value !== '')
			query += `, n.${this.state.tooltipProperty.value} as tooltip `;
		if (this.state.limit)
			query += `\nLIMIT ${this.state.limit}`;
		return query;
	};


	getQuery() {
		/*If layerType==cypher, query is inside the CypherEditor,
           otherwise, we need to build the query manually.
         */
		if (this.state.layerType === LAYER_TYPE_CYPHER)
			return this.getCypherQuery();

		if (this.state.layerType === LAYER_TYPE_SPATIAL)
			return this.getSpatialQuery();

		// lat lon query
		// TODO: improve this method...
		let query = 'MATCH (n) WHERE true';
		// filter wanted node labels
		query += this.getNodeFilter();
		// filter out nodes with null latitude or longitude
		if (this.state.layerType === LAYER_TYPE_LATLON) {
			query += `\nAND exists(n.${this.state.latitudeProperty.value}) AND exists(n.${this.state.longitudeProperty.value})`;
			// return latitude, longitude
			query += `\nRETURN n.${this.state.latitudeProperty.value} as latitude, n.${this.state.longitudeProperty.value} as longitude`;
		} else if (this.state.layerType === LAYER_TYPE_POINT) {
			query += `\nAND exists(n.${this.state.pointProperty.value})`;
			// return latitude, longitude
			query += `\nRETURN n.${this.state.pointProperty.value}.y as latitude, n.${this.state.pointProperty.value}.x as longitude`;
		}

		// if tooltip is not null, also return tooltip
		if (this.state.tooltipProperty.value !== '')
			query += `, n.${this.state.tooltipProperty.value} as tooltip`;

		// TODO: is that really needed???
		// limit the number of points to avoid browser crash...
		if (this.state.limit)
			query += `\nLIMIT ${this.state.limit}`;
		console.log(query)
		return query;
	};

	getRelations() {
		const query = "match (n)-[r]->(m) return n.lat as start_lat, n.lon as start_lon, m.lat as end_lat, m.lon as end_lon;";
		neo4jService.getRelationData(this.driver, query, {}).then( res => {
			if (res.status === "ERROR") {
				let message = "Invalid cypher query.";
				if (this.state.layerType !== LAYER_TYPE_CYPHER) {
					message += "\nContact the development team";
				} else {
					message += "\nFix your query and try again";
				}
				message += "\n\n" + res.result;
				alert(message);
			} else {
				this.setState({relations: res.result}, () => console.log('yo', res.result));
			}
		});
	}


	updateData() {
		/*Query database and update `this.state.data`
         */
		neo4jService.getData(this.driver, this.getQuery(), {}).then( res => {
			if (res.status === "ERROR") {
				let message = "Invalid cypher query.";
				if (this.state.layerType !== LAYER_TYPE_CYPHER) {
					message += "\nContact the development team";
				} else {
					message += "\nFix your query and try again";
				}
				message += "\n\n" + res.result;
				alert(message);
			} else {
				this.setState({data: res.result}, function () {
					this.updateBounds()
				});
			}
		});
	};


	handleNameChange(e) {
		this.setState({name: e.target.value});
	};


	handleLimitChange(e) {
		this.setState({limit: e.target.value});
	};


	handleLayerTypeChange(e) {
		let old_type = this.state.layerType;
		let new_type = e.target.value;
		if (old_type === new_type) {
			return;
		}
		if (new_type === LAYER_TYPE_CYPHER) {
			this.setState({cypher: this.getQuery()});
		} else if (old_type === LAYER_TYPE_CYPHER) {
			if (
				window.confirm(
					'You will lose your cypher query, is that what you want?'
				) === false
			) {
				return;
			}
			this.setState({cypher: ""});
		}
		this.setState({layerType: e.target.value});
	};


	handleLatPropertyChange(e) {
		this.setState({latitudeProperty: e});
	};


	handleLonPropertyChange(e) {
		this.setState({longitudeProperty: e});
	};


	handlePointPropertyChange(e) {
		this.setState({pointProperty: e});
	};


	handleTooltipPropertyChange(e) {
		this.setState({tooltipProperty: e});
	};


	handleNodeLabelChange(e) {
		this.setState({nodeLabel: e}, function() {
			this.getPropertyNames();
		});
	};


	handleColorChange(color) {
		this.setState({
			color: color,
		});
	};


	handleSpatialLayerChanged(e) {
		this.setState({
			spatialLayer: e,
		});
	};


	handleRenderingChange(e) {
		this.setState({rendering: e.target.value});
	};


	handleRadiusChange(e) {
		this.setState({radius: parseFloat(e.target.value)});
	};


	handleCypherChange(e) {
		this.setState({cypher: e});
	};


	sendData(event) {
		/*Send data to parent which will propagate to the Map component
         */
		this.updateData();
		event.preventDefault();
	};


	deleteLayer(event) {
		/*Remove the layer
         */
		event.preventDefault();
		if (
			window.confirm(
				`Delete layer ${this.state.name}? This action can not be undone.`
			) === false
		) {
			return;
		}
		this.props.dispatch(
			removeLayer({ukey: this.state.ukey})
		);
	};


	showQuery(event) {
		confirmAlert({
			message: this.getQuery(),
			buttons: [
				{
					label: 'OK',
				}
			]
		});
		event.preventDefault();
	};


	hasSpatialPlugin() {
		neo4jService.hasSpatial(this.driver).then(result => {
			this.setState({
				hasSpatialPlugin: result
			});
		});
	};


	getNodes() {
		/*This will be updated quite often,
           is that what we want?
         */
		neo4jService.getNodeLabels(this.driver).then( result => {
			this.setState({
				nodes: result
			})
		});
	};


	getPropertyNames() {
		neo4jService.getProperties(this.driver, this.getNodeFilter()).then( result => {
			result.push({value: "", label: ""}); // This is the default: no tooltip
			this.setState({propertyNames: result});
		});
	};


	getSpatialLayers() {
		neo4jService.getSpatialLayers(this.driver).then(result => {
			this.setState({spatialLayers: result});
		});
	};


	renderConfigSpatial() {
		if (this.state.layerType !== LAYER_TYPE_SPATIAL)
			return "";

		return (
			<div>
				<Form.Group controlId="formSpatialLayer">
					<Form.Label>Spatial layer</Form.Label>
					<Select
						className="form-control select"
						options={this.state.spatialLayers}
						onChange={this.handleSpatialLayerChanged}
						isMulti={false}
						defaultValue={this.state.spatialLayer}
						name="nodeLabel"
					/>
				</Form.Group>
				<Form.Group 
					controlId="formTooltipProperty" 
					hidden={this.state.rendering !== RENDERING_MARKERS && this.state.rendering !== RENDERING_CLUSTERS}  
					name="formgroupTooltip"
				>
					<Form.Label>Tooltip property</Form.Label>
					<Select
						className="form-control select"
						options={this.state.propertyNames}
						onChange={this.handleTooltipPropertyChange}
						isMulti={false}
						defaultValue={this.state.tooltipProperty.value}
						name="tooltipProperty"
					/>
				</Form.Group>
			</div>
		)
	};


	renderConfigCypher() {
		/*If layerType==cypher, then we display the CypherEditor
         */
		if (this.state.layerType !== LAYER_TYPE_CYPHER)
			return "";
		return (
			<Form.Group controlId="formCypher">
				<Form.Label>Query</Form.Label>
				<Form.Text>
					<p>Checkout <a href="https://github.com/stellasia/neomap/wiki" target="_blank" rel="noopener noreferrer" >the documentation</a> (Ctrl+SPACE for autocomplete)</p>
					<p className="font-italic">Be careful, the browser can only display a limited number of nodes (less than a few 10000)</p>
				</Form.Text>
				<CypherEditor
					value={this.state.cypher}
					onValueChange={this.handleCypherChange}
					name="cypher"
				/>
			</Form.Group>
		)
	};


	renderConfigPoint() {
		if (this.state.layerType !== LAYER_TYPE_POINT)
			return "";
		return (
			<div>
				<Form.Group controlId="formNodeLabel">
					<Form.Label>Node label(s)</Form.Label>
					<Select
						className="form-control select"
						options={this.state.nodes}
						onChange={this.handleNodeLabelChange}
						isMulti={true}
						defaultValue={this.state.nodeLabel}
						name="nodeLabel"
					/>
				</Form.Group>

				<Form.Group controlId="formPointProperty">
					<Form.Label>Point property</Form.Label>
					<Select
						className="form-control select"
						options={this.state.propertyNames}
						onChange={this.handlePointPropertyChange}
						isMulti={false}
						defaultValue={this.state.pointProperty}
						name="pointProperty"
					/>
				</Form.Group>

				<Form.Group
					controlId="formTooltipProperty"
					hidden={this.state.rendering !== RENDERING_MARKERS && this.state.rendering !== RENDERING_CLUSTERS}
					name="formgroupTooltip"
				>
					<Form.Label>Tooltip property</Form.Label>
					<Select
						className="form-control select"
						options={this.state.propertyNames}
						onChange={this.handleTooltipPropertyChange}
						isMulti={false}
						defaultValue={this.state.tooltipProperty}
						name="tooltipProperty"
					/>
				</Form.Group>

				<Form.Group controlId="formLimit">
					<Form.Label>Max. nodes</Form.Label>
					<Form.Control
						type="text"
						className="form-control"
						placeholder="limit"
						defaultValue={this.state.limit}
						onChange={this.handleLimitChange}
						name="limit"
					/>
				</Form.Group>
			</div>
		)
	}

  
	renderConfigDefault() {
		/*If layerType==latlon, then we display the elements to choose
           node labels and properties to be used.
         */
		if (this.state.layerType !== LAYER_TYPE_LATLON)
			return "";

		return (
			<div>
				<Form.Group controlId="formNodeLabel">
					<Form.Label>Node label(s)</Form.Label>
					<Select
						className="form-control select"
						options={this.state.nodes}
						onChange={this.handleNodeLabelChange}
						isMulti={true}
						defaultValue={this.state.nodeLabel}
						name="nodeLabel"
					/>
				</Form.Group>

				<Form.Group controlId="formLatitudeProperty">
					<Form.Label>Latitude property</Form.Label>
					<Select
						className="form-control select"
						options={this.state.propertyNames}
						onChange={this.handleLatPropertyChange}
						isMulti={false}
						defaultValue={this.state.latitudeProperty}
						name="latitudeProperty"
					/>
				</Form.Group>

				<Form.Group controlId="formLongitudeProperty">
					<Form.Label>Longitude property</Form.Label>
					<Select
						className="form-control select"
						options={this.state.propertyNames}
						onChange={this.handleLonPropertyChange}
						isMulti={false}
						defaultValue={this.state.longitudeProperty}
						name="longitudeProperty"
					/>
				</Form.Group>

				<Form.Group 
					controlId="formTooltipProperty" 
					hidden={this.state.rendering !== RENDERING_MARKERS  && this.state.rendering !== RENDERING_CLUSTERS}  
					name="formgroupTooltip"
				>
					<Form.Label>Tooltip property</Form.Label>
					<Select
						className="form-control select"
						options={this.state.propertyNames}
						onChange={this.handleTooltipPropertyChange}
						isMulti={false}
						defaultValue={this.state.tooltipProperty}
						name="tooltipProperty"
					/>
				</Form.Group>

				<Form.Group controlId="formLimit">
					<Form.Label>Max. nodes</Form.Label>
					<Form.Control
						type="text"
						className="form-control"
						placeholder="limit"
						defaultValue={this.state.limit}
						onChange={this.handleLimitChange}
						name="limit"
					/>
				</Form.Group>
			</div>
		)
	};


	render() {
		let color = `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`;

		return (

			<Card>

				<Accordion.Toggle as={Card.Header} eventKey={this.state.ukey} >
					<h3>{this.state.name}
						<small hidden>({this.state.ukey})</small>
						<span
							hidden={ this.state.rendering === RENDERING_HEATMAP }
							style={{background: color, float: 'right', height: '20px', width: '50px'}}> 
						</span>
					</h3>
				</Accordion.Toggle>

				<Accordion.Collapse eventKey={this.state.ukey} >

					<Card.Body>

						<Form action="" >

							<Form.Group controlId="formLayerName">
								<Form.Label>Name</Form.Label>
								<Form.Control
									type="text"
									className="form-control"
									placeholder="Layer name"
									defaultValue={this.state.name}
									onChange={this.handleNameChange}
									name="name"
								/>
							</Form.Group>


							<h4>  > Data</h4>

							<Form.Group controlId="formLayerType">
								<Form.Label>Layer type</Form.Label>
								<Form.Check
									type="radio"
									id={LAYER_TYPE_LATLON}
									label={"Lat/Lon"}
									value={LAYER_TYPE_LATLON}
									checked={this.state.layerType === LAYER_TYPE_LATLON}
									onChange={this.handleLayerTypeChange}
									name="layerTypeLatLon"
								/>
								<Form.Check
									type="radio"
									id={LAYER_TYPE_POINT}
									label={"Point (neo4j built-in)"}
									value={LAYER_TYPE_POINT}
									checked={this.state.layerType === LAYER_TYPE_POINT}
									onChange={this.handleLayerTypeChange}
									name="layerTypePoint"
								/>
								<Form.Check
									type="radio"
									id={LAYER_TYPE_SPATIAL}
									label={"Point (neo4j-spatial plugin)"}
									value={LAYER_TYPE_SPATIAL}
									checked={this.state.layerType === LAYER_TYPE_SPATIAL}
									onChange={this.handleLayerTypeChange}
									name="layerTypeSpatial"
									disabled={!this.state.hasSpatialPlugin}
									className="beta"
								/>
								<Form.Check
									type="radio"
									id={LAYER_TYPE_CYPHER}
									label={"Advanced (cypher query)"}
									value={LAYER_TYPE_CYPHER}
									checked={this.state.layerType === LAYER_TYPE_CYPHER}
									onChange={this.handleLayerTypeChange}
									name="layerTypeCypher"
								/>
							</Form.Group>

							{this.renderConfigDefault()}
							{this.renderConfigPoint()}
							{this.renderConfigCypher()}
							{this.renderConfigSpatial()}

							<h4> > Map rendering</h4>

							<Form.Group controlId="formRendering">
								<Form.Label>Rendering</Form.Label>
								<Form.Check
									type="radio"
									id={RENDERING_MARKERS}
									label={"Markers"}
									value={RENDERING_MARKERS}
									checked={this.state.rendering === RENDERING_MARKERS}
									onChange={this.handleRenderingChange}
									name="mapRenderingMarker"
								/>
								<Form.Check
									type="radio"
									id={RENDERING_POLYLINE}
									label={"Polyline"}
									value={RENDERING_POLYLINE}
									checked={this.state.rendering === RENDERING_POLYLINE}
									onChange={this.handleRenderingChange}
									name="mapRenderingPolyline"
								/>
								<Form.Check
									type="radio"
									id={RENDERING_HEATMAP}
									label={"Heatmap"}
									value={RENDERING_HEATMAP}
									checked={this.state.rendering === RENDERING_HEATMAP}
									onChange={this.handleRenderingChange}
									name="mapRenderingHeatmap"
									className="beta"
								/>
								<Form.Check
									type="radio"
									id={RENDERING_CLUSTERS}
									label={"Clusters"}
									value={RENDERING_CLUSTERS}
									checked={this.state.rendering === RENDERING_CLUSTERS}
									onChange={this.handleRenderingChange}
									name="mapRenderingCluster"
									className="beta"
								/>
							</Form.Group>

							<Form.Group controlId="formColor"
										hidden={this.state.rendering === RENDERING_HEATMAP}
										name="formgroupColor">
								<Form.Label>Color</Form.Label>
								<ColorPicker
									color={ this.state.color }
									handleColorChange={this.handleColorChange}
								/>
							</Form.Group>

							<Form.Group controlId="formRadius" hidden={this.state.rendering !== RENDERING_HEATMAP} >
								<Form.Label>Heatmap radius</Form.Label>
								<Form.Control
									type="range"
									min="1"
									max="100"
									defaultValue={this.state.radius}
									className="slider"
									onChange={this.handleRadiusChange}
									name="radius"
								/>
							</Form.Group>


							<Button variant="danger" type="submit"  onClick={this.deleteLayer} hidden={this.props.layer === undefined}>
								Delete Layer
							</Button>

							<Button variant="info" type="submit"  onClick={this.showQuery} hidden={this.state.layerType === LAYER_TYPE_CYPHER}>
								Show query
							</Button>

							<Button variant="success" type="submit"  onClick={this.sendData} >
								Update map
							</Button>

						</Form>
					</Card.Body>

				</Accordion.Collapse>

			</Card>

		);
	}
}

export default connect()(UnconnectedLayer);
