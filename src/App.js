import React, {Component} from "react";
import "./App.css";
import Map from "./components/Map";
import Menu from "./components/Menu";
import SideBar from "./components/SideBar";
import neo4jService from './services/neo4jService'
import download from "downloadjs";


class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			ready: false
		};

		this.saveConfigToFile = this.saveConfigToFile.bind(this);
		this.loadConfigFromFile = this.loadConfigFromFile.bind(this);
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


	saveConfigToFile(e) {
		let config = JSON.stringify(this.state.layers);
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
				const layers = JSON.parse(content);
				this.setState({layers: layers}, () => {
					this.refs.sidebar.forceUpdateLayers(layers);
				});
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
					/>
				</div>
				<div id="app-maparea" className="col-md-8">
					<Map
						key="map"
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


export default App;
