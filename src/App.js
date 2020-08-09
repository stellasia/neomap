import React, { Component } from "react";
import download from "downloadjs";
import neo4jService from './services/neo4jService';
import { Map } from "./components/Map";
import { Menu } from "./components/Menu";
import { SideBar } from "./components/SideBar";
import { NEW_LAYER } from './components/Layer';
import "./App.css";

export class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			ready: false,
			layers: [ NEW_LAYER.ukey ]
		};

		this.layerStore = new Map([
			[ NEW_LAYER.ukey, NEW_LAYER ],
		]);

		
		this.saveConfigToFile = this.saveConfigToFile.bind(this);
		this.loadConfigFromFile = this.loadConfigFromFile.bind(this);
	};

	//#region layer reducers
	setLayers(layers) {
		this.layerStore.clear();

		layers.forEach(layer => {
			this.layerStore.set(layer.ukey, layer);
		})
		
		this.setState({ layers: this.layerStore.keys() });
	}

	addOrUpdateLayer(layer) {
		this.layerStore.set(layer.ukey, layer);	

		this.setState({ layers: this.layerStore.keys() });
	};

	removeLayer(layerKey) {
		this.layerStore.delete(layerKey);

		this.setState({ layers: this.layerStore.keys() });
	};
	//#endregion

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
					const layers = JSON.parse(content);
					this.setLayers(layers);
				} catch (err) {
					console.log('Failed to load and parse data from file', err.message);
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
