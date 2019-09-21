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

    constructor(props, context) {
	super(props, context);
	console.log(props);
	console.log(context);
	this.driver = props.driver || context.driver || this.getDriver();
	console.log(this.driver);


	if (window.neo4jDesktopApi) {
	    window.neo4jDesktopApi.getContext()
			   .then((context) => {
			       for (let project of context.projects) {
				   console.log("Project :: " + project.name);
				   for (let graph of project.graphs) {
				       console.log("  " + graph.name + " (" + graph.description + ")");
				       
				   }
			       }
			   }
			   );
	}
	
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


    componentWillMount() {
	console.log("App will mount");
	console.log(this.state);
	console.log(this.driver);
    }
    
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
