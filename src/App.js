import React from "react";
import download from "downloadjs";
import { Map } from "./components/Map";
import { Menu } from "./components/Menu";
import { SideBar } from "./components/SideBar";
import "./App.css";
import {neo4jService} from "./services/neo4jService";


export const App = React.memo(() => {

	const [layers, setLayers] = React.useState([]);
	const [ready, setReady] = React.useState(false);

	// we have to make sure the Neo4j driver is created BEFORE rendering
	neo4jService._getNeo4jDriver().then(result => {
		console.log(result);
		if (result !== undefined) {
			setReady(true);
		}
	});

	const addLayer = (layer) => {
		setLayers([...layers, layer]);
	}

	const updateLayer = (layer) => {
		const updatedLayers = layers.map(currentLayer => {
			if (currentLayer.key === layer.ukey) {
				return layer;
			}
			return currentLayer;
		});

		setLayers(updatedLayers);
	}

	const removeLayer = (key) => {
		const filteredLayers = layers.filter(layer => layer.ukey !== key);

		setLayers(filteredLayers);
	}

	const saveConfigToFile = (e) => {
		const config = JSON.stringify(layers);
		const fileName = "neomap_config.json";
		download(config, fileName, "application/json");
		e.preventDefault();
	};

	const loadConfigFromFile = (e) => {
		const fileSelector = document.createElement('input');
		fileSelector.setAttribute('type', 'file');
		fileSelector.click();
		fileSelector.onchange = (ev) => {
			const file = ev.target.files[0];
			const fileReader = new FileReader();
			fileReader.onloadend = (e) => {
				const content = e.target.result;
				try {
					const loadedLayers = JSON.parse(content);
					setLayers(loadedLayers);
				} catch (err) {
					// TODO: Build error UI
					console.log('Failed to load and parse data from file', err);
				}
			};
			fileReader.readAsText(file);
		};
		e.preventDefault();
	};

	if (ready) {
		return (
			<div id="wrapper" className="row">
				<div id="sidebar" className="col-md-4">
					<Menu saveConfigToFile={saveConfigToFile} loadConfigFromFile={loadConfigFromFile}/>
					<SideBar
						layers={layers}
						addLayer={addLayer}
						updateLayer={updateLayer}
						removeLayer={removeLayer}
					/>
				</div>
				<div id="app-maparea" className="col-md-8">
					<Map
						key="map"
						layers={layers}
					/>
				</div>
			</div>
		)
	}
	else {
		return (<span>Loading...</span>)
	}
});
