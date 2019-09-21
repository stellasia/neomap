import React, { Component } from "react";
import "./App.css";
import Map from "./components/Map";
import SideBar from "./components/SideBar";

const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js").v1;
const DEFAULT_DRIVER = {
    uri: "bolt://localhost:7687",
    user: "neo4j",
    password: "neo4j",
};

class App extends Component {

    constructor(props) {
	super(props);

	if (window.neo4jDesktopApi) {
	    window.neo4jDesktopApi.getContext().then((context) => {
		for (let project of context.projects) {
		    for (let graph of project.graphs) {
			if (graph.status === 'ACTIVE') {
			    console.log("Active graph is; " + graph.name + " (" + graph.description + ")");
			    let boltProtocol = graph.connection.configuration.protocols.bolt;
			    let driver = neo4j.driver(boltProtocol.url, neo4j.auth.basic(boltProtocol.username, boltProtocol.password));
			    this.driver = driver;
			}
		    }
		}
	    });
	} else {
	    this.driver = this.getDriver();
	}

	console.log(this.driver);
	this.state = {
	    layers: {},
	};
    };


    getDriver() {
	var uri = DEFAULT_DRIVER.uri;
	var usr = DEFAULT_DRIVER.user;
	var pwd = DEFAULT_DRIVER.password;
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


    renderUI() {
	return (
	    <div id="wrapper" className="row">
            <div id="sidebar" className="col-md-4">
            <SideBar
	    key="sidebar"
	    layersChanged = {this.layersChanged}
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


    render() {
	// wait until driver is ready...
	return this.driver ? this.renderUI() : (
	    <span>Loading wells...</span>
	)
    };
};


export default App;
