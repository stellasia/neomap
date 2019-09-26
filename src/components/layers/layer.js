/**Layer definition.

   TODO: split into several files?
*/
import React, { Component } from 'react';
import Select from 'react-select'
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { CypherEditor } from "graph-app-kit/components/Editor"

import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/hint/show-hint.css";
import "cypher-codemirror/dist/cypher-codemirror-syntax.css";



const LIMIT = 500;

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

const LAYER_TYPE_LATLON = 1;
const LAYER_TYPE_CYPHER = 2;
const LAYER_TYPE_SPATIAL = 3;

const DEFAULT_LAYER = {
    name: "New layer",
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
    layerType: LAYER_TYPE_LATLON,
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

	this.nodes = this.getNodes();
	
	this.sendData = this.sendData.bind(this);
	this.handleNameChange = this.handleNameChange.bind(this);
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


    getQuery() {
	if (this.state.layerType === LAYER_TYPE_CYPHER)
	    return this.state.cypher

	// lat lon query
	var query = "";
	query = 'MATCH (n) WHERE true';
	if (this.state.nodeLabel.length > 0) {
	    var sub_q = "(false";
	    this.state.nodeLabel.forEach( (value, key) => {
		let lab = value.label;
		sub_q += ` OR n:${lab}`;
	    });
	    sub_q += ")";
	    query += " AND " + sub_q;
	}
	query += ` AND n.${this.state.latitudeProperty} IS NOT NULL AND n.${this.state.longitudeProperty} IS NOT NULL`;
	query += ` RETURN n.${this.state.latitudeProperty} as latitude, n.${this.state.longitudeProperty} as longitude`;

	if (this.state.tooltipProperty !== undefined)
	    query += `, n.${this.state.tooltipProperty} as tooltip`;
	query += ` LIMIT ${this.state.limit}`;

	return query;
    };


    updateData() {
	// TODO: improve that method...
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
		    if (this.state.tooltipProperty)
			el["tooltip"] =record.get("tooltip");
		    res.push(el);
		});
		this.setState({data: res}, function() {this.updatePosition()});
		session.close();
	    })
	    .catch(function (error) {
		console.log(error);
	    });
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


    handleNameChange(e) {
	this.setState({name: e.target.value});
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
	if (e !== "")
	    this.setState({layerType: LAYER_TYPE_CYPHER});
	else
	    this.setState({layerType: LAYER_TYPE_LATLON});
	this.setState({cypher: e});
    };


    sendData(event) {
	this.updateData();
	event.preventDefault();
    };

    getNodes() {
	/*This will be updated quite often,
	   is that what we want?
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
	return (
	    <div className="form-group">
	    <h5>Query</h5>
	    <p className="help">Checkout the documentation</p>
	    <p className="help">(Ctrl+SPACE for autocomplete)</p>
	    <CypherEditor
	    value={this.state.cypher}
	    onValueChange={this.handleCypherChange}
	    />
	    </div>
	)
    };


    renderConfigDefault() {
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

	    <Tabs defaultActiveKey={this.state.layerType}>
	    <Tab eventKey={LAYER_TYPE_LATLON} title="Lat/lon">
	    {this.renderConfigDefault()}
	    </Tab>
	    <Tab eventKey={LAYER_TYPE_CYPHER} title="Cypher">
	    {this.renderConfigCypher()}
	    </Tab>
	    <Tab eventKey={LAYER_TYPE_SPATIAL} title="Spatial" disabled>
	    </Tab>
	    </Tabs>

	    <div className="form-group">
	    <h5>Color</h5>
	    <Select
	    className="form-control select"
	    options={POSSIBLE_COLORS}
	    defaultValue={{value: this.state.color, label: this.state.colorName}}
	    onChange={this.handleColorChange}
	    />
	    </div>

	    <div className="form-group">
	    <h5>Rendering</h5>
	    <div className="form-check">
	    <label className="">
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
	    Clusters
	    </label>
	    </div>

	    </div>

	    <div className="form-group" hidden={this.state.rendering !== "heatmap"}
	    >
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

	    <input type="submit" className="btn btn-info" value="Update map >" onClick={this.sendData} />

	    </form>

	    </Card.Body>

	    </Accordion.Collapse>

	    </Card>

	);
    }
};


export default Layer;
