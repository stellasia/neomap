import React, {Component} from 'react'
import L from 'leaflet';

class Map extends Component {

	componentDidMount() {
		// init an empty map
		this.map = L.map('map', {
			center: [49.8419, 24.0315],
			zoom: 4,
			layers: [
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			}),
			]
		});
		this.leafletLayers = {};
	}
	componentDidUpdate() {
		let layers = Object.entries(this.props.layers);
		let globalBounds = new L.LatLngBounds();
		let ukeyArray = [];
		// Iterate through layers
		layers.map(([, layer]) => {
			if (layer.ukey !== undefined) {
				ukeyArray.push(layer.ukey);
				globalBounds.extend(layer.bounds);
				if (layer.rendering === "markers") {
					if (!this.leafletLayers[layer.ukey]) {
						this.leafletLayers[layer.ukey] = L.layerGroup().addTo(this.map);
					}
					this.updateMarkerLayer(layer.data, layer.ukey);
				}
			}
			return null;
		});
		// Check if globalBounds is defined
		if (!globalBounds.isValid())
			globalBounds = new L.LatLngBounds([[10,40],[50,90]]);
		// Find and clean deleted layers
		let deletedUkeyLayers = Object.keys(this.leafletLayers).filter(function(key) {
			return !ukeyArray.includes(key);
		});
		deletedUkeyLayers.map((key) => {
			this.map.removeLayer(this.leafletLayers[key]);
			return null;
		});
		this.map.flyToBounds(globalBounds);
	}
	updateMarkerLayer(data, ukey) {
		// todo check if the layer as change before rerendering it
		this.leafletLayers[ukey].clearLayers();
		let m = null;
		data.forEach(entry => {
			m = L.marker(
				entry.pos,
				{ title: entry.tooltip }
			).addTo(this.leafletLayers[ukey]);
			m.bindTooltip(entry.tooltip);
		});
	}
	render() {	
		return <div id="map"></div>;
	}
}

export default  Map;
