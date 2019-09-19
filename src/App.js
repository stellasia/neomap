import React, { Component } from "react";
import "./App.css";
import Map from "./components/Map";
import SideBar from "./components/SideBar";

const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js").v1;


class App extends Component {

    constructor(props, context) {
	super(props, context);
	this.driver = props.driver || context.driver || this.getDriver();

	this.state = {
	    layers: {},
	};
    };


    getDriver() {
	var uri = process.env.REACT_APP_NEO4J_URI; // || "bolt://localhost:7687";
	var usr = process.env.REACT_APP_NEO4J_USER;
	var pwd = process.env.REACT_APP_NEO4J_PASSWORD;
	return neo4j.driver(
	    uri,
	    neo4j.auth.basic(
		usr,
		pwd
	    )
	);
    };


    layersChanged = (childData) => {
	this.setState({
	    layers: childData.layers
	});
    };


    render() {
	return (
	    <div id="wrapper" className="row">
            <div id="sidebar" className="col-md-4">
            <SideBar
	    key="sidebar"
	    layersChanged = {this.layersChanged}
	    //nodes = {this.state.nodes}
	    layers = {this.state.layers}
	    driver = {this.driver}
            />
            </div>
            <div id="app-maparea" className="col-md-8">
            <Map
	    key="map"
	    layers = {this.state.layers}
            />
            </div>
            </div>
	);
    };
};


export default App;
