import React, { Component } from 'react';
import Select from 'react-select'
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';


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
    radius: 30
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
	this.handleNameChange = this.handleNameChange.bind(this);
	this.handleNodeLabelChange = this.handleNodeLabelChange.bind(this);
	this.handleLatPropertyChange = this.handleLatPropertyChange.bind(this);
	this.handleLonPropertyChange = this.handleLonPropertyChange.bind(this);
	this.handleTooltipPropertyChange = this.handleTooltipPropertyChange.bind(this);
	this.handleColorChange = this.handleColorChange.bind(this);
	this.handleRenderingChange = this.handleRenderingChange.bind(this);
	this.handleRadiusChange = this.handleRadiusChange.bind(this);

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


    updateData() {
	//return [];

	var res = [];
	const session = this.driver.session();
	var nodeLabel = this.state.nodeLabel.join("|");
	var query = "";
	if (nodeLabel !== "") {
	    query = `MATCH (n:${nodeLabel})`;
	} else {
	    query = 'MATCH (n)';
	}
	query += ` WHERE n.${this.state.latitudeProperty} IS NOT NULL AND n.${this.state.longitudeProperty} IS NOT NULL`;
	query += ` RETURN n.${this.state.latitudeProperty} as latitude, n.${this.state.longitudeProperty} as longitude`;

	if (this.state.tooltipProperty !== undefined)
	    query += `, n.${this.state.tooltipProperty} as tooltip`;
	query += ` LIMIT ${this.state.limit}`;

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
	if (e === null)
	    return null;
	var labels = [];
	e.map(function(label) {
	    labels.push(label.label);
	    return undefined;
	});
	this.setState({nodeLabel: labels});
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


    componentWillMount() {
	this.nodes = this.getNodes();
    }


    render() {
	var selectedNodes = [];
	this.nodes.map((value) => {
	    this.state.nodeLabel.map((value2) => {
		if (value.value === value2)
		    selectedNodes.push(value);
		return null
	    });
	    return null
	});

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

	    <div className="form-group">
	    <h5>Node label</h5>
	    <Select
	    className="form-control select"
	    options={this.nodes}
	    onChange={this.handleNodeLabelChange}
	    isMulti={true}
	    defaultValue={selectedNodes}
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
