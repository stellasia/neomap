/**Layer definition.

   TODO: split into several files?
 */
import React, { Component } from 'react';
import Select from 'react-select'
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { Form, Button } from 'react-bootstrap';
import { CypherEditor } from "graph-app-kit/components/Editor"
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

// css needed for CypherEditor
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/hint/show-hint.css";
import "cypher-codemirror/dist/cypher-codemirror-syntax.css";


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


// layer type: either from node labels or cypher
const LAYER_TYPE_LATLON = "latlon";
const LAYER_TYPE_CYPHER = "cypher";

const RENDERING_MARKERS = "markers";
const RENDERING_HEATMAP = "heatmap";
const RENDERING_CLUSTERS = "clusters";


// default parameters for new layers
const DEFAULT_LAYER = {
    name: "New layer",
    layerType: LAYER_TYPE_LATLON,
    latitudeProperty: "latitude",
    longitudeProperty: "longitude",
    tooltipProperty: "name",
    nodeLabel: [],
    data: [],
    position: [],
    color: "blue",
    colorName: "Blue",
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

	// list of available nodes
	this.nodes = this.getNodes();

	this.sendData = this.sendData.bind(this);
	this.deleteLayer = this.deleteLayer.bind(this);
	this.showQuery = this.showQuery.bind(this);
	this.handleNameChange = this.handleNameChange.bind(this);
	this.handleLayerTypeChange = this.handleLayerTypeChange.bind(this);
	this.handleNodeLabelChange = this.handleNodeLabelChange.bind(this);
	this.handleLatPropertyChange = this.handleLatPropertyChange.bind(this);
	this.handleLonPropertyChange = this.handleLonPropertyChange.bind(this);
	this.handleTooltipPropertyChange = this.handleTooltipPropertyChange.bind(this);
	this.handleLimitChange = this.handleLimitChange.bind(this);
	this.handleColorChange = this.handleColorChange.bind(this);
	this.handleRenderingChange = this.handleRenderingChange.bind(this);
	this.handleRadiusChange = this.handleRadiusChange.bind(this);
	this.handleCypherChange = this.handleCypherChange.bind(this);

    };


    updatePosition() {
	/*Set the map center based on `this.state.data`
	 */
	var arr = this.state.data;
	var pos = [47, 3];
	if (arr.length > 0) {
	    var latMean = 0;
	    var lonMean = 0;
	    arr.map( (item, i) => {
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
	this.setState({position: pos}, function() {
	    this.props.sendData({
		ukey: this.state.ukey,
		layer: this.state
	    });
	});
    };


    getCypherQuery() {
	// TODO: check that the query is valid
	return this.state.cypher;
    };


    getQuery() {
	/*If layerType==cypher, query is inside the CypherEditor,
	   otherwise, we need to build the query manually.
	 */
	if (this.state.layerType === LAYER_TYPE_CYPHER)
	    return this.getCypherQuery();

	// lat lon query
	// TODO: improve this method...
	var query = "";
	query = 'MATCH (n) WHERE true';
	// filter wanted node labels
	if (this.state.nodeLabel.length > 0) {
	    var sub_q = "(false";
	    this.state.nodeLabel.forEach( (value, key) => {
		let lab = value.label;
		sub_q += ` OR n:${lab}`;
	    });
	    sub_q += ")";
	    query += "\nAND " + sub_q;
	}
	// filter out nodes with null latitude or longitude
	query += `\nAND n.${this.state.latitudeProperty} IS NOT NULL AND n.${this.state.longitudeProperty} IS NOT NULL`;
	// return latitude, longitude
	query += `\nRETURN n.${this.state.latitudeProperty} as latitude, n.${this.state.longitudeProperty} as longitude`;

	// if tooltip is not null, also return tooltip
	if (this.state.tooltipProperty !== '')
	    query += `, n.${this.state.tooltipProperty} as tooltip`;

	// TODO: is that really needed???
	// limit the number of points to avoid browser crash...
	query += `\nLIMIT ${this.state.limit}`;

	return query;
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
		if ((result.records === undefined) | (result.records.length === 0)) {
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
		    if (this.state.tooltipProperty && record.has("tooltip"))
			el["tooltip"] = record.get("tooltip");
		    res.push(el);
		});
		this.setState({data: res}, function() {this.updatePosition()});
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
		return;
	    });
    };


    handleNameChange(e) {
	this.setState({name: e.target.value});
    };


    handleLimitChange(e) {
	var new_value = e.target.value;
	if (new_value > LIMIT) {
	    if (
		window.confirm(
		    'Adding too many markers in likely to overload your browser. Continue anyway?'
		) === false
	    ) {
		return;
	    }
	}
	this.setState({limit: new_value});
    };


    handleLayerTypeChange(e) {
	var old_type = this.state.layerType;
	var new_type = e.target.value;
	if (old_type === new_type) {
	    return;
	}
	if (old_type === LAYER_TYPE_LATLON & new_type === LAYER_TYPE_CYPHER) {
	    this.setState({cypher: this.getQuery()});
	}
	else {
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


    handleLatPropertyChange(e) {
	this.setState({latitudeProperty: e.target.value});
    };


    handleLonPropertyChange(e) {
	this.setState({longitudeProperty: e.target.value});
    };


    handleNodeLabelChange(e) {
	this.setState({nodeLabel: e});
    };


    handleColorChange(e) {
	this.setState({
	    color: e.value,
	    colorName: e.label
	});
    };


    handleTooltipPropertyChange(e) {
	this.setState({tooltipProperty: e.target.value});
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

    getNodes() {
	/*This will be updated quite often,
	   is that what we want?

	   TODO: use apoc procedure for that, the query below can be quite loong...
	 */
	if (this.driver === undefined)
	    return [];

	var res = [];
	const session = this.driver.session();
	session
	    .run(
		`MATCH (n) WITH labels(n) as labs UNWIND labs as l RETURN distinct l as label`,
	    )
	    .then(function (result) {
		result.records.forEach(function (record) {
		    var el = {
			value:record.get("label"),
			label: record.get("label")
		    };
		    res.push(el);
		});
		session.close();
	    })
	    .catch(function (error) {
		console.log(error);
	    });
	return res;
    };


    renderConfigCypher() {
	/*If layerType==cypher, then we display the CypherEditor
	 */
	if (this.state.layerType !== LAYER_TYPE_CYPHER)
	    return ""
	return (
	    <Form.Group controlId="formCypher">
	    <Form.Label>Query</Form.Label>
	    <Form.Text>
	    <p>Checkout <a href="https://github.com/stellasia/neomap/wiki" target="_blank" rel="noopener noreferrer" >the documentation</a> (Ctrl+SPACE for autocomplete)</p>
	    </Form.Text>
	    <CypherEditor
	    value={this.state.cypher}
	    onValueChange={this.handleCypherChange}
	    name="cypher"
	    />
	    </Form.Group>
	)
    };


    renderConfigDefault() {
	/*If layerType==latlon, then we display the elements to choose
	   node labels and properties to be used.
	 */
	if (this.state.layerType !== LAYER_TYPE_LATLON)
	    return ""
	return (
	    <div>
	    <Form.Group controlId="formNodeLabel">
	    <Form.Label>Node label(s)</Form.Label>
	    <Select
	    className="form-control select"
	    options={this.nodes}
	    onChange={this.handleNodeLabelChange}
	    isMulti={true}
	    defaultValue={this.state.nodeLabel}
	    name="nodeLabel"
	    />
	    </Form.Group>

	    <Form.Group controlId="formLatitudeProperty">
	    <Form.Label>Latitude property</Form.Label>
	    <Form.Control
	    type="text"
	    className="form-control"
	    placeholder="latitude"
	    defaultValue={this.state.latitudeProperty}
	    onChange={this.handleLatPropertyChange}
	    name="latitudeProperty"
	    />
	    </Form.Group>

	    <Form.Group controlId="formLongitudeProperty">
	    <Form.Label>Longitude property</Form.Label>
	    <Form.Control
	    type="text"
	    className="form-control"
	    placeholder="longitude"
	    defaultValue={this.state.longitudeProperty}
	    onChange={this.handleLonPropertyChange}
	    name="longitudeProperty"
	    />
	    </Form.Group>

	    <Form.Group controlId="formLimit">
	    <Form.Label>Max. nodes</Form.Label>
	    <Form.Text>
	    <p>The browser can only display a limited number of nodes (less than a few 10000)</p>
	    </Form.Text>
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
	return (

	    <Card>

	    <Accordion.Toggle as={Card.Header} eventKey={this.state.ukey} >
	    <h3>{this.state.name}
	    <small hidden>({this.state.ukey})</small>
	    <span
	    hidden={this.state.rendering !== RENDERING_MARKERS}
	    style={{background: this.state.color, float: 'right'}}>
	    {this.state.colorName}
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
            id={ LAYER_TYPE_LATLON }
            label={ "Simple" }
            value={ LAYER_TYPE_LATLON }
            checked={this.state.layerType === LAYER_TYPE_LATLON}
	    onChange={this.handleLayerTypeChange}
	    name="layerTypeLatLon"
	    />
	    <Form.Check
            type="radio"
            id={ LAYER_TYPE_CYPHER }
            label={ "Advanced" }
            value={ LAYER_TYPE_CYPHER }
            checked={this.state.layerType === LAYER_TYPE_CYPHER}
	    onChange={this.handleLayerTypeChange}
	    name="layerTypeCypher"
	    />
	    </Form.Group>

	    {this.renderConfigDefault()}
	    {this.renderConfigCypher()}


	    <h4>  > Map rendering</h4>

	    <Form.Group controlId="formRendering">
	    <Form.Label>Rendering</Form.Label>
	    <Form.Check
            type="radio"
            id={ RENDERING_MARKERS }
            label={ "Markers" }
            value={ RENDERING_MARKERS }
            checked={this.state.rendering === RENDERING_MARKERS}
	    onChange={this.handleRenderingChange}
	    name="mapRenderingMarker"
	    />
	    <Form.Check
            type="radio"
            id={ RENDERING_HEATMAP }
            label={ "Heatmap" }
            value={ RENDERING_HEATMAP }
            checked={this.state.rendering === RENDERING_HEATMAP}
	    onChange={this.handleRenderingChange}
	    name="mapRenderingHeatmap"
	    />
	    <Form.Check
            type="radio"
            id={ RENDERING_CLUSTERS }
            label={ "Clusters (not implemented yet)" }
            value={ RENDERING_CLUSTERS }
            checked={this.state.rendering === RENDERING_CLUSTERS}
	    onChange={this.handleRenderingChange}
	    name="mapRenderingCluster"
	    disabled
	    />
	    </Form.Group>

	    <Form.Group controlId="formColor" hidden={this.state.rendering !== RENDERING_MARKERS} name="formgroupColor" >
	    <Form.Label>Color</Form.Label>
	    <Select
	    className="form-control select"
	    options={POSSIBLE_COLORS}
	    defaultValue={{value: this.state.color, label: this.state.colorName}}
	    onChange={this.handleColorChange}
	    name="color"
	    />
	    </Form.Group>

	    <Form.Group controlId="formTooltipProperty" hidden={this.state.rendering !== RENDERING_MARKERS}  name="formgroupTooltip">
	    <Form.Label>Tooltip property</Form.Label>
	    <Form.Control
	    type="text"
	    className="form-control"
	    placeholder="name"
	    defaultValue={this.state.tooltipProperty}
	    onChange={this.handleTooltipPropertyChange}
	    name="tooltipProperty"
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

	    <Button variant="success" type="submit"  onClick={this.showQuery} hidden={this.state.layerType !== LAYER_TYPE_LATLON}>
	    Show query
	    </Button>

	    <Button variant="info" type="submit"  onClick={this.sendData} >
	    Update map
	    </Button>

	    </Form>
	    </Card.Body>

	    </Accordion.Collapse>

	    </Card>

	);
    }
};


export default Layer;
