/* Main map component based on leaflet map.
 *
 *
 */
import React, {Component} from 'react'
import {connect} from 'react-redux';
import {RENDERING_CLUSTERS, RENDERING_HEATMAP, RENDERING_MARKERS, RENDERING_POLYLINE, RENDERING_RELATIONS} from "./layers/Layer";
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';


export class UnconnectedMap extends Component {

	componentDidMount() {
		// init an empty map
		this.map = L.map('map', {
			preferCanvas: true,
			center: [0, 0],
			zoom: 2,
			layers: [
				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				}),
			]
		});

		this.leafletMarkerLayers = {};
		this.leafletPolylineLayers = {};
		this.leafletHeatmapLayers = {};
		this.leafletClusterLayers = {};
		this.layerControl = null;
	}


	componentDidUpdate() {
		let layers = this.props.layers;
		let globalBounds = new L.LatLngBounds();
		let ukeyMarkerArray = [];
		let ukeyPolylineArray = [];
		let ukeyHeatmapArray = [];
		let ukeyClusterArray = [];
		// TODO
		
		// Iterate through layers
		layers.map((layer) => {
			if (layer.ukey === undefined)
				return null;
			let bds = new L.LatLngBounds(layer.bounds);
			if (bds.isValid())
				globalBounds.extend(bds);
			if (layer.rendering === RENDERING_MARKERS) {
				ukeyMarkerArray.push(layer.ukey);
				if (!this.leafletMarkerLayers[layer.ukey]) {
					this.leafletMarkerLayers[layer.ukey] = L.layerGroup().addTo(this.map);
				}
				this.updateMarkerLayer(layer.data, layer.color, layer.ukey);
			} else if (layer.rendering === RENDERING_POLYLINE) {
				ukeyPolylineArray.push(layer.ukey);
				if (this.leafletPolylineLayers[layer.ukey]) {
					// todo find a way of updating the polyline layer instead of delete & recreate
					this.map.removeLayer(this.leafletPolylineLayers[layer.ukey]);
				}
				this.updatePolylineLayer(layer.data, layer.color, layer.ukey);
			} else if (layer.rendering === RENDERING_RELATIONS) {
				ukeyPolylineArray.push(layer.ukey);
				if (this.leafletPolylineLayers[layer.ukey]) {
					// todo find a way of updating the polyline layer instead of delete & recreate
					this.map.removeLayer(this.leafletPolylineLayers[layer.ukey]);
				}
				this.updateRelationsLayer(layer.data, layer.relations, layer.color, layer.ukey);
			} else if (layer.rendering === RENDERING_HEATMAP) {
				ukeyHeatmapArray.push(layer.ukey);
				if (this.leafletHeatmapLayers[layer.ukey]) {
					// todo find a way of updating the heat layer instead of delete & recreate
					this.map.removeLayer(this.leafletHeatmapLayers[layer.ukey]);
				}
				this.updateHeatmapLayer(layer.data, layer.radius, layer.ukey);
			} else if (layer.rendering === RENDERING_CLUSTERS) {
				ukeyClusterArray.push(layer.ukey);
				if (!this.leafletClusterLayers[layer.ukey]) {
					this.leafletClusterLayers[layer.ukey] = L.markerClusterGroup();
					this.map.addLayer(this.leafletClusterLayers[layer.ukey]);
				}
				this.updateClusterLayer(layer.data, layer.color, layer.ukey);
			}
			return null;
		});
		// Check if globalBounds is defined
		if (!globalBounds.isValid())
			globalBounds = new L.LatLngBounds([[90, -180], [-90, 180]]);
		// Find and clean deleted layers
		let deletedMarkerUkeyLayers = Object.keys(this.leafletMarkerLayers).filter(function(key) {
			return !ukeyMarkerArray.includes(key);
		});
		deletedMarkerUkeyLayers.map((key) => {
			this.map.removeLayer(this.leafletMarkerLayers[key]);
			delete this.leafletMarkerLayers[key];
			return null;
		});
		let deletedPolylineUkeyLayers = Object.keys(this.leafletPolylineLayers).filter(function (key) {
			return !ukeyPolylineArray.includes(key);
		});
		deletedPolylineUkeyLayers.map((key) => {
			this.map.removeLayer(this.leafletPolylineLayers[key]);
			delete this.leafletPolylineLayers[key];
			return null;
		});
		let deletedHeatmapUkeyLayers = Object.keys(this.leafletHeatmapLayers).filter(function (key) {
			return !ukeyHeatmapArray.includes(key);
		});
		deletedHeatmapUkeyLayers.map((key) => {
			this.map.removeLayer(this.leafletHeatmapLayers[key]);
			delete this.leafletHeatmapLayers[key];
			return null;
		});
		let deletedClusterUkeyLayers = Object.keys(this.leafletClusterLayers).filter(function (key) {
			return !ukeyClusterArray.includes(key);
		});
		deletedClusterUkeyLayers.map((key) => {
			this.map.removeLayer(this.leafletClusterLayers[key]);
			delete this.leafletClusterLayers[key];
			return null;
		});
		this.map.flyToBounds(globalBounds);
		this.updateLayerControl();
	}

	updateLayerControl() {
		if (this.layerControl) {
			this.layerControl.remove(this.map);
		}
		var overlayMaps = {};
		this.props.layers.map(l => {
			switch (l.rendering) {
				case RENDERING_MARKERS:
					overlayMaps[l.name] = this.leafletMarkerLayers[l.ukey];
					break;
				case RENDERING_HEATMAP:
					overlayMaps[l.name] = this.leafletHeatmapLayers[l.ukey];
					break;
				case RENDERING_CLUSTERS:
					overlayMaps[l.name] = this.leafletClusterLayers[l.ukey];
					break;
				case RENDERING_POLYLINE:
					overlayMaps[l.name] = this.leafletPolylineLayers[l.ukey];
					break;
				default:
					break;
			}
			return null;
		});
		this.layerControl = L.control.layers([], overlayMaps);
		this.layerControl.addTo(this.map);
	}

	updateMarkerLayer(data, color, ukey) {
		// todo check if the layer has changed before rerendering it
		this.leafletMarkerLayers[ukey].clearLayers();
		let m = null;
		let rgbColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
		data.forEach(entry => {
			m = L.circleMarker(
				entry.pos,
				{
					title: entry.tooltip,
					fill: true,
					radius: 5,
					color: rgbColor,
					fillColor: rgbColor,
					opacity: color.a,
					fillOpacity: color.a
				}
			).addTo(this.leafletMarkerLayers[ukey]);
			if (entry.tooltip !== undefined)
				m.bindPopup(entry.tooltip);
		});
	}


	updatePolylineLayer(data, color, ukey) {
		// todo check if the layer has changed before rerendering it
		// this.leafletLayers[ukey].clearLayers();
		let rgbColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
		let polylineData = data.map((entry) => {
			return entry.pos;
		});
		this.leafletPolylineLayers[ukey] = L.polyline(polylineData, {color: rgbColor}).addTo(this.map);
		// this.leafletPolylineLayers[ukey].setLatLngs(polylineData);
		// this.leafletPolylineLayers[ukey].setConfig??({ color });
	}

	updateRelationsLayer(data, relations_data, color, ukey) {
		// todo check if the layer has changed before rerendering it
		// this.leafletLayers[ukey].clearLayers();
		let rgbColor = 'rgb(150, 150, 255)';
		for (let i = 0; i < relations_data.length; i++) {
			this.leafletPolylineLayers[ukey] = L.polyline([relations_data[i].start, relations_data[i].end], {color: rgbColor}).addTo(this.map);
		}
		
		// this.leafletPolylineLayers[ukey].clearLayers();
		let m = null;
		data.forEach(entry => {
			m = L.circleMarker(
				entry.pos,
				{
					title: entry.tooltip,
					fill: true,
					radius: 2,
					color: `rgb(${color.r}, ${color.g}, ${color.b})`,
					fillColor: rgbColor,
					opacity: color.a,
					fillOpacity: color.a
				}
			).addTo(this.map);
			if (entry.tooltip !== undefined)
				m.bindPopup(entry.tooltip);
		});
		
		
		// L.polyline(polylineData, {color: rgbColor}).addTo(this.map);
		// this.leafletPolylineLayers[ukey].setLatLngs(polylineData);
		// this.leafletPolylineLayers[ukey].setConfig??({ color });
	}


	updateHeatmapLayer(data, radius,  ukey) {
		// todo check if the layer has changed before rerendering it
		let heatData = data.map((entry) => {
			return entry.pos.concat(1.0);
		});
		this.leafletHeatmapLayers[ukey] = L.heatLayer(heatData, {
			radius: radius,
			minOpacity: 0.1,
			blur: 15,
			max: 10.0
		}).addTo(this.map);
	}


	updateClusterLayer(data, color, ukey) {
		// todo check if the layer has changed before rerendering it
		this.leafletClusterLayers[ukey].clearLayers();
		let m = null;
		let rgbColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
		data.forEach(entry => {
			m = L.circleMarker(entry.pos,{
				title: entry.tooltip,
				fill: true,
				radius: 5,
				color: rgbColor,
				fillColor: rgbColor,
				opacity: color.a,
				fillOpacity: color.a
			});
			if (entry.tooltip !== undefined)
				m.bindPopup(entry.tooltip);
			this.leafletClusterLayers[ukey].addLayer(m);
		});
	}


	render() {
		return (
			<div id="map">
				text that will be replaced by the map
			</div>
		);
	}
}


const mapStateToProps = (state, ownProps) => {
	return {
		layers: state.layers,
		...ownProps
	}
};


export default connect(mapStateToProps)(UnconnectedMap);
