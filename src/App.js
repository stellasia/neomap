import React, { Component } from "react";
import "./App.css";
import Map from "./components/Map";
import SideBar from "./components/SideBar";
import neo4jService from './services/neo4jService'


class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			layers: {},
			ready: false
		};

		this.layersChanged = this.layersChanged.bind(this);

	};

	getDriver() {
		let driver = neo4jService.getNeo4jDriver();
		return driver;
	}

	componentDidMount() {
		this.getDriver().then( result => {
			this.driver = result;
		}).then( () => {
			this.setState({
				ready: true,
			});
		});
	}

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
		return this.state.ready ? this.renderUI() : (
			<span>Loading...</span>
		)
	};
};


export default App;
