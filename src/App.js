import React, {Component} from "react";
import "./App.css";
import Map from "./components/Map";
import SideBar from "./components/SideBar";

const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js");
const DEFAULT_DRIVER = {
	uri: "bolt://localhost:7687",
	user: "neo4j",
	password: "neo4j",
};


const neo4jDesktopApi = window.neo4jDesktopApi;

class App extends Component {

	constructor(props) {
		super(props);

		/*Get connection to the active graph

           TODO: what happens if the active graph changes?
        */
		if (window.neo4jDesktopApi) {
			neo4jDesktopApi.getContext().then((context) => {
				for (let project of context.projects) {
					for (let graph of project.graphs) {
						if (graph.status === 'ACTIVE') {
							console.log("Active graph is; " + graph.name + " (" + graph.description + ")");
							let boltProtocol = graph.connection.configuration.protocols.bolt;
							let driver = neo4j.v1.driver(
								boltProtocol.url,
								neo4j.v1.auth.basic(boltProtocol.username, boltProtocol.password)
							);
							this.driver = driver;
						}
					}
				}
			});
		} else {
			this.driver = this.getDriver();
		}

		//console.log(this.driver);

		this.state = {
			layers: {},
		};

		this.layersChanged = this.layersChanged.bind(this);

	};


	getDriver() {
		/*Get a default driver based on hard coded credential above
           TODO: remove or make this configurable through env vars or...
        */
		var uri = DEFAULT_DRIVER.uri;
		var usr = DEFAULT_DRIVER.user;
		var pwd = DEFAULT_DRIVER.password;
		return neo4j.v1.driver(
			uri,
			neo4j.v1.auth.basic(
				usr,
				pwd
			)
		);
	};


	layersChanged(childData) {
		/* Something changed in the layer definition,
           need to update map
        */
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
						layersChanged={this.layersChanged}
						layers={this.state.layers}
						driver={this.driver}
					/>
				</div>
				<div id="app-maparea" className="col-md-8">
					<Map
						key="map"
						layers={this.state.layers}
					/>
				</div>
			</div>
		);
	};


	render() {
		// wait until driver is ready...
		return this.driver ? this.renderUI() : (
			<span>Loading...</span>
		)
	};
}


export default App;
