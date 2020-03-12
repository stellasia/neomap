import React, {Component} from 'react'
import L from 'leaflet';
import 'leaflet.heat';

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
		this.leafletMarkerLayers = {};
		this.leafletHeatmapLayers = {};
	}
	componentDidUpdate() {
		let layers = Object.entries(this.props.layers);
		let globalBounds = new L.LatLngBounds();
		let ukeyMarkerArray = [];
		let ukeyHeatmapArray = [];
		// Iterate through layers
		layers.map(([, layer]) => {
			if (layer.ukey !== undefined) {
				globalBounds.extend(layer.bounds);
				if (layer.rendering === "markers") {
					ukeyMarkerArray.push(layer.ukey);
					if (!this.leafletMarkerLayers[layer.ukey]) {
						this.leafletMarkerLayers[layer.ukey] = L.layerGroup().addTo(this.map);
					}
					this.updateMarkerLayer(layer.data, layer.ukey);
				} else if (layer.rendering === "heatmap") {
					ukeyHeatmapArray.push(layer.ukey);
					if (this.leafletHeatmapLayers[layer.ukey]) {
						// todo find a way of updating the layer instead of delete & recreate
						this.map.removeLayer(this.leafletHeatmapLayers[layer.ukey]);
					}
					this.updateHeatmapLayer(layer.data, layer.radius, layer.ukey)
				}
			}
			return null;
		});
		// Check if globalBounds is defined
		if (!globalBounds.isValid())
			globalBounds = new L.LatLngBounds([[10,40],[50,90]]);
		// Find and clean deleted layers
		let deletedMarkerUkeyLayers = Object.keys(this.leafletMarkerLayers).filter(function(key) {
			return !ukeyMarkerArray.includes(key);
		});
		deletedMarkerUkeyLayers.map((key) => {
			this.map.removeLayer(this.leafletMarkerLayers[key]);
			return null;
		});
		let deletedHeatmapUkeyLayers = Object.keys(this.leafletHeatmapLayers).filter(function(key) {
			return !ukeyHeatmapArray.includes(key);
		});
		deletedHeatmapUkeyLayers.map((key) => {
			this.map.removeLayer(this.leafletHeatmapLayers[key]);
			return null;
		});
		this.map.flyToBounds(globalBounds);
	}
	updateMarkerLayer(data, ukey) {
		// todo check if the layer as change before rerendering it
		this.leafletMarkerLayers[ukey].clearLayers();
		let m = null;
		data.forEach(entry => {
			m = L.marker(
				entry.pos,
				{ title: entry.tooltip }
			).addTo(this.leafletMarkerLayers[ukey]);
			m.bindTooltip(entry.tooltip);
		});
	}
	updateHeatmapLayer(data, radius,  ukey) {
		// todo check if the layer as change before rerendering it
		let heatData = [];
		heatData = data.map((entry) => {
			return entry.pos.concat(1.0);
		});
		this.leafletHeatmapLayers[ukey] = L.heatLayer(heatData, {
			radius: radius,
			 minOpacity: 0.1,
			  blur: 15,
			   max: 10.0
			}).addTo(this.map);
		// this.leafletHeatmapLayers[ukey].setLatLngs(heatData);
		// this.leafletHeatmapLayers[ukey].setConfig({ radius });
	}
	render() {	
		return <div id="map"></div>;
	}
}

export default  Map;
