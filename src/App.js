import React from "react";
import download from "downloadjs";
import { Map } from "./components/Map";
import { Menu } from "./components/Menu";
import { SideBar } from "./components/SideBar";
import "./App.css";

export const App = React.memo(() => {
	const [ layers, setLayers ] = React.useState([]);

	const addLayer = (layer) => {
		setLayers([...layers, layer]);
	};

	const updateLayer = (layer) => {
		const updatedLayers = layers.map((currentLayer) => {
			if (currentLayer.ukey === layer.ukey) {
				return layer; // OR { ...currentLayer, ...layer }
			}
			return currentLayer;
		});

		setLayers(updatedLayers);
	};

	const removeLayer = (layerKey) => {
		const updatedLayers = layers.filter(layer => layer.ukey !== layerKey);

		setLayers(updatedLayers);
	};

	const saveConfigToFile = (e) => {
		let config = JSON.stringify(layers);
		let fileName = "neomap_config.json";
		download(config, fileName, "application/json");
		e.preventDefault();
	};

	const loadConfigFromFile = (e) => {
		const fileSelector = document.createElement('input');
		fileSelector.setAttribute('type', 'file');
		fileSelector.click();

		fileSelector.onchange = (ev) => {
			const file = ev.target.files[0];
			let fileReader = new FileReader();
			fileReader.onloadend = (e) => {
				const content = e.target.result;
				try {
					const loadedlayers = JSON.parse(content);
					setLayers(loadedlayers);
				} catch (err) {
					console.log('Failed to load and parse data from file', err.message);
				}
			};
			fileReader.readAsText(file);
		};

		e.preventDefault();
	};

	return (
		<div id="wrapper" className="row">
			<div id="sidebar" className="col-md-4">
				<Menu saveConfigToFile={saveConfigToFile} loadConfigFromFile={loadConfigFromFile} />
				<SideBar
					key="sidebar"
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
	);
});
