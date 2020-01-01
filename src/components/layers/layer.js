/**Layer definition.
 */
import React, {Component} from 'react';
import Select from 'react-select'
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import {Button, Form} from 'react-bootstrap';
import {confirmAlert} from 'react-confirm-alert';
import SimpleLayer from './simpleLayer';
import CypherLayer from './cypherLayer';
import SpatialLayer from "./spatialLayer";
import {
	LAYER_TYPE_CYPHER,
	LAYER_TYPE_LATLON,
	LAYER_TYPE_SPATIAL,
	RENDERING_CLUSTERS,
	RENDERING_HEATMAP,
	RENDERING_MARKERS
} from "../../constants"
// css
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/hint/show-hint.css";
import "cypher-codemirror/dist/cypher-codemirror-syntax.css";
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

// maximum number of points to show
const LIMIT = 2000;

// marker colors
const POSSIBLE_COLORS = [
	{value: "blue", label: "Blue"},
	{value: "red", label: "Red"},
	{value: "green", label: "Green"},
	{value: "orange", label: "Orange"},
	{value: "yellow", label: "Yellow"},
	{value: "violet", label: "Violet"},
	{value: "grey", label: "Grey"},
	{value: "black", label: "Black"}
];

// default parameters for new layers
const DEFAULT_LAYER = {
	name: "New layer",
	layerType: LAYER_TYPE_LATLON,
	data: [],
	position: [],
	color: {value: "blue", label: "Blue"},
	limit: LIMIT,
	rendering: RENDERING_MARKERS,
	radius: 30,
	cypher: ""
};


class Layer extends Component {

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
		this.handleLimitChange = this.handleLimitChange.bind(this);
		this.handleColorChange = this.handleColorChange.bind(this);
		this.handleRenderingChange = this.handleRenderingChange.bind(this);
		this.handleRadiusChange = this.handleRadiusChange.bind(this);
		this.renderDataConfig = this.renderDataConfig.bind(this);

		this.dataConf = React.createRef();

	};


	updatePosition() {
		/*Set the map center based on `this.state.data`
         */
		var arr = this.state.data;
		var pos = [47, 3];
		if (arr.length > 0) {
			var latMean = 0;
			var lonMean = 0;
			arr.map((item, i) => {
				var lat = item.pos[0];
				var lon = item.pos[1];
				latMean += parseFloat(lat);
				lonMean += parseFloat(lon);
				return undefined;
			});
			latMean = latMean / arr.length;
			lonMean = lonMean / arr.length;
			pos = [latMean, lonMean];
		}
		this.setState({position: pos}, function () {
			this.props.sendData({
				ukey: this.state.ukey,
				layer: this.state
			});
		});
	};


	getQuery() {
		return this.dataConf.current.getQuery();
	};


	updateData() {
		/*Query database and update `this.state.data`
         */
		var res = [];
		const session = this.driver.session();

		var query = this.getQuery();

		var params = {};
		session
			.run(
				query, params
			)
			.then(result => {
				if ((result.records === undefined) || (result.records.length === 0)) {
					alert("No result found, please check your query");
					return;
				}
				result.records.forEach(record => {
					var el = {
						pos: [
							record.get("latitude"),
							record.get("longitude")
						],
					};
					if (this.state.tooltipProperty.value && record.has("tooltip"))
						el["tooltip"] = record.get("tooltip");
					res.push(el);
				});
				this.setState({data: res}, function () {
					this.updatePosition()
				});
				session.close();
			})
			.catch(error => {
				console.log(error);
				var message = "Invalid cypher query.";
				if (this.state.layerType === LAYER_TYPE_LATLON) {
					message += "\nContact the development team";
				} else {
					message += "\nFix your query and try again";
				}
				message += "\n\n" + error;
				alert(message);
			});
	};


	handleNameChange(e) {
		this.setState({name: e.target.value});
	};


	handleLimitChange(e) {
		this.setState({limit: e.target.value});
	};


	handleLayerTypeChange(e) {
		var old_type = this.state.layerType;
		var new_type = e.target.value;
		if (old_type === new_type) {
			return;
		}
		if (new_type === LAYER_TYPE_CYPHER) {
			this.setState({cypher: this.getQuery()});
		} else if (old_type === LAYER_TYPE_CYPHER) {
			if (
				window.confirm(
					'You will loose your cypher query, is that what you want?'
				) === false
			) {
				return;
			}
			this.setState({cypher: ""});
		}
		this.setState({layerType: e.target.value});
	};


	handleColorChange(e) {
		this.setState({
			color: e,
		});
	};


	handleRenderingChange(e) {
		this.setState({rendering: e.target.value});
	};


	handleRadiusChange(e) {
		this.setState({radius: parseFloat(e.target.value)});
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
		this.props.deleteLayer(this.state.ukey);
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


	renderDataConfig() {
		if (this.state.layerType === LAYER_TYPE_LATLON)
			return (
				<SimpleLayer
					driver={this.driver}
					limit={this.state.limit}
					rendering={this.state.rendering}
					ref={this.dataConf}
				/>
			);
		if (this.state.layerType === LAYER_TYPE_CYPHER)
			return (
				<CypherLayer
					driver={this.driver}
					initQuery={this.state.cypher}
					ref={this.dataConf}
				/>
			);
		if (this.state.layerType === LAYER_TYPE_SPATIAL)
			return (
				<SpatialLayer
					driver={this.driver}
					limit={this.state.limit}
					rendering={this.state.rendering}
					ref={this.dataConf}
				/>
			);
	};


	render() {
		return (

			<Card>

				<Accordion.Toggle as={Card.Header} eventKey={this.state.ukey}>
					<h3>{this.state.name}
						<small hidden>({this.state.ukey})</small>
						<span
							hidden={this.state.rendering !== RENDERING_MARKERS}
							style={{background: this.state.color.value, float: 'right'}}
						>{this.state.color.label}</span>
					</h3>
				</Accordion.Toggle>

				<Accordion.Collapse eventKey={this.state.ukey}>

					<Card.Body>

						<Form action="">

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


							<h4> > Data</h4>

							<Form.Group controlId="formLayerType">
								<Form.Label>Layer type</Form.Label>
								<Form.Check
									type="radio"
									id={LAYER_TYPE_LATLON}
									label={"Simple"}
									value={LAYER_TYPE_LATLON}
									checked={this.state.layerType === LAYER_TYPE_LATLON}
									onChange={this.handleLayerTypeChange}
									name="layerTypeLatLon"
								/>
								<Form.Check
									type="radio"
									id={LAYER_TYPE_CYPHER}
									label={"Advanced"}
									value={LAYER_TYPE_CYPHER}
									checked={this.state.layerType === LAYER_TYPE_CYPHER}
									onChange={this.handleLayerTypeChange}
									name="layerTypeCypher"
								/>
								<Form.Check
									type="radio"
									id={LAYER_TYPE_SPATIAL}
									label={"Spatial"}
									value={LAYER_TYPE_SPATIAL}
									checked={this.state.layerType === LAYER_TYPE_SPATIAL}
									// hidden={this.state.spatialLayers === undefined }
									onChange={this.handleLayerTypeChange}
									name="layerTypeSpatial"
								/>
							</Form.Group>

							{this.renderDataConfig()}

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
									id={RENDERING_HEATMAP}
									label={"Heatmap"}
									value={RENDERING_HEATMAP}
									checked={this.state.rendering === RENDERING_HEATMAP}
									onChange={this.handleRenderingChange}
									name="mapRenderingHeatmap"
								/>
								<Form.Check
									type="radio"
									id={RENDERING_CLUSTERS}
									label={"Clusters (not implemented yet)"}
									value={RENDERING_CLUSTERS}
									checked={this.state.rendering === RENDERING_CLUSTERS}
									onChange={this.handleRenderingChange}
									name="mapRenderingCluster"
									disabled
								/>
							</Form.Group>

							<Form.Group controlId="formColor" hidden={this.state.rendering !== RENDERING_MARKERS}
										name="formgroupColor">
								<Form.Label>Color</Form.Label>
								<Select
									className="form-control select"
									options={POSSIBLE_COLORS}
									defaultValue={this.state.color}
									onChange={this.handleColorChange}
									name="color"
								/>
							</Form.Group>

							<Form.Group controlId="formRadius" hidden={this.state.rendering !== RENDERING_HEATMAP}>
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


							<Button variant="danger" type="submit" onClick={this.deleteLayer}
									hidden={this.props.layer === undefined}>
								Delete Layer
							</Button>

							<Button variant="info" type="submit" onClick={this.showQuery}
									hidden={this.state.layerType === LAYER_TYPE_CYPHER}>
								Show query
							</Button>

							<Button variant="success" type="submit" onClick={this.sendData}>
								Update map
							</Button>

						</Form>
					</Card.Body>

				</Accordion.Collapse>

			</Card>

		);
	}
}


export default Layer;
