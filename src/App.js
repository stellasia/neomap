import React, { Component } from "react";
import neo4jService from './services/neo4jService'
import download from "downloadjs";
import { Map } from "./components/Map";
import { Menu } from "./components/Menu";
import { SideBar } from "./components/SideBar";
import "./App.css";


export class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			ready: false,
			layers: []
		};

		this.saveConfigToFile = this.saveConfigToFile.bind(this);
		this.loadConfigFromFile = this.loadConfigFromFile.bind(this);
		this.addLayer = this.addLayer.bind(this);
		this.updateLayer = this.updateLayer.bind(this);
		this.removeLayer = this.removeLayer.bind(this);
	};

	getDriver() {
		return neo4jService.getNeo4jDriver();
	}

	componentDidMount() {
		this.getDriver().then( result => {
			this.driver = result;
		}).then( () => {
			this.setState({
				ready: true,
			});
		});
	};

	addLayer(layer) {
		this.setState({ layers: [...this.state.layers, layer]});
	}

	updateLayer(layer) {
		const updatedLayers = this.state.layers.map(currentLayer => {
			if (currentLayer.key === layer.ukey) {
				return layer; // OR possibly { ...currentLayer, ...layer }
			}
			return currentLayer;
		});

		this.setState({ layers: updatedLayers });
	}

	removeLayer(key) {
		const filteredLayers = this.state.layers.filter(layer => layer.ukey !== key);

		this.setState({ layers: filteredLayers});
	}

	saveConfigToFile(e) {
		let config = JSON.stringify(this.props.layers);
		let fileName = "neomap_config.json";
		download(config, fileName, "application/json");
		e.preventDefault();
	};


	loadConfigFromFile(e) {
		const fileSelector = document.createElement('input');
		fileSelector.setAttribute('type', 'file');
		fileSelector.click();
		fileSelector.onchange = (ev) => {
			const file = ev.target.files[0];
			let fileReader = new FileReader();
			fileReader.onloadend = (e) => {
				const content = e.target.result;
				try {
					const loadedLayers = JSON.parse(content);
					this.setState({ layers: loadedLayers });
				} catch (err) {
					// TODO: Build error UI
					console.log('Failed to load and parse data from file', err);
				}
			};
			fileReader.readAsText(file);
		};
		e.preventDefault();
	};


	renderUI() {
		return (
			<div id="wrapper" className="row">
				<div id="sidebar" className="col-md-4">
					<Menu saveConfigToFile={this.saveConfigToFile} loadConfigFromFile={this.loadConfigFromFile} />
					<SideBar
						key="sidebar"
						ref="sidebar"
						driver = {this.driver}
						layers={this.state.layers}
						addLayer={this.addLayer}
						updateLayer={this.updateLayer}
						removeLayer={this.removeLayer}
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
		return this.state.ready ? this.renderUI() : (
			<span>Loading...</span>
		)
	};
}
