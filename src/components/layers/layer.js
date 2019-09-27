/**Layer definition.

   TODO: split into several files?
*/
import React, { Component } from 'react';
import Select from 'react-select'
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import { CypherEditor } from "graph-app-kit/components/Editor"

// css needed for CypherEditor
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/hint/show-hint.css";
import "cypher-codemirror/dist/cypher-codemirror-syntax.css";


// maximum number of points to show
const LIMIT = 500;

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
    rendering: "markers",
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
	this.handleNameChange = this.handleNameChange.bind(this);
	this.handleLayerTypeChange = this.handleLayerTypeChange.bind(this);
	this.handleNodeLabelChange = this.handleNodeLabelChange.bind(this);
	this.handleLatPropertyChange = this.handleLatPropertyChange.bind(this);
	this.handleLonPropertyChange = this.handleLonPropertyChange.bind(this);
	this.handleTooltipPropertyChange = this.handleTooltipPropertyChange.bind(this);
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
	    query += " AND " + sub_q;
	}
	// filter out nodes with null latitude or longitude
	query += ` AND n.${this.state.latitudeProperty} IS NOT NULL AND n.${this.state.longitudeProperty} IS NOT NULL`;
	// return latitude, longitude
	query += ` RETURN n.${this.state.latitudeProperty} as latitude, n.${this.state.longitudeProperty} as longitude`;

	// if tooltip is not null, also return tooltip
	if (this.state.tooltipProperty !== undefined)
	    query += `, n.${this.state.tooltipProperty} as tooltip`;

	// TODO: is that really needed???
	// limit the number of points to avoid browser crash...
	query += ` LIMIT ${this.state.limit}`;

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
	    .catch(function (error) {
		console.log(error);
	    });
    };


    handleNameChange(e) {
	this.setState({name: e.target.value});
    };


    handleLayerTypeChange(e) {
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
	this.setState({color: e.value});
    };


    handleTooltipPropertyChange(e) {
	this.setState({tooltipProperty: e.value});
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
	this.props.deleteLayer(this.state.ukey);
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
	    <div className="form-group">
	    <h5>Query</h5>
	    <p className="help">Checkout <a href="https://github.com/stellasia/neomap/wiki" target="_blank" rel="noopener noreferrer" >the documentation</a></p>
	    <p className="help">(Ctrl+SPACE for autocomplete)</p>
	    <CypherEditor
	    value={this.state.cypher}
	    onValueChange={this.handleCypherChange}
	    />
	    </div>
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
	    <div className="form-group">
	    <h5>Node label</h5>
	    <Select
	    className="form-control select"
	    options={this.nodes}
	    onChange={this.handleNodeLabelChange}
	    isMulti={true}
	    defaultValue={this.state.nodeLabel}
	    />
	    </div>

	    <div className="form-group">
	    <h5>Latitude property</h5>
	    <input
	    type="text"
	    className="form-control"
	    placeholder="latitude"
	    defaultValue={this.state.latitudeProperty}
	    onChange={this.handleLatPropertyChange}
	    />
	    </div>

	    <div className="form-group">
	    <h5>Longitude property</h5>
	    <input
	    type="text"
	    className="form-control"
	    placeholder="longitude"
	    defaultValue={this.state.longitudeProperty}
	    onChange={this.handleLonPropertyChange}
	    />
	    </div>

	    <div className="form-group">
	    <h5>Tooltip property</h5>
	    <input
	    type="text"
	    className="form-control"
	    placeholder="Property used for tooltip"
	    defaultValue={this.state.tooltipProperty}
	    onChange={this.handleTooltipPropertyChange}
	    />
	    </div>
	    </div>
	)
    };


    render() {
	return (

	    <Card>

	    <Accordion.Toggle as={Card.Header} eventKey="{this.state.ukey}" >
	    <h3>{this.state.name} <small>({this.state.ukey})</small></h3>
	    </Accordion.Toggle>

	    <Accordion.Collapse eventKey="{this.state.ukey}" >

	    <Card.Body>

	    <form action="" >

	    <div className="form-group">
	    <h5>Name</h5>
	    <input
	    type="text"
	    className="form-control"
	    placeholder="Layer name"
	    defaultValue={this.state.name}
	    onChange={this.handleNameChange}
	    />
	    </div>

	    <h4>  > Data</h4>

	    <div className="form-group">
	    <h5>Layer type</h5>
	    <div className="form-check">
	    <label>
	    <input
            type="radio"
            name="layerType"
            value={LAYER_TYPE_LATLON}
            checked={this.state.layerType === LAYER_TYPE_LATLON}
            className="form-check-input"
	    onChange={this.handleLayerTypeChange}
	    />
	    Simple
	    </label>
	    </div>

	    <div className="form-check">
	    <label>
	    <input
            type="radio"
            name="layerType"
            value={LAYER_TYPE_CYPHER}
            checked={this.state.layerType === LAYER_TYPE_CYPHER}
            className="form-check-input"
	    onChange={this.handleLayerTypeChange}
	    />
	    Advanced
	    </label>
	    </div>
	    </div>

	    {this.renderConfigDefault()}
	    {this.renderConfigCypher()}


	    <h4>  > Map rendering</h4>

	    <div className="form-group">
	    <h5>Rendering</h5>
	    <div className="form-check">
	    <label>
	    <input
            type="radio"
            name="rendering"
            value="markers"
            checked={this.state.rendering === "markers"}
            className="form-check-input"
	    onChange={this.handleRenderingChange}
	    />
	    Markers
	    </label>
	    </div>

	    <div className="form-check">
	    <label className="">
	    <input
            type="radio"
            name="rendering"
            value="heatmap"
            checked={this.state.rendering === "heatmap"}
            className="form-check-input"
	    onChange={this.handleRenderingChange}
	    />
	    Heatmap
	    </label>
	    </div>

	    <div className="form-check">
	    <label className="disabled">
	    <input
            type="radio"
            name="rendering"
            value="cluster"
            checked={this.state.rendering === "clusters"}
            className="form-check-input"
	    disabled={true}
	    onChange={this.handleRenderingChange}
	    />
	    Clusters (not implemted yet)
	    </label>
	    </div>

	    </div>

	    <div className="form-group" hidden={this.state.rendering !== "markers"}>
	    <h5>Color</h5>
	    <Select
	    className="form-control select"
	    options={POSSIBLE_COLORS}
	    defaultValue={{value: this.state.color, label: this.state.colorName}}
	    onChange={this.handleColorChange}
	    />
	    </div>

	    <div className="form-group" hidden={this.state.rendering !== "heatmap"}>
	    <h5>Heatmap radius</h5>
	    <input
	    type="range"
	    min="1"
	    max="100"
	    name="radius"
	    defaultValue={this.state.radius}
	    className="slider"
	    onChange={this.handleRadiusChange}
	    />
	    </div>

	    <input type="submit" className="btn btn-danger" value="Delete layer" onClick={this.deleteLayer} hidden={this.props.layer === undefined} />
	    <input type="submit" className="btn btn-info" value="Update map >" onClick={this.sendData} />

	    </form>

	    </Card.Body>

	    </Accordion.Collapse>

	    </Card>

	);
    }
};


export default Layer;
